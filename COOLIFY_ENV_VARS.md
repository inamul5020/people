# Coolify Environment Variables Guide

## Required Environment Variables

Set these in Coolify's **Environment Variables** section:

```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/demographic_db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin786@@@
SESSION_SECRET=your-secret-key-change-this-to-random-string
```

## Important: PORT Variable

**⚠️ DO NOT SET PORT MANUALLY**

- Coolify **automatically sets** the `PORT` environment variable
- It uses the port configured in your application settings
- The Dockerfile has `ENV PORT=3000` as a default, but Coolify will override this
- Next.js will automatically use whatever PORT Coolify provides

If you manually set PORT, it may conflict with Coolify's port management. **Leave it unset.**

## Environment Variable Descriptions

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | ✅ Yes | Must be `production` | `production` |
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `ADMIN_USERNAME` | ✅ Yes | Admin username for login | `admin` |
| `ADMIN_PASSWORD` | ✅ Yes | Admin password (will be hashed) | `admin786@@@` |
| `SESSION_SECRET` | ✅ Yes | Random secret for session encryption | Generate with: `openssl rand -base64 32` |
| `PORT` | ❌ No | **Automatic** - Set by Coolify | Do not set manually |

## Generating SESSION_SECRET

You can generate a secure session secret using:

```bash
openssl rand -base64 32
```

Or using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Database URL Format

```
postgresql://[username]:[password]@[host]:[port]/[database_name]
```

Example:
```
postgresql://postgres:mypassword@postgres-service:5432/demographic_db
```

If using Coolify's built-in PostgreSQL:
- Check your PostgreSQL service name in Coolify
- Usually the format is: `postgresql://[user]:[pass]@[service-name]:5432/[db]`

## Verification

After setting environment variables:

1. Save the configuration
2. Trigger a new deployment
3. Check the logs to verify:
   - Database connection is successful
   - Application starts without errors
   - PORT is automatically set by Coolify

## Troubleshooting

### Application won't start
- Verify all required variables are set (except PORT)
- Check DATABASE_URL format is correct
- Verify database is accessible from Coolify network

### Database connection errors
- Verify DATABASE_URL is correct
- Check database credentials
- Ensure database exists
- Verify network connectivity

### Port conflicts
- **Do not set PORT manually**
- Let Coolify handle port management
- Check Coolify's application port configuration

