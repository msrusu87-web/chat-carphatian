"""
Carphatian AI Microservice - Base Provider

Abstract base class for all AI providers.

Built by Carphatian
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class Message(BaseModel):
    """Chat message structure."""
    role: str  # "system", "user", "assistant"
    content: str


class CompletionRequest(BaseModel):
    """Request for text completion."""
    messages: List[Message]
    max_tokens: int = 2000
    temperature: float = 0.7
    stream: bool = False


class CompletionResponse(BaseModel):
    """Response from text completion."""
    content: str
    model: str
    provider: str
    usage: Dict[str, int]  # tokens used


class EmbeddingRequest(BaseModel):
    """Request for text embedding."""
    text: str
    model: Optional[str] = None


class EmbeddingResponse(BaseModel):
    """Response from text embedding."""
    embedding: List[float]
    model: str
    dimensions: int


class BaseAIProvider(ABC):
    """Abstract base class for AI providers."""
    
    name: str = "base"
    supports_embeddings: bool = False
    
    @abstractmethod
    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        """Generate text completion."""
        pass
    
    @abstractmethod
    async def embed(self, request: EmbeddingRequest) -> EmbeddingResponse:
        """Generate text embedding."""
        pass
    
    @abstractmethod
    async def is_available(self) -> bool:
        """Check if provider is available and configured."""
        pass
    
    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} name={self.name}>"
