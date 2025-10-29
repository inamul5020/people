#!/usr/bin/env node

/**
 * Initialize database schema without needing psql
 * Run this from the application terminal in Coolify
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database');

    // Read and execute schema.sql
    console.log('\n📄 Running schema.sql...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      // Execute each statement (split by semicolon, but be careful with triggers)
      await pool.query(schema);
      console.log('✅ Schema created successfully');
    } else {
      console.log('⚠️  schema.sql not found at:', schemaPath);
      console.log('Trying alternative paths...');
      
      // Try other common paths
      const altPaths = [
        '/app/database/schema.sql',
        './database/schema.sql',
        'database/schema.sql',
      ];
      
      let found = false;
      for (const altPath of altPaths) {
        if (fs.existsSync(altPath)) {
          console.log(`Found at: ${altPath}`);
          const schema = fs.readFileSync(altPath, 'utf8');
          await pool.query(schema);
          console.log('✅ Schema created successfully');
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.log('❌ Could not find schema.sql. Please provide the path.');
        process.exit(1);
      }
    }

    // Read and execute admin_users.sql
    console.log('\n📄 Running admin_users.sql...');
    const adminPath = path.join(__dirname, '../database/admin_users.sql');
    
    if (fs.existsSync(adminPath)) {
      const adminSchema = fs.readFileSync(adminPath, 'utf8');
      await pool.query(adminSchema);
      console.log('✅ Admin users table created successfully');
    } else {
      // Try alternative paths
      const altPaths = [
        '/app/database/admin_users.sql',
        './database/admin_users.sql',
        'database/admin_users.sql',
      ];
      
      let found = false;
      for (const altPath of altPaths) {
        if (fs.existsSync(altPath)) {
          console.log(`Found at: ${altPath}`);
          const adminSchema = fs.readFileSync(altPath, 'utf8');
          await pool.query(adminSchema);
          console.log('✅ Admin users table created successfully');
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.log('⚠️  admin_users.sql not found, creating table manually...');
        // Create admin_users table manually
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
        console.log('✅ Admin users table created manually');
      }
    }

    // Create admin user
    console.log('\n👤 Creating admin user...');
    const bcrypt = require('bcrypt');
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
    console.error('\n❌ Error initializing database:', error.message);
    console.error('Stack:', error.stack);
    await pool.end();
    process.exit(1);
  }
}

initDatabase();

