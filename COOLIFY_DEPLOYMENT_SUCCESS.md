# Coolify Deployment - Success Guide

This document contains the **working solution** for deploying the Demographic Search App on Coolify.

## ✅ Working Configuration

### Docker Compose File
Use: `docker-compose.coolify.image.yml`

This file uses:
- **Pre-built Docker Hub image** for the application (no build needed)
- **Official PostgreSQL image** for the database
- **Automatic port management** by Coolify (expose only, no ports mapping)

### Why This Works
1. **No Build Failures**: Uses pre-built image from Docker Hub
2. **Fast Deployment**: No waiting for builds
3. **Reliable**: Same image that works locally

## 📋 Setup Steps

### Step 1: Build and Push Docker Image (One-Time, Local)

Build the image locally and push to Docker Hub:

```bash
cd /root/demographic-search-app
docker build -t inamul5020/demographic-search-app:latest .
docker push inamul5020/demographic-search-app:latest
```

Or use the script:
```bash
./build-and-push-dockerhub.sh
```

### Step 2: Configure Coolify

1. **Create New Application** in Coolify
2. **Select Docker Compose** deployment method
3. **Set Docker Compose File**: `docker-compose.coolify.image.yml`
4. **Connect Git Repository** (or upload code)

### Step 3: Set Environment Variables

In Coolify, configure these environment variables:

```bash
POSTGRES_DB=demographic_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password-here
DATABASE_URL=postgresql://postgres:your-secure-password-here@postgres:5432/demographic_db
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin786@@@
SESSION_SECRET=your-secure-random-secret-key-here
```

**Important**: 
- Use strong passwords for `POSTGRES_PASSWORD` and `SESSION_SECRET`
- `DATABASE_URL` must use `postgres` (service name), not `localhost`

### Step 4: Deploy

1. Click **Deploy** in Coolify
2. Wait for services to start
3. Verify PostgreSQL is **Healthy**
4. Verify Application is **Running**

### Step 5: Initialize Database (First Time Only)

If the database directory already exists (from previous deployment), PostgreSQL skips automatic initialization. You need to create the database manually:

#### Option A: Using Template Database (Recommended)

1. **Open PostgreSQL Terminal** in Coolify
2. **Connect to template1**:
   ```bash
   psql -U postgres -d template1
   ```
3. **Create the database**:
   ```sql
   CREATE DATABASE demographic_db;
   ```
4. **Exit and connect to new database**:
   ```sql
   \q
   ```
   ```bash
   psql -U postgres -d demographic_db
   ```
5. **Create tables and admin user** (see SQL below)

#### Option B: Fresh Start (If Database is Corrupted)

1. **Stop PostgreSQL service** in Coolify
2. **Delete the `postgres_data` volume**
3. **Redeploy** - init scripts will run automatically

### Step 6: Database Schema SQL

Once connected to `demographic_db`, run this SQL:

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

DROP TRIGGER IF EXISTS demographic_search_trigger ON demographic_records;
CREATE TRIGGER demographic_search_trigger
  BEFORE INSERT OR UPDATE ON demographic_records
  FOR EACH ROW EXECUTE FUNCTION demographic_search_update();
```

### Step 7: Verify

```sql
-- Check tables exist
\dt

-- Verify admin user
SELECT id, username, is_active FROM admin_users;
```

Exit: `\q`

## 🎯 Access the Application

1. **URL**: `https://people.kebazz.com` (or your configured domain)
2. **Login Credentials**:
   - Username: `admin`
   - Password: `admin786@@@`

## 🔄 Updating the Application

When you need to update:

1. **Build new image locally**:
   ```bash
   docker build -t inamul5020/demographic-search-app:latest .
   docker push inamul5020/demographic-search-app:latest
   ```

2. **Restart application service** in Coolify (it will pull the new image)

## 📝 Key Files

- `docker-compose.coolify.image.yml` - Working Coolify configuration
- `database/00-create-db.sql` - Database creation script (auto-runs on fresh volumes)
- `database/01-init-schema.sql` - Schema initialization (auto-runs on fresh volumes)
- `build-and-push-dockerhub.sh` - Script to build and push images

## 🐛 Troubleshooting

### Database "demographic_db" does not exist
**Solution**: Follow Step 5 above to create the database manually

### Port already allocated
**Solution**: Make sure `docker-compose.coolify.image.yml` uses `expose` only, not `ports`

### Application won't start
**Solution**: 
- Check application logs in Coolify
- Verify all environment variables are set
- Check healthcheck endpoint: `/api/health`

### Build failures
**Solution**: Use `docker-compose.coolify.image.yml` (pre-built image) instead of building in Coolify

## ✅ Success Checklist

- [ ] Docker image built and pushed to Docker Hub
- [ ] Coolify application created with `docker-compose.coolify.image.yml`
- [ ] All environment variables configured
- [ ] Services deployed and running
- [ ] Database `demographic_db` created
- [ ] Tables and admin user initialized
- [ ] Application accessible at domain
- [ ] Can log in with admin credentials

## 📚 Additional Resources

- `COOLIFY_DOCKERHUB_SETUP.md` - Detailed Docker Hub setup guide
- `COOLIFY_DB_FIX_COMMANDS.md` - Step-by-step database fix commands
- `QUICK_FIX_DATABASE.md` - Quick database troubleshooting
- `COOLIFY_DEPLOYMENT.md` - Original deployment guide

## 🎉 Notes

- The Docker Hub image approach is **much more reliable** than building in Coolify
- Database initialization scripts only run on **completely fresh** volumes
- If database directory exists, you must create the database manually
- Always use `postgres` (service name) in `DATABASE_URL`, not `localhost`

---

**Last Updated**: November 4, 2025  
**Status**: ✅ Working Solution

