# Deployment Checklist - Separate PostgreSQL

## ✅ Step-by-Step Guide for Coolify

### 1. Create PostgreSQL Database in Coolify

1. Go to **Resources** → **New Resource** → **PostgreSQL**
2. Configure:
   - **Name**: `demographic-postgres` (or any name you prefer)
   - **Username**: `postgres` (or your choice)
   - **Password**: Choose a strong password (save this!)
   - **Database Name**: `demographic_db`
3. Click **Deploy**
4. Wait for PostgreSQL to be ready

### 2. Get Database Connection String

After PostgreSQL is deployed, Coolify will show connection details. It will look like:
```
postgresql://postgres:YOUR_PASSWORD@demographic-postgres:5432/demographic_db
```

**Save this** - you'll use it as `DATABASE_URL`

### 3. Create Your Application

1. Go to **Resources** → **New Resource** → **Application**
2. Choose **Docker Image** (not Git Repository)
3. Set **Docker Image**: `inamul5020/demographic-search:latest`
4. Or if building from Git:
   - Choose **Git Repository**
   - Set **Dockerfile Path**: `Dockerfile` (the regular one, not `.with-postgres`)

### 4. Set Environment Variables

In your application's environment variables, set:

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@demographic-postgres:5432/demographic_db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin786@@@
SESSION_SECRET=generate-a-random-secret-here
```

**Important:**
- Replace `YOUR_PASSWORD` with the actual PostgreSQL password
- Replace `demographic-postgres` with your actual PostgreSQL service name
- Generate `SESSION_SECRET` using: `openssl rand -base64 32`
- Do NOT set `PORT` - Coolify handles this

### 5. Initialize Database Schema

After your application is deployed:

1. Go to your application in Coolify
2. Open the **Exec** tab (terminal access)
3. Run these commands:

```bash
# Run database schema
psql $DATABASE_URL -f /app/database/schema.sql

# Create admin_users table
psql $DATABASE_URL -f /app/database/admin_users.sql

# Create admin user (with hashed password)
node /app/scripts/setup-admin.js
```

**Or** if files aren't in the container, copy them first:

```bash
# Copy schema files (if needed)
# Then run psql commands above
```

### 6. Verify Everything Works

1. Access your application URL
2. Login with:
   - Username: `admin`
   - Password: `admin786@@@`
3. Test importing data
4. Test searching

## Troubleshooting

### Can't Connect to Database
- ✅ Check `DATABASE_URL` format is correct
- ✅ Verify PostgreSQL service name matches
- ✅ Ensure PostgreSQL is running
- ✅ Check network connectivity in Coolify

### Database Schema Not Found
- ✅ Verify you ran `schema.sql` and `admin_users.sql`
- ✅ Check database was created correctly

### Login Fails
- ✅ Verify admin user was created: `node scripts/setup-admin.js`
- ✅ Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` match what you used

### Connection Refused
- ✅ Wait a bit longer - PostgreSQL might still be starting
- ✅ Check PostgreSQL service logs in Coolify

## Quick Reference

**PostgreSQL Service**: `demographic-postgres` (or your name)  
**Database**: `demographic_db`  
**App Image**: `inamul5020/demographic-search:latest`  
**Admin Login**: `admin` / `admin786@@@`  

## Next Steps

✅ Database is separate and scalable  
✅ Can backup PostgreSQL independently  
✅ Better for production workloads  
✅ Supports 4M+ records efficiently  

