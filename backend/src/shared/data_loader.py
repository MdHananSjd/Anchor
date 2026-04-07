import pandas as pd
import structlog 
from src.shared.config import settings

logger = structlog.get_logger()

class DataLoader:
    def __init__(self):
        #setting the raw data path from the imported config settings
        self.raw_data_path = settings.RAW_DATA_PATH

    def load_raw_csv(self, file_name:str) -> pd.DataFrame:
        #loads a ravenstack csv right from the raw directory
        file_path = self.raw_data_path / f"{file_name}.csv"

        if not file_path.exists():
            logger.error("File not found", path=str(file_path))
            raise FileNotFoundError(f"Required file {file_name} not found in {self.raw_data_path}")
        
        try:
            df = pd.read_csv(file_path)
            logger.info("File loaded successfully", file=file_name, rows=len(df), columns=list(df.columns))
            return df
        except Exception as e:
            logger.error("Failed to load file", file=file_name, error=str(e))
            raise

    def get_full_dataset(self):
        # 1. Load the raw data
        accounts = pd.read_csv(f"{settings.RAW_DATA_PATH}/ravenstack_accounts.csv")
        subscriptions = pd.read_csv(f"{settings.RAW_DATA_PATH}/ravenstack_subscriptions.csv")
        
        # 2. Basic Join
        df = pd.merge(accounts, subscriptions, on="account_id", suffixes=('_acc', '_sub'))

        # --- FEATURE ENGINEERING ---
        
        # A. Calculate Tenure (Days as a customer)
        # Using 2026-03-29 as our "current" reference date
        current_date = pd.to_datetime('2026-03-29')
        df['signup_date'] = pd.to_datetime(df['signup_date'])
        df['tenure_days'] = (current_date - df['signup_date']).dt.days

        # B. MRR Efficiency (Cost per Seat)
        # We add a small 0.001 to avoid division by zero errors
        df['mrr_per_seat'] = df['mrr_amount'] / (df['seats_sub'] + 0.001)

        # C. Utilization Signal
        # Ratio of subscription seats to initial account seats
        df['seat_growth_ratio'] = df['seats_sub'] / (df['seats_acc'] + 0.001)

        # 3. Cleanup: Drop duplicate churn flags and handle NaNs
        # Ensure 'churn_flag' is the one from subscriptions (the target)
        if 'churn_flag_sub' in df.columns:
            df['churn_flag'] = df['churn_flag_sub']
            df = df.drop(columns=['churn_flag_sub', 'churn_flag_acc'])
        
        df = df.fillna(0)
        
        return df
        
if __name__ == "__main__":
    #to test the scripts directly
    loader = DataLoader()
    test_df = loader.get_full_dataset()

    print("\n--- Master Dataset Summary ---")
    print(f"Total rows: {len(test_df)}")
    print(f"Churn Rate: {test_df['churn_flag'].mean():.2%}")
    print(f"Columns: {test_df.columns.tolist()}")
    print(test_df.head())
