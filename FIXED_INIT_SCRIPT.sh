#!/bin/bash
# Paste this entire script into Coolify terminal

cat > /app/init-db.js << 'EOFSCRIPT'
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  try {
    console.log('Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database');

    // Create demographic_records table
    console.log('\n📄 Creating demographic_records table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS demographic_records (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        address VARCHAR(500),
        city VARCHAR(255),
        state VARCHAR(255),
        zip_code VARCHAR(10),
        ssn VARCHAR(11) UNIQUE,
        date_of_birth DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_first_name ON demographic_records(first_name);
      CREATE INDEX IF NOT EXISTS idx_last_name ON demographic_records(last_name);
      CREATE INDEX IF NOT EXISTS idx_city ON demographic_records(city);
      CREATE INDEX IF NOT EXISTS idx_state ON demographic_records(state);
      CREATE INDEX IF NOT EXISTS idx_zip_code ON demographic_records(zip_code);
      CREATE INDEX IF NOT EXISTS idx_ssn ON demographic_records(ssn);
      CREATE INDEX IF NOT EXISTS idx_date_of_birth ON demographic_records(date_of_birth);
      CREATE INDEX IF NOT EXISTS idx_full_name ON demographic_records(first_name, last_name);
      CREATE INDEX IF NOT EXISTS idx_location ON demographic_records(city, state, zip_code);
    `);
    
    // Full-text search
    await pool.query(`
      ALTER TABLE demographic_records ADD COLUMN IF NOT EXISTS search_vector tsvector;
      CREATE INDEX IF NOT EXISTS idx_search_vector ON demographic_records USING GIN(search_vector);
      
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
    `);
    
    console.log('✅ Schema created successfully');

    // Create admin_users table
    console.log('\n📄 Creating admin_users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);
    `);
    console.log('✅ Admin users table created');

    // Create admin user
    console.log('\n👤 Creating admin user...');
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin786@@@';
    const passwordHash = await bcrypt.hash(password, 10);
    
    await pool.query(
      `INSERT INTO admin_users (username, password_hash, is_active)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (username) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         is_active = EXCLUDED.is_active,
         updated_at = CURRENT_TIMESTAMP`,
      [username, passwordHash]
    );
    
    console.log(`✅ Admin user "${username}" created/updated successfully`);
    console.log('\n🎉 Database initialization complete!');
    console.log(`\nLogin credentials:`);
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    await pool.end();
    process.exit(1);
  }
}

initDatabase();
EOFSCRIPT

cd /app && node init-db.js

