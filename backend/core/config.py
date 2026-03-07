from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql://quantlab:quantlab@localhost:5432/quantlab"
    redis_url: str = "redis://localhost:6379"
    secret_key: str = "dev-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080
    sandbox_url: str = "http://localhost:9000"
    sandbox_timeout: int = 10
    data_dir: str = "./data/datasets"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
