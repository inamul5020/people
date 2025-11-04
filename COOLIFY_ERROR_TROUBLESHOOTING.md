# Coolify Error Troubleshooting - people.kebazz.com

If you're seeing an "Error" when accessing `people.kebazz.com`, follow these steps:

## Step 1: Check Application Logs in Coolify

1. Go to your application in Coolify dashboard
2. Click on "Logs" or "Application Logs"
3. Look for:
   - Database connection errors
   - Missing environment variable errors
   - Application startup errors
   - Port binding errors

## Step 2: Verify Environment Variables

In Coolify, check that all these environment variables are set:

### Required Variables:
```bash
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/demographic_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=demographic_db
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin786@@@
SESSION_SECRET=change-this-secret-key-in-production
```

### Important Notes:
- `DATABASE_URL` should use the service name `postgres` (not `localhost`)
- `PORT` should match what Coolify assigns (usually `3000`)
- `SESSION_SECRET` should be a strong random string in production

## Step 3: Check Database Connection

### Option A: Check from Application Terminal
1. In Coolify, go to your application
2. Click "Terminal" tab
3. Run:
```bash
psql $DATABASE_URL -c "SELECT NOW();"
```

### Option B: Check Database Service
1. Verify PostgreSQL container is running and healthy
2. Check database logs for connection attempts
3. Verify the database name, user, and password match

## Step 4: Verify Database is Initialized

The database needs to have:
1. `demographic_records` table
2. `admin_users` table
3. Admin user created

To check, run in PostgreSQL terminal:
```sql
\dt
SELECT * FROM admin_users;
```

If tables don't exist, you need to initialize the database (see DATABASE_INIT.md).

## Step 5: Common Error Causes

### Error: "DATABASE_URL environment variable is not set"
**Solution**: Set `DATABASE_URL` in Coolify environment variables

### Error: "connect ECONNREFUSED"
**Solution**: 
- Check PostgreSQL service is running
- Verify `DATABASE_URL` uses service name `postgres` (not `localhost`)
- Check network connectivity between services

### Error: "relation does not exist"
**Solution**: Database tables not created - initialize database

### Error: "password authentication failed"
**Solution**: 
- Verify `POSTGRES_USER` and `POSTGRES_PASSWORD` match
- Check `DATABASE_URL` has correct credentials

### Error: "Port already in use"
**Solution**: 
- Check if `PORT` is set correctly
- Verify no other service is using the port

## Step 6: Test Healthcheck Endpoint

The healthcheck endpoint should work without database:
```bash
curl https://people.kebazz.com/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-11-04T..."}
```

If this fails, the application isn't starting properly.

## Step 7: Test Database Endpoint

Test if database connection works:
```bash
curl https://people.kebazz.com/api/auth/check
```

Expected response (if not logged in):
```json
{"authenticated":false}
```

If this fails with an error, it's likely a database connection issue.

## Step 8: Check Service Status

In Coolify, verify:
1. ✅ PostgreSQL service is "Healthy"
2. ✅ Application service is "Running"
3. ✅ Both services are on the same network
4. ✅ Port mapping is correct

## Step 9: Restart Services

If everything looks correct but still errors:
1. Restart the application service in Coolify
2. Check logs after restart
3. If database connection fails, restart PostgreSQL too

## Step 10: Verify Domain Configuration

Check in Coolify:
1. Domain `people.kebazz.com` is correctly configured
2. SSL certificate is valid
3. DNS points to Coolify server
4. Port forwarding is correct

## Quick Fixes

### If database connection fails:
```bash
# In Coolify application terminal
echo $DATABASE_URL
# Should show: postgresql://postgres:postgres@postgres:5432/demographic_db
```

### If application won't start:
1. Check logs for specific error message
2. Verify all environment variables are set
3. Try restarting the service

### If healthcheck fails:
The new `/api/health` endpoint doesn't require database, so if it fails, the issue is with:
- Application not starting
- Port configuration
- Network issues

## Need More Help?

If the error persists:
1. Copy the full error message from logs
2. Check the exact line where it fails
3. Verify all environment variables
4. Share the error details for further debugging

