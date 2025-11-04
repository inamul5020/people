import { NextResponse } from 'next/server';

/**
 * Simple healthcheck endpoint that doesn't require database connection
 * Used by Coolify for healthchecks
 */
export async function GET() {
  try {
    // Just return success - no database check needed for healthcheck
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

