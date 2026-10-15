import os
from pydantic_settings import BaseSettings, SettingsConfigDict

# Locate .env in backend directory or current working directory
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(os.path.dirname(current_dir))
backend_env = os.path.join(backend_dir, ".env")
root_env = os.path.join(os.path.dirname(backend_dir), ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Bharat Legal Intelligence"
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/bharat_legal"
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-flash-latest"
    
    model_config = SettingsConfigDict(
        env_file=[backend_env, root_env, ".env"],
        extra="ignore"
    )

settings = Settings()
