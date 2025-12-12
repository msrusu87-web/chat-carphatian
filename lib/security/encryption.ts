/**
 * Data Encryption Utilities
 * Encrypt sensitive data at rest
 * Built by Carphatian
 */

import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

// Algorithm configuration
const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 32

/**
 * Get encryption key from environment or derive from secret
 */
async function getEncryptionKey(): Promise<Buffer> {
  const secret = process.env.ENCRYPTION_SECRET
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is not set')
  }

  // Use a fixed salt for deterministic key derivation
  // In production, you might want to use a unique salt per encrypted item
  const salt = process.env.ENCRYPTION_SALT || 'carphatian-default-salt-v1'
  const key = await scryptAsync(secret, salt, KEY_LENGTH)
  return key as Buffer
}

/**
 * Encrypt a string
 * Returns base64 encoded: salt:iv:authTag:ciphertext
 */
export async function encrypt(plaintext: string): Promise<string> {
  if (!plaintext) return ''

  try {
    const key = await getEncryptionKey()
    const iv = randomBytes(IV_LENGTH)
    const salt = randomBytes(SALT_LENGTH)

    const cipher = createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(plaintext, 'utf8', 'base64')
    encrypted += cipher.final('base64')
    
    const authTag = cipher.getAuthTag()

    // Combine: salt + iv + authTag + ciphertext
    const combined = Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, 'base64')
    ])

    return combined.toString('base64')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt a string
 * Expects base64 encoded: salt:iv:authTag:ciphertext
 */
export async function decrypt(encryptedData: string): Promise<string> {
  if (!encryptedData) return ''

  try {
    const key = await getEncryptionKey()
    const combined = Buffer.from(encryptedData, 'base64')

    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH)
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)
    const ciphertext = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(ciphertext.toString('base64'), 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Hash a value (one-way, for comparison)
 */
export async function hash(value: string, salt?: string): Promise<string> {
  const useSalt = salt || randomBytes(16).toString('hex')
  const hashedBuffer = await scryptAsync(value, useSalt, 64)
  return `${useSalt}:${(hashedBuffer as Buffer).toString('hex')}`
}

/**
 * Verify a value against a hash
 */
export async function verifyHash(value: string, storedHash: string): Promise<boolean> {
  try {
    const [salt, hash] = storedHash.split(':')
    if (!salt || !hash) return false

    const newHash = await scryptAsync(value, salt, 64)
    return (newHash as Buffer).toString('hex') === hash
  } catch {
    return false
  }
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length = 32): string {
  return randomBytes(length).toString('hex')
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars = 4): string {
  if (!data || data.length <= visibleChars * 2) {
    return '*'.repeat(data?.length || 8)
  }
  
  const start = data.substring(0, visibleChars)
  const end = data.substring(data.length - visibleChars)
  const middle = '*'.repeat(Math.min(data.length - visibleChars * 2, 8))
  
  return `${start}${middle}${end}`
}

/**
 * Encrypt API key for storage
 */
export async function encryptApiKey(apiKey: string): Promise<string> {
  return encrypt(apiKey)
}

/**
 * Decrypt API key from storage
 */
export async function decryptApiKey(encryptedKey: string): Promise<string> {
  return decrypt(encryptedKey)
}

/**
 * Encrypt sensitive user data
 */
export async function encryptUserData(data: Record<string, unknown>): Promise<string> {
  return encrypt(JSON.stringify(data))
}

/**
 * Decrypt sensitive user data
 */
export async function decryptUserData(encryptedData: string): Promise<Record<string, unknown>> {
  const decrypted = await decrypt(encryptedData)
  return JSON.parse(decrypted)
}
