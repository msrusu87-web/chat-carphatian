"""
Carphatian AI Microservice - AI Provider Factory

Dynamic provider selection with fallback mechanism.

Built by Carphatian
"""

from typing import Dict, List, Optional, Type
import structlog

from .base import BaseAIProvider, CompletionRequest, CompletionResponse, EmbeddingRequest, EmbeddingResponse
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider
from .groq_provider import GroqProvider

logger = structlog.get_logger()


class AIProviderFactory:
    """
    Factory for AI providers with automatic fallback.
    
    Providers are tried in priority order until one succeeds.
    Default priority: OpenAI > Anthropic > Groq
    """
    
    # Available provider classes
    PROVIDERS: Dict[str, Type[BaseAIProvider]] = {
        "openai": OpenAIProvider,
        "anthropic": AnthropicProvider,
        "groq": GroqProvider,
    }
    
    # Default priority order
    DEFAULT_PRIORITY = ["openai", "anthropic", "groq"]
    
    def __init__(self, priority: Optional[List[str]] = None):
        """Initialize factory with provider priority."""
        self.priority = priority or self.DEFAULT_PRIORITY
        self._providers: Dict[str, BaseAIProvider] = {}
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Initialize all available providers."""
        for name in self.priority:
            if name in self.PROVIDERS:
                try:
                    provider = self.PROVIDERS[name]()
                    self._providers[name] = provider
                    logger.info("provider_initialized", provider=name)
                except Exception as e:
                    logger.warning("provider_init_failed", provider=name, error=str(e))
    
    def get_provider(self, name: str) -> Optional[BaseAIProvider]:
        """Get a specific provider by name."""
        return self._providers.get(name)
    
    async def get_available_provider(self) -> Optional[BaseAIProvider]:
        """Get the first available provider in priority order."""
        for name in self.priority:
            provider = self._providers.get(name)
            if provider and await provider.is_available():
                logger.info("provider_selected", provider=name)
                return provider
        logger.error("no_available_providers")
        return None
    
    async def get_embedding_provider(self) -> Optional[BaseAIProvider]:
        """Get a provider that supports embeddings."""
        for name in self.priority:
            provider = self._providers.get(name)
            if provider and provider.supports_embeddings and await provider.is_available():
                logger.info("embedding_provider_selected", provider=name)
                return provider
        logger.error("no_embedding_providers")
        return None
    
    async def complete(
        self, 
        request: CompletionRequest,
        preferred_provider: Optional[str] = None
    ) -> CompletionResponse:
        """
        Generate completion using best available provider.
        
        Args:
            request: Completion request
            preferred_provider: Optional preferred provider name
        
        Returns:
            CompletionResponse from the provider
        
        Raises:
            RuntimeError: If no providers are available
        """
        # Try preferred provider first
        if preferred_provider:
            provider = self._providers.get(preferred_provider)
            if provider and await provider.is_available():
                try:
                    return await provider.complete(request)
                except Exception as e:
                    logger.warning(
                        "preferred_provider_failed",
                        provider=preferred_provider,
                        error=str(e)
                    )
        
        # Fall through priority list
        for name in self.priority:
            provider = self._providers.get(name)
            if provider and await provider.is_available():
                try:
                    return await provider.complete(request)
                except Exception as e:
                    logger.warning("provider_failed", provider=name, error=str(e))
                    continue
        
        raise RuntimeError("No AI providers available")
    
    async def embed(self, request: EmbeddingRequest) -> EmbeddingResponse:
        """
        Generate embedding using available embedding provider.
        
        Currently only OpenAI supports embeddings.
        
        Args:
            request: Embedding request
        
        Returns:
            EmbeddingResponse with vector
        
        Raises:
            RuntimeError: If no embedding providers are available
        """
        provider = await self.get_embedding_provider()
        if not provider:
            raise RuntimeError("No embedding providers available")
        
        return await provider.embed(request)
    
    def list_providers(self) -> Dict[str, bool]:
        """List all providers and their initialization status."""
        return {
            name: name in self._providers
            for name in self.PROVIDERS.keys()
        }


# Singleton instance
_factory: Optional[AIProviderFactory] = None


def get_ai_factory() -> AIProviderFactory:
    """Get or create the AI provider factory singleton."""
    global _factory
    if _factory is None:
        _factory = AIProviderFactory()
    return _factory
