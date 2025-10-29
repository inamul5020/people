-- Create admin_users table for storing admin credentials
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index on username for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);

-- Admin users are created using the setup script: node scripts/setup-admin.js
-- This ensures passwords are properly hashed using bcrypt
-- The default credentials are:
--   Username: admin (or ADMIN_USERNAME from .env)
--   Password: admin123 (or ADMIN_PASSWORD from .env)
-- 
-- To create/update admin user, run:
--   node scripts/setup-admin.js

