import optuna
from optuna.integration.mlflow import MLflowCallback
import lightgbm as lgb
import mlflow
import numpy as np
from sklearn.model_selection import StratifiedKFold
from src.shared.data_loader import DataLoader
from src.shared.config import settings
import structlog

logger = structlog.get_logger()

def objective(trial):
    # 1. Load the 'Honest' Dataset
    loader = DataLoader()
    df = loader.get_full_dataset()
    
    # 2. Strict Feature Selection (The 'Anti-Leak' List)
    leaky_cols = ['churn_date', 'reason_code', 'refund_amount_usd', 'feedback_text', 'is_reactivation', 'churn_event_id']
    metadata_cols = ['account_id', 'account_name', 'signup_date', 'subscription_id', 'start_date', 'end_date']
    drop_list = leaky_cols + metadata_cols + ['churn_flag']
    
    X = df.drop(columns=[c for c in drop_list if c in df.columns])
    y = df['churn_flag']
    
    # Ensure LightGBM recognizes categorical columns
    for col in X.select_dtypes(include=['object']).columns:
        X[col] = X[col].astype('category')

    # 3. Define the High-Performance Search Space
    params = {
        "objective": "binary",
        "metric": "binary_logloss",
        "verbosity": -1,
        "boosting_type": "gbdt",
        "n_estimators": trial.suggest_int("n_estimators", 100, 1000),
        "learning_rate": trial.suggest_float("learning_rate", 0.005, 0.1, log=True),
        "num_leaves": trial.suggest_int("num_leaves", 20, 150),
        "max_depth": trial.suggest_int("max_depth", 3, 12),
        "min_child_samples": trial.suggest_int("min_child_samples", 5, 50),
        "feature_fraction": trial.suggest_float("feature_fraction", 0.5, 1.0),
        # REGULARIZATION: These help us hit 90% without overfitting
        "lambda_l1": trial.suggest_float("lambda_l1", 1e-8, 10.0, log=True),
        "lambda_l2": trial.suggest_float("lambda_l2", 1e-8, 10.0, log=True),
    }

    # 4. 5-Fold Cross-Validation (The Truth Serum)
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = []

    for train_idx, val_idx in skf.split(X, y):
        X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

        model = lgb.LGBMClassifier(**params)
        model.fit(X_train, y_train)
        cv_scores.append(model.score(X_val, y_val))

    # We return the average score across all 5 folds
    return np.mean(cv_scores)

def run_tuning():
    mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)

    # Professional MLflow Callback Integration
    mlflc = MLflowCallback(
        tracking_uri=settings.MLFLOW_TRACKING_URI,
        metric_name="avg_cv_accuracy",
        mlflow_kwargs={
            "experiment_name": "anchor-tuning-v2" 
        }
    )

    study = optuna.create_study(study_name="churn_optimization", direction="maximize")
    
    logger.info("tuning_started", n_trials=30)
    study.optimize(objective, n_trials=30, callbacks=[mlflc])

    print("\n" + "="*30)
    print("OPTIMIZATION COMPLETE")
    print(f"Best CV Accuracy: {study.best_value:.4f}")
    print(f"Best Parameters: {study.best_params}")
    print("="*30)

if __name__ == "__main__":
    run_tuning()