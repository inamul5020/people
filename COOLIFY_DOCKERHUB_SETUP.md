# Coolify Setup with Docker Hub Image

This guide shows how to use the pre-built Docker Hub image for the application while keeping the PostgreSQL database.

## Overview

- **Application**: Uses pre-built image from Docker Hub (`inamul5020/demographic-search-app:latest`)
- **Database**: Uses official PostgreSQL image (`postgres:15-alpine`) - already pre-built
- **Database Initialization**: Must be done manually after deployment

## Step 1: Use Docker Hub Image Compose File

In Coolify, set the Docker Compose file to: `docker-compose.coolify.image.yml`

This file:
- Uses `inamul5020/demographic-search-app:latest` from Docker Hub (no build needed!)
- Uses `postgres:15-alpine` (official PostgreSQL image)
- Both are pre-built images, so no build step required

## Step 2: Set Environment Variables

In Coolify, configure these environment variables:

```bash
POSTGRES_DB=demographic_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
DATABASE_URL=postgresql://postgres:your-secure-password@postgres:5432/demographic_db
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin786@@@
SESSION_SECRET=your-secure-random-secret
```

## Step 3: Deploy

1. Deploy the application in Coolify
2. Wait for both services to be running
3. Verify PostgreSQL is healthy

## Step 4: Initialize Database

After deployment, you need to initialize the database tables and admin user.

### Option A: Using Coolify PostgreSQL Terminal (Recommended)

1. In Coolify, go to your PostgreSQL container
2. Click "Terminal" tab
3. Connect to database:
   ```bash
   psql -U postgres -d demographic_db
   ```
4. Copy and paste the entire contents of `COOLIFY_DB_INIT.sql`
5. Or run it directly:
   ```bash
   # If you can access the file
   psql -U postgres -d demographic_db < /path/to/COOLIFY_DB_INIT.sql
   ```

### Option B: Quick SQL Commands

In PostgreSQL terminal (`psql -U postgres -d demographic_db`), run:

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

-- Create demographic_records table (if needed for import)
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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_first_name ON demographic_records(first_name);
CREATE INDEX IF NOT EXISTS idx_last_name ON demographic_records(last_name);
CREATE INDEX IF NOT EXISTS idx_city ON demographic_records(city);
CREATE INDEX IF NOT EXISTS idx_state ON demographic_records(state);
CREATE INDEX IF NOT EXISTS idx_zip_code ON demographic_records(zip_code);
CREATE INDEX IF NOT EXISTS idx_ssn ON demographic_records(ssn);

-- Verify
SELECT 'Tables created!' as status;
SELECT id, username, is_active FROM admin_users;
```

### Option C: One-Line Command

From PostgreSQL container shell (not psql):
```bash
psql -U postgres -d demographic_db -c "CREATE TABLE IF NOT EXISTS admin_users (id SERIAL PRIMARY KEY, username VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, is_active BOOLEAN DEFAULT TRUE); CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username); INSERT INTO admin_users (username, password_hash, is_active) VALUES ('admin', '\$2b\$10\$uVxskphYOcrBJ26iU5jKIerKlGhf9LZzfN2drZ/tKODYvf8yLk2uO', TRUE) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = EXCLUDED.is_active, updated_at = CURRENT_TIMESTAMP;"
```

## Step 5: Verify

1. Check admin user exists:
   ```sql
   SELECT id, username, is_active FROM admin_users;
   ```

2. Test application:
   - Visit `https://people.kebazz.com`
   - Login with: `admin` / `admin786@@@`

## Benefits of This Approach

✅ **No build time** - Both images are pre-built  
✅ **Faster deployment** - No waiting for builds  
✅ **Reliable** - No build failures  
✅ **Easy updates** - Just push new image to Docker Hub  

## Updating the Application

When you need to update the app:

1. Build locally:
   ```bash
   docker build -t inamul5020/demographic-search-app:latest .
   docker push inamul5020/demographic-search-app:latest
   ```

2. In Coolify, restart the application service (it will pull the new image)

## Notes

- **PostgreSQL image**: Already pre-built (`postgres:15-alpine`) - no build needed
- **Application image**: Pre-built on Docker Hub - no build needed
- **Database data**: Stored in Docker volume, persists across restarts
- **Database schema**: Must be initialized manually (one-time setup)

## Troubleshooting

### Database connection errors
- Verify `DATABASE_URL` uses service name `postgres` (not `localhost`)
- Check PostgreSQL service is healthy
- Verify credentials match

### Admin user not found
- Run the database initialization SQL
- Check `admin_users` table exists: `\dt` in psql
- Verify admin user: `SELECT * FROM admin_users;`

### Application won't start
- Check application logs in Coolify
- Verify environment variables are set
- Check healthcheck endpoint: `/api/health`

