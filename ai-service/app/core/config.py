from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"

    django_api_url: str = "http://127.0.0.1:8000"
    ai_service_url: str = "http://127.0.0.1:8001"

    model_config = SettingsConfigDict(
        env_file="../../.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()