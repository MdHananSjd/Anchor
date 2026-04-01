from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import traceback
import os
from pandas.api.types import CategoricalDtype

#pydantic schema
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
    auto_renew_flag: bool = True
    upgrade_flag: bool = False
    downgrade_flag: bool = False

app = FastAPI(title="Project Anchor: Ultra-Robust API")

#loading the model and the explainer files
try:
    model = joblib.load("models/model.pkl")
    explainer = joblib.load("models/explainer.pkl")
    print("System Online: Categorical Alignment Active.")
except Exception as e:
    print(f"Load Error: {e}")

@app.get("/")
def health():
    return {
        "server": "online",
        "status": "ready"
    }

@app.post("/predict")
def predict(request: ChurnRequest):
    try:
        data = request.model_dump()
        
        #Map API data to Training DNA (The _acc and _sub suffixes)
        aligned_data = {
            "industry": data.get("industry"),
            "country": data.get("country"),
            "referral_source": data.get("referral_source"),
            "plan_tier_acc": data.get("plan_tier"),
            "seats_acc": data.get("seats"),
            "is_trial_acc": data.get("is_trial"),
            "billing_frequency": data.get("billing_frequency"),
            "seats_sub": data.get("seats_sub"),
            "mrr_amount": data.get("mrr_amount"),
            "plan_tier_sub": data.get("plan_tier"),
            "is_trial_sub": data.get("is_trial"),
            "auto_renew_flag": data.get("auto_renew_flag"),
            "upgrade_flag": data.get("upgrade_flag"),
            "downgrade_flag": data.get("downgrade_flag"),
            "arr_amount": data.get("mrr_amount", 0) * 12
        }

        #Build DataFrame and Engineered Features
        X = pd.DataFrame([aligned_data])
        current_date = pd.to_datetime('2026-03-29')
        signup_dt = pd.to_datetime(data["signup_date"])
        X['tenure_days'] = (current_date - signup_dt).days 
        X['mrr_per_seat'] = data['mrr_amount'] / (data['seats_sub'] + 1e-6)
        X['seat_growth_ratio'] = data['seats_sub'] / (data['seats'] + 1e-6)

        #align columns with training data order
        expected_features = model.feature_name_
        for col in expected_features:
            if col not in X.columns:
                X[col] = 0 # Fill missing metadata/IDs with 0
        X = X[expected_features]

        # 4. THE FIX: Reconstruct Categorical Metadata from the "List"
        # We need to map the model's internal list back to our feature names
        pc = model.booster_.pandas_categorical
        training_cat_map = {}

        if isinstance(pc, list):
            #it matches the indices of expected_features if it is a list

            for i, categories in enumerate(pc):
                if categories is not None:
                    training_cat_map[expected_features[i]] = categories
        elif isinstance(pc, dict):
            training_cat_map = pc

        #force the exact CategoricalDtype
        for col in X.columns:
            if col in training_cat_map:
                # We force the column to have the EXACT same categories as training
                allowed_levels = training_cat_map[col]
                X[col] = X[col].astype(pd.CategoricalDtype(categories=allowed_levels))
            else:
                # Force everything else to be a number
                X[col] = pd.to_numeric(X[col], errors='coerce').fillna(0)

        #Run Prediction
        probs = model.predict_proba(X)
        probability = float(probs[0][1])
        
        #Generate SHAP
        shap_values = explainer.shap_values(X)
        vals = shap_values[1][0] if isinstance(shap_values, list) else shap_values[0]
        top_drivers = sorted(dict(zip(X.columns, vals)).items(), key=lambda x: abs(x[1]), reverse=True)[:3]

        return {
            "churn_probability": round(probability, 4),
            "is_churn_risk": bool(probability > 0.5),
            "top_drivers": {k: round(float(v), 4) for k, v in top_drivers}
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Metadata Mismatch: {str(e)}")