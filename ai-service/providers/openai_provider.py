"""
Carphatian AI Microservice - OpenAI Provider

Integration with OpenAI GPT models and embeddings.

Built by Carphatian
"""

from typing import Optional
from openai import AsyncOpenAI
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


class OpenAIProvider(BaseAIProvider):
    """OpenAI GPT provider with embedding support."""
    
    name = "openai"
    supports_embeddings = True
    
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.openai_api_key
        self.model = settings.openai_model
        self.embedding_model = settings.embedding_model
        self.client: Optional[AsyncOpenAI] = None
        
        if self.api_key:
            self.client = AsyncOpenAI(api_key=self.api_key)
    
    async def is_available(self) -> bool:
        """Check if OpenAI is configured and reachable."""
        if not self.client:
            return False
        try:
            # Quick check - list models
            await self.client.models.list()
            return True
        except Exception as e:
            logger.warning("openai_unavailable", error=str(e))
            return False
    
    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        """Generate completion using GPT model."""
        if not self.client:
            raise ValueError("OpenAI client not initialized - API key missing")
        
        messages = [{"role": m.role, "content": m.content} for m in request.messages]
        
        logger.info(
            "openai_completion_request",
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
        
        logger.info("openai_completion_response", usage=usage)
        
        return CompletionResponse(
            content=response.choices[0].message.content,
            model=self.model,
            provider=self.name,
            usage=usage
        )
    
    async def embed(self, request: EmbeddingRequest) -> EmbeddingResponse:
        """Generate embedding using OpenAI embedding model."""
        if not self.client:
            raise ValueError("OpenAI client not initialized - API key missing")
        
        model = request.model or self.embedding_model
        
        logger.info(
            "openai_embedding_request",
            model=model,
            text_length=len(request.text)
        )
        
        response = await self.client.embeddings.create(
            model=model,
            input=request.text,
        )
        
        embedding = response.data[0].embedding
        
        logger.info(
            "openai_embedding_response",
            dimensions=len(embedding)
        )
        
        return EmbeddingResponse(
            embedding=embedding,
            model=model,
            dimensions=len(embedding)
        )
