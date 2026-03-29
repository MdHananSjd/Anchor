from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

#we're defining what the API expects (local schema)

class ChurnRequest(BaseModel):
    industry: str
    country: str
    referral_source: str
    plan_tier: str
    seats: int
    seats_sub: int
    mrr_amount: float
    signup_date: str #year-month-date format
    is_trial: bool = False
    billing_frequency: str = "Monthly"

#initializing fastapi
app = FastAPI(title="Project Anchor: Churn Prediction API")

#Loading model and explainer at stratup
MODEL_PATH = "models/model.pkl"
EXPLAINER_PATH = "models/explainer.pkl"

try:
    model = joblib.load(MODEL_PATH)
    explainer = joblib.load(EXPLAINER_PATH)
    print("model and explainer loaded successfully")
except Exception as e:
    print(f"Error loading artifacts: {e}")

@app.get("/")
def read_root():
    return {
        "status" : "online",
        "model_version": "90.28_accuracy"
    }

@app.post("/predict")
@app.post("/predict")
def predict(request: ChurnRequest):
    
    input_df = pd.DataFrame([request.model_dump()])

    # feature engineering
    current_date = pd.to_datetime('2026-03-29')
    input_df['signup_date'] = pd.to_datetime(input_df['signup_date'])
    
    input_df['tenure_days'] = (current_date - input_df['signup_date']).dt.days
    input_df['mrr_per_seat'] = input_df['mrr_amount'] / (input_df['seats_sub'] + 1e-6)
    input_df['seat_growth_ratio'] = input_df['seats_sub'] / (input_df['seats'] + 1e-6)
    
    # driopping non-feature columns
    cols_to_drop = ['signup_date', 'account_id', 'account_name']
    X = input_df.drop(columns=[c for c in cols_to_drop if c in input_df.columns])

    #matching our input X with the categorical features of the model
    expected_features = model.feature_name_
    
    X = X[expected_features]

    # Identify categorical columns from training
    # LightGBM stores this in its booster metadata
    cat_features = model.booster_.pandas_categorical
    
    for col in expected_features:
        if col in cat_features:
            X[col] = X[col].astype('category')
        else:
     
            X[col] = pd.to_numeric(X[col], errors='coerce')

    try:
        probability = model.predict_proba(X)[0][1]
        prediction = int(probability > 0.5)
        
        #SHAP 
        shap_values = explainer.shap_values(X)
        
        if isinstance(shap_values, list):
            vals = shap_values[1][0] 
        else:
            vals = shap_values[0]
            
        feature_importance = dict(zip(X.columns, vals))
        top_drivers = sorted(feature_importance.items(), key=lambda x: abs(x[1]), reverse=True)[:3]

        return {
            "churn_probability": round(float(probability), 4),
            "is_churn_risk": bool(prediction),
            "top_drivers": {k: round(float(v), 4) for k, v in top_drivers}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference Error: {str(e)}")