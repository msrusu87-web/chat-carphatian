"""
Carphatian AI Microservice - Anthropic Provider

Integration with Claude models.

Built by Carphatian
"""

from typing import Optional
from anthropic import AsyncAnthropic
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


class AnthropicProvider(BaseAIProvider):
    """Anthropic Claude provider."""
    
    name = "anthropic"
    supports_embeddings = False  # Anthropic doesn't offer embeddings API
    
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.anthropic_api_key
        self.model = settings.anthropic_model
        self.client: Optional[AsyncAnthropic] = None
        
        if self.api_key:
            self.client = AsyncAnthropic(api_key=self.api_key)
    
    async def is_available(self) -> bool:
        """Check if Anthropic is configured."""
        return self.client is not None
    
    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        """Generate completion using Claude model."""
        if not self.client:
            raise ValueError("Anthropic client not initialized - API key missing")
        
        # Anthropic uses a different message format
        # System message goes in a separate parameter
        system_message = ""
        messages = []
        
        for m in request.messages:
            if m.role == "system":
                system_message = m.content
            else:
                messages.append({"role": m.role, "content": m.content})
        
        logger.info(
            "anthropic_completion_request",
            model=self.model,
            messages_count=len(messages),
            max_tokens=request.max_tokens
        )
        
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=request.max_tokens,
            system=system_message if system_message else None,
            messages=messages,
        )
        
        usage = {
            "prompt_tokens": response.usage.input_tokens,
            "completion_tokens": response.usage.output_tokens,
            "total_tokens": response.usage.input_tokens + response.usage.output_tokens,
        }
        
        logger.info("anthropic_completion_response", usage=usage)
        
        # Extract text content from response
        content = ""
        for block in response.content:
            if hasattr(block, 'text'):
                content += block.text
        
        return CompletionResponse(
            content=content,
            model=self.model,
            provider=self.name,
            usage=usage
        )
    
    async def embed(self, request: EmbeddingRequest) -> EmbeddingResponse:
        """Anthropic doesn't support embeddings - raise error."""
        raise NotImplementedError("Anthropic does not support embeddings API")
