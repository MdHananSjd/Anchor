import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # BASE_DIR should point to where 'data/' and 'models/' are.
    # Locally: backend/src/shared/config.py -> ../../../ (backend/)
    # But data is at ../../../../ (root)
    # In Docker: /app/src/shared/config.py -> ../../../ (/app/)
    # here im prioritizing an environment variable if set
    BASE_DIR: Path = Path(os.getenv("PROJECT_ROOT", Path(__file__).resolve().parent.parent.parent))
    
    PROJECT_NAME: str="Anchor"
    ENV: str="development"

    #these are the data layer paths
    RAW_DATA_PATH: Path = BASE_DIR / "data" / "raw"
    PROCESSED_DATA_PATH: Path = BASE_DIR / "data" / "processed"

    #ml and tracking settings
    MLFLOW_TRACKING_URI: str="http://127.0.0.1:5050"
    MODEL_NAME: str="churn-prediction-model"
    CHURD_THRESHOLD: float=0.5

    #cloud deployment details we'll specify later

    #tells pydantic to look for a .env file
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# basically instantiating this so other modules can import this as a singleton
settings = Settings()