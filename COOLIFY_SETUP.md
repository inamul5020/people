# Coolify Database Setup Guide

## Getting Your Database Credentials

You have two options:

### Option 1: Use Coolify's Built-in PostgreSQL (Recommended)

1. **Create PostgreSQL Service in Coolify:**
   - Go to **Resources** → **New Resource** → **PostgreSQL**
   - Set a name (e.g., `demographic-postgres`)
   - Set a username (e.g., `postgres`)
   - Set a password (e.g., `your-secure-password`)
   - Set database name: `demographic_db`
   - Deploy it

2. **Get the Connection String:**
   - After deployment, Coolify will show the connection details
   - The format will be: `postgresql://username:password@service-name:5432/database_name`
   - Example: `postgresql://postgres:mypassword@demographic-postgres:5432/demographic_db`

3. **In Your Application Environment Variables:**
   ```
   DATABASE_URL=postgresql://postgres:mypassword@demographic-postgres:5432/demographic_db
   ```

### Option 2: Use External PostgreSQL

If you have an existing PostgreSQL database:

1. **Get Connection Details:**
   - Host/IP address
   - Port (usually 5432)
   - Username
   - Password
   - Database name

2. **Format:**
   ```
   DATABASE_URL=postgresql://username:password@host:port/database_name
   ```

   Example:
   ```
   DATABASE_URL=postgresql://myuser:mypass@192.168.1.100:5432/demographic_db
   ```

## Setting Up the Database Schema

After setting DATABASE_URL, you need to:

### 1. Connect to Database (via Coolify Exec)

In Coolify, go to your application → **Exec** tab, then run:

```bash
# First, create the database (if using external PostgreSQL)
# Skip this step if using Coolify's PostgreSQL (database is auto-created)

# Install psql client (if needed)
# Then run schema files
```

Or use Docker exec:
```bash
# Copy schema files to container
docker cp database/schema.sql <container-id>:/tmp/
docker cp database/admin_users.sql <container-id>:/tmp/

# Execute
docker exec -i <container-id> psql $DATABASE_URL -f /tmp/schema.sql
docker exec -i <container-id> psql $DATABASE_URL -f /tmp/admin_users.sql
```

### 2. Create Admin User

```bash
# In Coolify Exec or via Docker exec
node scripts/setup-admin.js
```

Or manually via SQL:
```sql
-- Connect to database using psql
psql $DATABASE_URL

-- Then run (replace 'admin' and password hash):
-- Password 'admin786@@@' hashed with bcrypt
INSERT INTO admin_users (username, password_hash, is_active)
VALUES ('admin', '$2b$10$...', TRUE)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;
```

## Quick Setup Steps

1. ✅ Create PostgreSQL in Coolify (or use existing)
2. ✅ Get connection string from Coolify
3. ✅ Set `DATABASE_URL` in application environment variables
4. ✅ Run database schema: `database/schema.sql`
5. ✅ Run admin table: `database/admin_users.sql`  
6. ✅ Create admin user: `node scripts/setup-admin.js`
7. ✅ Deploy application

## Troubleshooting

### Can't Connect to Database
- Verify DATABASE_URL format is correct
- Check PostgreSQL service is running in Coolify
- Ensure network connectivity between services

### Authentication Failed
- Verify username and password are correct
- Check if user has permission to access the database

### Database Doesn't Exist
- Create it: `CREATE DATABASE demographic_db;`
- Or use Coolify's auto-created database

