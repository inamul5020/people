# Coolify Deployment Guide

This guide will help you deploy the Demographic Data Search Application on Coolify at `people.kebazz.com`.

## Deployment Options

You have two options:
1. **Build from Git** (default) - Coolify builds from your repository
2. **Use Docker Hub Image** (recommended if builds fail) - Build locally and push to Docker Hub

See [DOCKER_BUILD.md](./DOCKER_BUILD.md) for Docker Hub deployment instructions.

## Prerequisites

1. Coolify instance running and accessible
2. PostgreSQL database accessible from Coolify
3. Git repository (GitHub, GitLab, etc.) with this code

## Deployment Steps

### 1. Push Code to Git Repository

Push your code to a Git repository (GitHub, GitLab, etc.):

```bash
cd /root/demographic-search-app
git init
git add .
git commit -m "Initial commit for Coolify deployment"
git remote add origin <your-git-repo-url>
git push -u origin main
```

### 2. Create New Resource in Coolify

1. Log in to your Coolify dashboard at `people.kebazz.com`
2. Go to **Resources** → **New Resource**
3. Choose **Application** (Docker-based)

### 3. Configure Source

- **Type**: Git Repository
- **Repository URL**: Your Git repository URL
- **Branch**: `main` or `master`
- **Build Pack**: Docker

### 4. Environment Variables

Set the following environment variables in Coolify:

#### Required Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/demographic_db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin786@@@
SESSION_SECRET=your-secret-key-change-this-to-random-string
```

**⚠️ IMPORTANT: Database Credentials**

You MUST use **REAL database credentials**, not placeholders!

**Getting Database URL:**

1. **If using Coolify PostgreSQL service:**
   - Create PostgreSQL resource in Coolify
   - Coolify will provide connection details
   - Format: `postgresql://username:password@service-name:5432/demographic_db`
   - Example: `postgresql://postgres:mypassword123@demographic-postgres:5432/demographic_db`

2. **If using external PostgreSQL:**
   - Use your existing database credentials
   - Format: `postgresql://username:password@host:port/database`
   - Example: `postgresql://myuser:mypass@192.168.1.100:5432/demographic_db`

See [COOLIFY_SETUP.md](./COOLIFY_SETUP.md) for detailed setup instructions.

**Important Note about PORT:**
- **Do NOT set PORT manually** - Coolify automatically sets this based on your application configuration
- Coolify will automatically inject the PORT environment variable
- The Dockerfile defaults to PORT=3000, but Coolify will override this with the correct port
- Next.js standalone output automatically uses the PORT from environment

#### Database Setup

Before deployment, ensure your PostgreSQL database is set up:

1. **Create Database**:
   ```sql
   CREATE DATABASE demographic_db;
   ```

2. **Run Schema Migrations**:
   ```bash
   psql -d demographic_db -f database/schema.sql
   psql -d demographic_db -f database/admin_users.sql
   ```

3. **Create Admin User**:
   - You can either run `node scripts/setup-admin.js` after deployment
   - Or manually insert the admin user with bcrypt hashed password

#### PostgreSQL Connection String Format

For Coolify, your `DATABASE_URL` should be:
```
postgresql://username:password@postgres-host:5432/demographic_db
```

If using Coolify's built-in PostgreSQL:
- Host: Use the service name (e.g., `postgres-service`)
- Port: Usually `5432`
- Username/Password: As configured in Coolify

### 5. Build Settings

- **Dockerfile Path**: `Dockerfile` (in root directory)
- **Build Command**: (Leave empty, Dockerfile handles this)
- **Start Command**: (Leave empty, Dockerfile handles this)

### 6. Domain Configuration

- Set your domain (if using custom domain)
- Or use Coolify's auto-generated domain
- Enable SSL/TLS if available

### 7. Resource Limits (Recommended)

- **Memory**: 512MB minimum (1GB recommended for 4M+ records)
- **CPU**: 0.5 cores minimum (1 core recommended)

### 8. Deploy

Click **Deploy** and wait for the build to complete.

## Post-Deployment Setup

### 1. Initialize Admin User

Once deployed, you can initialize the admin user using one of these methods:

#### Option A: Using Coolify Exec (Recommended)

1. Go to your application in Coolify
2. Click on **Exec** tab
3. Run:
   ```bash
   node scripts/setup-admin.js
   ```

#### Option B: Using Database Directly

Connect to your PostgreSQL database and insert the admin user:

```sql
-- First, generate a bcrypt hash for 'admin786@@@' using Node.js or online tool
-- Then insert:
INSERT INTO admin_users (username, password_hash, is_active) 
VALUES ('admin', '$2b$10$YOUR_BCRYPT_HASH_HERE', true)
ON CONFLICT (username) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, updated_at = CURRENT_TIMESTAMP;
```

### 2. Verify Deployment

1. Access your application URL
2. Try logging in with: `admin` / `admin786@@@`
3. Test import functionality
4. Test search functionality

## Troubleshooting

### Build Failures

- Check that all dependencies are listed in `package.json`
- Verify Dockerfile syntax
- Check build logs in Coolify

### Database Connection Issues

- Verify `DATABASE_URL` format is correct
- Check database is accessible from Coolify
- Ensure network policies allow connections

### Runtime Errors

- Check environment variables are set correctly
- Verify database tables exist
- Check application logs in Coolify

### Performance Issues

- Increase memory allocation
- Check database connection pooling
- Monitor database query performance

## Updating the Application

1. Push changes to your Git repository
2. Coolify will automatically detect changes (if auto-deploy is enabled)
3. Or manually trigger a new deployment in Coolify dashboard

## Security Notes

1. **Change Default Credentials**: Update `ADMIN_PASSWORD` in environment variables
2. **Strong Session Secret**: Use a long, random string for `SESSION_SECRET`
3. **Database Security**: Use strong database passwords
4. **SSL/TLS**: Enable HTTPS in Coolify
5. **Firewall**: Restrict database access to application only

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `ADMIN_USERNAME` | Admin username | `admin` |
| `ADMIN_PASSWORD` | Admin password (plain text, will be hashed) | `admin786@@@` |
| `SESSION_SECRET` | Session encryption secret | Random 32+ character string |
| `PORT` | Application port (set by Coolify) | `3000` |

## Notes

- Coolify will automatically set the `PORT` environment variable
- The Dockerfile is configured to use the `PORT` variable
- Make sure your database is accessible from the Coolify network
- For 4M+ records, consider database connection pooling optimization

