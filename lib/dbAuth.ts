import getPool from './db';
import bcrypt from 'bcrypt';

export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
  is_active: boolean;
}

/**
 * Verify admin credentials against database
 */
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<{ valid: boolean; user?: AdminUser }> {
  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT id, username, password_hash, is_active FROM admin_users WHERE username = $1 AND is_active = TRUE',
      [username]
    );

    if (result.rows.length === 0) {
      return { valid: false };
    }

    const user = result.rows[0] as AdminUser;
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (isValid) {
      return { valid: true, user };
    }

    return { valid: false };
  } catch (error: any) {
    console.error('Error verifying credentials:', error);
    return { valid: false };
  }
}

/**
 * Create a new admin user (for initial setup)
 */
export async function createAdminUser(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const pool = getPool();
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = CURRENT_TIMESTAMP',
      [username, passwordHash]
    );

    return { success: true };
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Initialize default admin user if it doesn't exist
 */
export async function initializeDefaultAdmin(): Promise<void> {
  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM admin_users WHERE username = $1',
      ['admin']
    );

    if (parseInt(result.rows[0].count, 10) === 0) {
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
      await createAdminUser('admin', defaultPassword);
      console.log('Default admin user created');
    }
  } catch (error: any) {
    console.error('Error initializing default admin:', error);
  }
}

