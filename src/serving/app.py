from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np

# 1. Expanded Schema (Matches what the model expects)
class ChurnRequest(BaseModel):
    industry: str
    country: str
    referral_source: str
    plan_tier: str
    seats: int
    seats_sub: int
    mrr_amount: float
    signup_date: str
    is_trial: bool = False
    billing_frequency: str = "Monthly"
    auto_renew_flag: bool = True  # Added missing flags
    upgrade_flag: bool = False
    downgrade_flag: bool = False

app = FastAPI(title="Project Anchor: 90% Accuracy API")

# Load artifacts
model = joblib.load("models/model.pkl")
explainer = joblib.load("models/explainer.pkl")

@app.get("/")
def get_model():
    return {
        "status" : "online",
        "model":"Anchor production"
    }

@app.post("/predict")
def predict(request: ChurnRequest):
    # 1. Convert to dict
    data = request.model_dump()
    
    # 2. THE MAPPING STEP: Match the 'suffixes=(_acc, _sub)' names
    # This maps your clean API names to the "Training DNA" names
    aligned_data = {
        "industry": data["industry"],
        "country": data["country"],
        "referral_source": data["referral_source"],
        "plan_tier_acc": data["plan_tier"], # Renamed
        "seats_acc": data["seats"],         # Renamed
        "is_trial_acc": data["is_trial"],   # Renamed
        "billing_frequency": data["billing_frequency"],
        "seats_sub": data["seats_sub"],
        "mrr_amount": data["mrr_amount"],
        "plan_tier_sub": data["plan_tier"],
        "is_trial_sub": data["is_trial"],
        "auto_renew_flag": data["auto_renew_flag"],
        "upgrade_flag": data["upgrade_flag"],
        "downgrade_flag": data["downgrade_flag"],
        "arr_amount": data["mrr_amount"] * 12 # Approximation for missing column
    }

    # 3. Create DataFrame and add Engineered Features
    X = pd.DataFrame([aligned_data])
    current_date = pd.to_datetime('2026-03-29')
    signup_dt = pd.to_datetime(data["signup_date"])
    
    X['tenure_days'] = (current_date - signup_dt).dt.days
    X['mrr_per_seat'] = data['mrr_amount'] / (data['seats_sub'] + 1e-6)
    X['seat_growth_ratio'] = data['seats_sub'] / (data['seats'] + 1e-6)

    # 4. Handle "Junk" features the model is demanding
    # We fill these with dummy values because they shouldn't influence the result
    for col in model.feature_name_:
        if col not in X.columns:
            X[col] = 0 

    # 5. Final Alignment & Type Casting
    X = X[model.feature_name_] # Force exact order
    
    cat_features = model.booster_.pandas_categorical
    for col in X.columns:
        if col in cat_features:
            X[col] = X[col].astype('category')
        else:
            X[col] = pd.to_numeric(X[col], errors='coerce')

    # 6. Inference
    probability = model.predict_proba(X)[0][1]
    
    # SHAP Explanation logic
    shap_values = explainer.shap_values(X)
    vals = shap_values[1][0] if isinstance(shap_values, list) else shap_values[0]
    
    top_drivers = sorted(dict(zip(X.columns, vals)).items(), key=lambda x: abs(x[1]), reverse=True)[:3]

    return {
        "churn_probability": round(float(probability), 4),
        "is_churn_risk": bool(probability > 0.5),
        "top_drivers": {k: round(float(v), 4) for k, v in top_drivers}
    }