/**
 * AI Health Check API
 * 
 * GET /api/ai/health
 * 
 * Checks the health of the AI microservice.
 * Public endpoint for monitoring.
 * 
 * Built by Carphatian
 */

import { NextResponse } from 'next/server'
import { checkAIServiceHealth } from '@/lib/ai-service'

export async function GET() {
  try {
    const health = await checkAIServiceHealth()
    
    return NextResponse.json({
      status: 'healthy',
      ai_service: health,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('AI service health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        ai_service: null,
        error: error instanceof Error ? error.message : 'AI service unavailable',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
