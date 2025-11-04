-- Complete database initialization for Coolify
-- Run this in the PostgreSQL terminal in Coolify

-- Step 1: Create demographic_records table
CREATE TABLE IF NOT EXISTS demographic_records (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  city VARCHAR(255),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  ssn VARCHAR(11) UNIQUE,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_first_name ON demographic_records(first_name);
CREATE INDEX IF NOT EXISTS idx_last_name ON demographic_records(last_name);
CREATE INDEX IF NOT EXISTS idx_city ON demographic_records(city);
CREATE INDEX IF NOT EXISTS idx_state ON demographic_records(state);
CREATE INDEX IF NOT EXISTS idx_zip_code ON demographic_records(zip_code);
CREATE INDEX IF NOT EXISTS idx_ssn ON demographic_records(ssn);
CREATE INDEX IF NOT EXISTS idx_date_of_birth ON demographic_records(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_full_name ON demographic_records(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_location ON demographic_records(city, state, zip_code);

-- Full-text search
ALTER TABLE demographic_records ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_search_vector ON demographic_records USING GIN(search_vector);

-- Trigger function for search_vector
CREATE OR REPLACE FUNCTION demographic_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.first_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.last_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.state, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.zip_code, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS demographic_search_trigger ON demographic_records;
CREATE TRIGGER demographic_search_trigger
  BEFORE INSERT OR UPDATE ON demographic_records
  FOR EACH ROW EXECUTE FUNCTION demographic_search_update();

-- Update existing records
UPDATE demographic_records SET search_vector = 
  setweight(to_tsvector('english', COALESCE(first_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(last_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(city, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(state, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(address, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(zip_code, '')), 'C')
WHERE search_vector IS NULL;

-- Step 2: Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);

-- Step 3: Insert admin user (password: admin786@@@)
-- The bcrypt hash for 'admin786@@@' is: $2b$10$uVxskphYOcrBJ26iU5jKIerKlGhf9LZzfN2drZ/tKODYvf8yLk2uO
INSERT INTO admin_users (username, password_hash, is_active)
VALUES (
  'admin',
  '$2b$10$uVxskphYOcrBJ26iU5jKIerKlGhf9LZzfN2drZ/tKODYvf8yLk2uO',
  TRUE
)
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- Step 4: Verify tables were created
SELECT 'Tables created successfully!' as status;
\dt
SELECT 'Admin user created!' as status;
SELECT id, username, is_active, created_at FROM admin_users;

