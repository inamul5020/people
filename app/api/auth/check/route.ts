import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (session && session.authenticated) {
      return NextResponse.json({ authenticated: true, username: session.username });
    }
    return NextResponse.json({ authenticated: false });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

