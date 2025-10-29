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

-- Indexes for performance (critical for 4M+ records)
CREATE INDEX IF NOT EXISTS idx_first_name ON demographic_records(first_name);
CREATE INDEX IF NOT EXISTS idx_last_name ON demographic_records(last_name);
CREATE INDEX IF NOT EXISTS idx_city ON demographic_records(city);
CREATE INDEX IF NOT EXISTS idx_state ON demographic_records(state);
CREATE INDEX IF NOT EXISTS idx_zip_code ON demographic_records(zip_code);
CREATE INDEX IF NOT EXISTS idx_ssn ON demographic_records(ssn);
CREATE INDEX IF NOT EXISTS idx_date_of_birth ON demographic_records(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_full_name ON demographic_records(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_location ON demographic_records(city, state, zip_code);

-- Full-text search index (GIN index for better search performance)
ALTER TABLE demographic_records ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_search_vector ON demographic_records USING GIN(search_vector);

-- Trigger function to update search_vector on insert/update
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

-- Update existing records to populate search_vector
UPDATE demographic_records SET search_vector = 
  setweight(to_tsvector('english', COALESCE(first_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(last_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(city, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(state, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(address, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(zip_code, '')), 'C')
WHERE search_vector IS NULL;

