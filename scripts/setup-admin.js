// Try to load dotenv if available (not required in production)
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not available, use environment variables directly
}

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  console.log('Setting up admin user...');
  console.log(`Username: ${username}`);

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = CURRENT_TIMESTAMP',
      [username, passwordHash]
    );

    console.log('✓ Admin user created/updated successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Failed to create admin user:', error.message);
    await pool.end();
    process.exit(1);
  }
}

setupAdmin();

