import optuna
import lightgbm as lgb
import mlflow
from sklearn.model_selection import train_test_split
from src.shared.data_loader import DataLoader
from src.shared.config import settings
import structlog
from optuna.integration.mlflow import MLflowCallback


logger = structlog.get_logger()

def objective(trial):
    #loading the cleaned data
    loader = DataLoader()
    df = loader.get_full_dataset()

    #dropping leaky columns (we want to tune the model on the 73% correct data not the 100% fake one)
    leaky_cols = ['churn_date', 'reason_code', 'refund_amount_usd', 'feedback_text', 'is_reactivation', 'churn_event_id']
    metadata_cols = ['account_id', 'account_name', 'signup_date', 'subscription_id', 'start_date', 'end_date']
    drop_list = leaky_cols + metadata_cols + ['churn flag']

    X = df.drop(columns = [c for c in drop_list if c in df.columns])
    y = df['churn_flag']

    #handling categories
    for col in X.select_dtypes(include=['object']).columns:
        X[col] = X[col].astype('category')

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    #defining the state space
    #optuna will guess values in these ranges, based on previous trial results
    params = {
        "objective": "binary",
        "metric": "binary_logloss",
        "verbosity": -1,
        "boosting_type": "gbdt",
        "n_estimators": trial.suggest_int("n_estimators", 100, 1000),
        "learning_rate": trial.suggest_float("learning_rate", 1e-3, 0.1, log=True),
        "num_leaves": trial.suggest_int("num_leaves", 20, 300),
        "max_depth": trial.suggest_int("max_depth", 3, 15),
        "min_child_samples": trial.suggest_int("min_child_samples", 5, 100),
        "feature_fraction": trial.suggest_float("feature_fraction", 0.5, 1.0),
    }

    model = lgb.LGBMClassifier(**params)
    model.fit(X_train, y_train)
    accuracy = model.score(X_test, y_test)

    return accuracy

def run_tuning():
    #setup MLflow to track the tuning session
    mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)

    #create the mlflow calllback
    # this automatically logs every trial to mlflow
    mlflc = MLflowCallback(
        tracking_uri=settings.MLFLOW_TRACKING_URI,
        metric_name="accuracy",
        mlflow_kwargs={
            "experiment_name": "anchor-tuning-v1"  
        }
    )

    #creating study to maximize accuracy
    study = optuna.create_study(direction="maximize")

    #im gonna do 20 trials, assuming each one takes like 4-5 seconds
    study.optimize(objective, n_trials=20, callbacks=[mlflc])

    print("\n" + "="*30)
    print("OPTIMIZATION COMPLETE")
    print(f"Best Accuracy: {study.best_value:.4f}")
    print(f"Best Parameters: {study.best_params}")
    print("="*30)
if __name__ == "__main__":
    run_tuning()