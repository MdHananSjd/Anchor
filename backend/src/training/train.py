import pandas as pd
import lightgbm as lgb
import mlflow
import mlflow.lightgbm
import shap
import joblib
from src.shared.data_loader import DataLoader
from src.shared.config import settings
import matplotlib.pyplot as plt
import os

def train_final_model():
    # 1. LOAD DATA
    loader = DataLoader()
    df = loader.get_full_dataset()

    # 2. ANTI-LEAK & ANTI-BIAS FEATURE SELECTION
    leaky_cols = ['churn_date', 'reason_code', 'refund_amount_usd', 'feedback_text', 'is_reactivation', 'churn_event_id']
    # tenure_days is removed to avoid tenure bias (new accounts shouldn't be penalized for not being old enough to churn)
    metadata_cols = ['account_id', 'account_name', 'subscription_id', 'start_date', 'end_date', 'tenure_days']
    drop_list = leaky_cols + metadata_cols + ['churn_flag']
    
    X = df.drop(columns=[c for c in drop_list if c in df.columns])
    y = df['churn_flag']

    # automatically drop any remaining date columns
    date_cols = X.select_dtypes(include=['datetime64', 'datetime']).columns
    if len(date_cols) > 0:
        print(f"Automatically dropping hidden date columns: {list(date_cols)}")
        X = X.drop(columns=date_cols)

    # 3. Categorical conversion
    for col in X.select_dtypes(include=['object']).columns:
        X[col] = X[col].astype('category')

    # 4. Use the F1-Optimized Parameters
    winning_params = {
        'n_estimators': 716,
        'learning_rate': 0.006223328749655962,
        'num_leaves': 63,
        'max_depth': 4,
        'min_child_samples': 7,
        'feature_fraction': 0.9774030791560651,
        'lambda_l1': 5.496574862659988e-08,
        'lambda_l2': 0.0003141277143488467,
        'objective': 'binary',
        'metric': 'binary_logloss',
        'is_unbalance': True, # Crucial for class imbalance
        'verbosity': -1
    }

    model = lgb.LGBMClassifier(**winning_params)
    print("Training robust model...")
    model.fit(X, y)

    # 5. SAVE LOCALLY (Safety First)
    os.makedirs("models", exist_ok=True)
    model_path = "models/model.pkl"
    explainer_path = "models/explainer.pkl"
    
    print(f"Saving model to {model_path}...")
    joblib.dump(model, model_path)
    
    print(f"Generating and saving SHAP explainer to {explainer_path}...")
    explainer = shap.TreeExplainer(model)
    joblib.dump(explainer, explainer_path)

    # 6. ATTEMPT MLFLOW LOGGING
    try:
        mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
        mlflow.set_experiment("anchor-production")
        
        with mlflow.start_run(run_name="final_production_model_robust"):
            mlflow.log_artifact(model_path)
            mlflow.log_artifact(explainer_path)

            shap_values = explainer.shap_values(X)
            plt.figure(figsize=(10, 6))
            shap.summary_plot(shap_values, X, show=False)
            plt.savefig("shap_summary_production.png", bbox_inches='tight') 
            mlflow.log_artifact("shap_summary_production.png")
            print("MLflow logging successful.")
    except Exception as e:
        print(f"Warning: MLflow logging failed, but local files were saved. Error: {e}")

    print(f"Final Model Saved and Robustified.")

if __name__ == "__main__":
    train_final_model()
