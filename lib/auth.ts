import { cookies } from 'next/headers';
import { verifyAdminCredentials } from './dbAuth';

const SESSION_COOKIE_NAME = 'demographic_session';

export interface SessionData {
  authenticated: boolean;
  username: string;
}

export async function createSession(username: string): Promise<void> {
  const cookieStore = await cookies();
  const sessionData: SessionData = {
    authenticated: true,
    username,
  };
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie) {
    return null;
  }

  try {
    const sessionData: SessionData = JSON.parse(sessionCookie.value);
    return sessionData;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Verify credentials against database
 */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const result = await verifyAdminCredentials(username, password);
  return result.valid;
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  if (!session || !session.authenticated) {
    throw new Error('Unauthorized');
  }
  return session;
}

