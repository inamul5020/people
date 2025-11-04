# Coolify Database Fix - Exact Commands

## Problem
Database directory exists but `demographic_db` database doesn't exist.

## Solution: Run These Commands in PostgreSQL Container Terminal

### Step 1: Connect using template1 database
```bash
psql -U postgres -d template1
```

If that doesn't work, try:
```bash
psql -U postgres -d template0
```

### Step 2: Create the database
Once connected to psql (you'll see `template1=#` or `template0=#`), run:
```sql
CREATE DATABASE demographic_db;
```

### Step 3: Exit and connect to new database
```sql
\q
```

Then:
```bash
psql -U postgres -d demographic_db
```

### Step 4: Create tables and admin user
Once connected to `demographic_db` (you'll see `demographic_db=#`), paste this SQL:

```sql
-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);

-- Insert admin user (password: admin786@@@)
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

-- Create demographic_records table
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

-- Indexes
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

-- Trigger function
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

DROP TRIGGER IF EXISTS demographic_search_trigger ON demographic_records;
CREATE TRIGGER demographic_search_trigger
  BEFORE INSERT OR UPDATE ON demographic_records
  FOR EACH ROW EXECUTE FUNCTION demographic_search_update();
```

### Step 5: Verify
```sql
-- Check tables
\dt

-- Check admin user
SELECT id, username, is_active FROM admin_users;
```

### Step 6: Exit
```sql
\q
```

## One-Line Alternative (if template1 works)

If you can connect to template1, you can do it all in one command:

```bash
psql -U postgres -d template1 -c "CREATE DATABASE demographic_db;"
```

Then run the schema SQL separately.

## Troubleshooting

### If template1 doesn't work:
The database might be completely corrupted. You may need to:
1. Stop PostgreSQL service in Coolify
2. Delete the `postgres_data` volume
3. Redeploy (this will run init scripts automatically)

