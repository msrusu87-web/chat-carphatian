"""
Carphatian AI Microservice - Redis Cache

Caching layer for AI responses to reduce API costs.

Built by Carphatian
"""

import json
import hashlib
from typing import Optional, Any
import redis.asyncio as redis
import structlog

from config import get_settings

logger = structlog.get_logger()


class AICache:
    """
    Redis-based cache for AI responses.
    
    Caches identical prompts to avoid redundant API calls.
    Uses consistent hashing for cache keys.
    """
    
    def __init__(self):
        settings = get_settings()
        self.redis_url = settings.redis_url
        self.ttl = settings.cache_ttl
        self._client: Optional[redis.Redis] = None
    
    async def connect(self):
        """Connect to Redis."""
        try:
            self._client = redis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            await self._client.ping()
            logger.info("redis_connected", url=self.redis_url)
        except Exception as e:
            logger.warning("redis_connection_failed", error=str(e))
            self._client = None
    
    async def disconnect(self):
        """Disconnect from Redis."""
        if self._client:
            await self._client.close()
            self._client = None
    
    def _generate_key(self, prefix: str, data: dict) -> str:
        """Generate a consistent cache key from data."""
        # Sort keys for consistent hashing
        serialized = json.dumps(data, sort_keys=True)
        hash_value = hashlib.sha256(serialized.encode()).hexdigest()[:16]
        return f"ai:{prefix}:{hash_value}"
    
    async def get(self, prefix: str, data: dict) -> Optional[dict]:
        """
        Get cached response if available.
        
        Args:
            prefix: Cache key prefix (e.g., "completion", "embedding")
            data: Request data to hash
        
        Returns:
            Cached response dict or None
        """
        if not self._client:
            return None
        
        key = self._generate_key(prefix, data)
        
        try:
            cached = await self._client.get(key)
            if cached:
                logger.info("cache_hit", key=key)
                return json.loads(cached)
            logger.debug("cache_miss", key=key)
            return None
        except Exception as e:
            logger.warning("cache_get_error", error=str(e))
            return None
    
    async def set(self, prefix: str, data: dict, response: dict) -> bool:
        """
        Cache a response.
        
        Args:
            prefix: Cache key prefix
            data: Request data to hash
            response: Response to cache
        
        Returns:
            True if cached successfully
        """
        if not self._client:
            return False
        
        key = self._generate_key(prefix, data)
        
        try:
            await self._client.setex(
                key,
                self.ttl,
                json.dumps(response)
            )
            logger.info("cache_set", key=key, ttl=self.ttl)
            return True
        except Exception as e:
            logger.warning("cache_set_error", error=str(e))
            return False
    
    async def invalidate(self, prefix: str, data: dict) -> bool:
        """Invalidate a cached entry."""
        if not self._client:
            return False
        
        key = self._generate_key(prefix, data)
        
        try:
            await self._client.delete(key)
            logger.info("cache_invalidated", key=key)
            return True
        except Exception as e:
            logger.warning("cache_invalidate_error", error=str(e))
            return False
    
    async def clear_all(self, prefix: Optional[str] = None) -> int:
        """
        Clear all cached entries.
        
        Args:
            prefix: Optional prefix to filter keys
        
        Returns:
            Number of keys deleted
        """
        if not self._client:
            return 0
        
        try:
            pattern = f"ai:{prefix}:*" if prefix else "ai:*"
            keys = await self._client.keys(pattern)
            if keys:
                count = await self._client.delete(*keys)
                logger.info("cache_cleared", count=count, pattern=pattern)
                return count
            return 0
        except Exception as e:
            logger.warning("cache_clear_error", error=str(e))
            return 0


# Singleton instance
_cache: Optional[AICache] = None


async def get_cache() -> AICache:
    """Get or create the cache singleton."""
    global _cache
    if _cache is None:
        _cache = AICache()
        await _cache.connect()
    return _cache
