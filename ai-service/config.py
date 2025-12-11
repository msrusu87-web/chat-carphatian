"""
Carphatian AI Microservice - Configuration

Loads configuration from environment variables with validation.

Built by Carphatian
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App Config
    app_name: str = "Carphatian AI Service"
    app_version: str = "1.0.0"
    debug: bool = Field(default=False, description="Enable debug mode")
    
    # Server Config
    host: str = Field(default="0.0.0.0", description="Server host")
    port: int = Field(default=8000, description="Server port")
    
    # Database Config
    database_url: str = Field(
        default="postgresql://carphatian:carphatian_dev_2024@localhost:5432/carphatian_marketplace",
        description="PostgreSQL connection string"
    )
    
    # Redis Config
    redis_url: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection string"
    )
    cache_ttl: int = Field(default=3600, description="Cache TTL in seconds (1 hour)")
    
    # AI Provider Keys
    openai_api_key: Optional[str] = Field(default=None, description="OpenAI API key")
    anthropic_api_key: Optional[str] = Field(default=None, description="Anthropic API key")
    groq_api_key: Optional[str] = Field(default=None, description="Groq API key")
    
    # Default AI Models
    openai_model: str = Field(default="gpt-4o", description="Default OpenAI model")
    anthropic_model: str = Field(default="claude-3-5-sonnet-20241022", description="Default Anthropic model")
    groq_model: str = Field(default="llama-3.1-70b-versatile", description="Default Groq model")
    
    # Embedding Model
    embedding_model: str = Field(default="text-embedding-3-small", description="OpenAI embedding model")
    embedding_dimensions: int = Field(default=1536, description="Embedding vector dimensions")
    
    # Rate Limiting
    rate_limit_requests: int = Field(default=100, description="Requests per minute")
    rate_limit_window: int = Field(default=60, description="Rate limit window in seconds")
    
    # Sentry (Error Tracking)
    sentry_dsn: Optional[str] = Field(default=None, description="Sentry DSN for error tracking")
    
    # CORS
    cors_origins: str = Field(
        default="http://localhost:3000,https://chat.carphatian.ro",
        description="Comma-separated list of allowed origins"
    )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
