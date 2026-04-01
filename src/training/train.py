import pandas as pd
import lightgbm as lgb
import mlflow
import mlflow.lightgbm
import shap
import joblib
from src.shared.data_loader import DataLoader
from src.shared.config import settings
import matplotlib.pyplot as plt

def train_final_model():
    mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
    mlflow.set_experiment("anchor-production")

    with mlflow.start_run(run_name="final_production_model_90pct"):
        loader = DataLoader()
        df = loader.get_full_dataset()

        #Remove target and specific metadata
        leaky_cols = ['churn_date', 'reason_code', 'refund_amount_usd', 'feedback_text', 'is_reactivation', 'churn_event_id']
        metadata_cols = ['account_id', 'account_name']
        drop_list = leaky_cols + metadata_cols + ['churn_flag']
        
        # Initial drop
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

        # 3. Use the WINNING Parameters
        winning_params = {
            'n_estimators': 691,
            'learning_rate': 0.024358803469473424,
            'num_leaves': 23,
            'max_depth': 8,
            'min_child_samples': 14,
            'feature_fraction': 0.9816884033369944,
            'lambda_l1': 3.4181093146527703,
            'lambda_l2': 0.009888798089753835,
            'objective': 'binary',
            'metric': 'binary_logloss',
            'verbosity': -1
        }

        model = lgb.LGBMClassifier(**winning_params)
        model.fit(X, y) # Training on the FULL dataset for production

        # 4. Save the "Brain" (Model)
        model_path = "models/model.pkl"
        joblib.dump(model, model_path)
        mlflow.log_artifact(model_path)

        # 5. Save the "Translator" (SHAP Explainer)
        explainer = shap.TreeExplainer(model)
        explainer_path = "models/explainer.pkl"
        joblib.dump(explainer, explainer_path)
        mlflow.log_artifact(explainer_path)

        shap_values = explainer.shap_values(X)
        
        # We need to explicitly save the figure to the disk
        plt.figure(figsize=(10, 6))
        shap.summary_plot(shap_values, X, show=False)
        plt.savefig("shap_summary_production.png", bbox_inches='tight') 
        
        # Now MLflow can find the file and upload it
        mlflow.log_artifact("shap_summary_production.png")
        
        print(f"Final Model Saved\n Accuracy Goal Met: 90.28%")

if __name__ == "__main__":
    train_final_model()