/**
 * Virus Scanning Utility
 * 
 * Scans uploaded files for malware using ClamAV when available.
 * Falls back to basic validation when ClamAV is not installed.
 * 
 * Built by Carphatian
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface ScanResult {
  safe: boolean
  virus?: string
  error?: string
  method: 'clamav' | 'basic'
}

/**
 * Scan a file for viruses
 */
export async function scanFile(filepath: string): Promise<ScanResult> {
  // Try ClamAV first
  try {
    const clamavResult = await scanWithClamAV(filepath)
    if (clamavResult) return clamavResult
  } catch (error) {
    console.warn('ClamAV not available, using basic validation')
  }

  // Fallback to basic validation
  return basicFileScan(filepath)
}

/**
 * Scan with ClamAV (if installed)
 */
async function scanWithClamAV(filepath: string): Promise<ScanResult | null> {
  try {
    // Check if clamscan is available
    await execAsync('which clamscan')
    
    // Scan the file
    const { stdout, stderr } = await execAsync(`clamscan --no-summary "${filepath}"`)
    
    // ClamAV output format: "filename: OK" or "filename: VirusName FOUND"
    if (stdout.includes('OK')) {
      return { safe: true, method: 'clamav' }
    }
    
    if (stdout.includes('FOUND')) {
      const virusMatch = stdout.match(/:\s+(.+)\s+FOUND/)
      const virusName = virusMatch ? virusMatch[1] : 'Unknown virus'
      return { safe: false, virus: virusName, method: 'clamav' }
    }
    
    return { safe: false, error: 'Scan failed', method: 'clamav' }
  } catch (error: any) {
    // ClamAV not installed or scan failed
    if (error.code === 1) {
      // Exit code 1 means virus found
      return { safe: false, virus: 'Detected by ClamAV', method: 'clamav' }
    }
    return null // Fall back to basic scan
  }
}

/**
 * Basic file validation (used when ClamAV is not available)
 * Checks for suspicious patterns and file types
 */
async function basicFileScan(filepath: string): Promise<ScanResult> {
  const fs = await import('fs/promises')
  
  try {
    // Read first 512 bytes for magic number detection
    const buffer = Buffer.alloc(512)
    const fileHandle = await fs.open(filepath, 'r')
    await fileHandle.read(buffer, 0, 512, 0)
    await fileHandle.close()
    
    // Check for executable file signatures
    const executableSignatures = [
      { name: 'PE executable (Windows)', pattern: Buffer.from([0x4D, 0x5A]) }, // MZ header
      { name: 'ELF executable (Linux)', pattern: Buffer.from([0x7F, 0x45, 0x4C, 0x46]) }, // ELF
      { name: 'Mach-O executable (macOS)', pattern: Buffer.from([0xCF, 0xFA, 0xED, 0xFE]) },
      { name: 'Shell script', pattern: Buffer.from('#!', 'utf-8') },
    ]
    
    for (const sig of executableSignatures) {
      if (buffer.indexOf(sig.pattern) === 0) {
        return { 
          safe: false, 
          virus: `Executable file detected: ${sig.name}`,
          method: 'basic'
        }
      }
    }
    
    // Check for suspicious JavaScript patterns
    const content = buffer.toString('utf-8', 0, 512)
    const suspiciousPatterns = [
      /eval\s*\(/i,
      /document\.write\(/i,
      /window\.location\s*=/i,
      /<script[^>]*>/i,
      /base64_decode/i,
    ]
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        return {
          safe: false,
          virus: 'Suspicious code pattern detected',
          method: 'basic'
        }
      }
    }
    
    return { safe: true, method: 'basic' }
  } catch (error: any) {
    return {
      safe: false,
      error: error.message || 'Scan failed',
      method: 'basic'
    }
  }
}

/**
 * Validate file type against whitelist
 */
export function isAllowedFileType(filename: string, mimeType: string): boolean {
  const allowedExtensions = [
    // Documents
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.odt',
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico',
    // Code/Archives (for deliverables)
    '.zip', '.rar', '.7z', '.tar', '.gz', '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.css', '.html', '.json', '.xml',
    // Media
    '.mp4', '.webm', '.mp3', '.wav', '.ogg',
  ]
  
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!ext || !allowedExtensions.includes(ext)) {
    return false
  }
  
  // Additional MIME type validation
  const dangerousMimeTypes = [
    'application/x-msdownload',
    'application/x-msdos-program',
    'application/x-executable',
    'application/x-sharedlib',
  ]
  
  return !dangerousMimeTypes.includes(mimeType)
}
