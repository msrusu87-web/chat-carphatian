/**
 * Cache Utility Tests
 * 
 * Unit tests for caching functionality.
 * 
 * Built by Carphatian
 */

import { cacheGet, cacheSet, cacheDelete, cacheKey, CacheTTL, CacheKeys } from '@/lib/cache'

describe('Cache Utilities', () => {
  beforeEach(async () => {
    // Clear cache before each test
    await cacheDelete('test:key')
  })

  describe('cacheKey', () => {
    it('should generate correct cache keys', () => {
      const key = cacheKey('user', 123)
      expect(key).toBe('carphatian:user:123')
    })

    it('should handle multiple parts', () => {
      const key = cacheKey('search', 'jobs', 'developer')
      expect(key).toBe('carphatian:search:jobs:developer')
    })
  })

  describe('CacheKeys', () => {
    it('should generate user cache key', () => {
      expect(CacheKeys.user(123)).toBe('carphatian:user:123')
    })

    it('should generate profile cache key', () => {
      expect(CacheKeys.profile(456)).toBe('carphatian:profile:456')
    })

    it('should generate job cache key', () => {
      expect(CacheKeys.job(789)).toBe('carphatian:job:789')
    })
  })

  describe('CacheTTL', () => {
    it('should have correct TTL values', () => {
      expect(CacheTTL.SHORT).toBe(60)
      expect(CacheTTL.MEDIUM).toBe(300)
      expect(CacheTTL.LONG).toBe(3600)
      expect(CacheTTL.DAY).toBe(86400)
      expect(CacheTTL.WEEK).toBe(604800)
    })
  })

  describe('cacheSet and cacheGet', () => {
    it('should store and retrieve values', async () => {
      const testKey = 'test:simple'
      const testValue = { foo: 'bar', num: 42 }
      
      await cacheSet(testKey, testValue)
      const result = await cacheGet(testKey)
      
      expect(result).toEqual(testValue)
    })

    it('should return null for non-existent keys', async () => {
      const result = await cacheGet('non:existent:key')
      expect(result).toBeNull()
    })
  })

  describe('cacheDelete', () => {
    it('should delete cached values', async () => {
      const testKey = 'test:delete'
      await cacheSet(testKey, 'value')
      await cacheDelete(testKey)
      
      const result = await cacheGet(testKey)
      expect(result).toBeNull()
    })
  })
})
