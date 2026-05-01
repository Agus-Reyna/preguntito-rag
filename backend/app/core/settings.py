from functools import lru_cache
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuración centralizada de la aplicación."""

    project_name: str = Field(default="RAG Backend")

    # Rutas HTTP
    api_prefix: str = Field(default="/api")
    documents_prefix: str = Field(default="/documents")

    # Paths
    base_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[2])
    upload_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[2] / "data" / "uploads")

    # DB
    database_url: str | None = Field(default=None)

    # Ollama
    ollama_base_url: str = Field(default="http://ollama:11434")
    ollama_embed_model: str = Field(default="nomic-embed-text")

    class Config:
        env_file = "./.env"
        env_file_encoding = "utf-8"
        extra = "allow"


@lru_cache
def get_settings() -> Settings:
    return Settings()
