"""
Carphatian AI Microservice - Groq Provider

Integration with Groq's ultra-fast LLM inference.

Built by Carphatian
"""

from typing import Optional
from groq import AsyncGroq
import structlog

from .base import (
    BaseAIProvider, 
    CompletionRequest, 
    CompletionResponse,
    EmbeddingRequest, 
    EmbeddingResponse
)
from config import get_settings

logger = structlog.get_logger()


class GroqProvider(BaseAIProvider):
    """Groq ultra-fast LLM provider."""
    
    name = "groq"
    supports_embeddings = False  # Groq doesn't offer embeddings
    
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.groq_api_key
        self.model = settings.groq_model
        self.client: Optional[AsyncGroq] = None
        
        if self.api_key:
            self.client = AsyncGroq(api_key=self.api_key)
    
    async def is_available(self) -> bool:
        """Check if Groq is configured."""
        return self.client is not None
    
    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        """Generate completion using Groq's fast inference."""
        if not self.client:
            raise ValueError("Groq client not initialized - API key missing")
        
        messages = [{"role": m.role, "content": m.content} for m in request.messages]
        
        logger.info(
            "groq_completion_request",
            model=self.model,
            messages_count=len(messages),
            max_tokens=request.max_tokens
        )
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
        )
        
        usage = {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens,
        }
        
        logger.info("groq_completion_response", usage=usage)
        
        return CompletionResponse(
            content=response.choices[0].message.content,
            model=self.model,
            provider=self.name,
            usage=usage
        )
    
    async def embed(self, request: EmbeddingRequest) -> EmbeddingResponse:
        """Groq doesn't support embeddings - raise error."""
        raise NotImplementedError("Groq does not support embeddings API")
