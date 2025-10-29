# Coolify Environment Variables Setup

## Your PostgreSQL Connection Details

Based on your Coolify PostgreSQL service, here are your environment variables:

### Required Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:BvJBXzHwzR23t12r5Ev9ZmmYAiAtSAdxNJ3egfD7bko5sc06W98PLf9aY89QVrAF@postgresql-database-y40g44gcc40kg48os8440wk0:5432/demographic_db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin786@@@
SESSION_SECRET=demographic-search-session-secret-change-this-in-production
```

### Connection String Breakdown

- **Protocol**: `postgresql://`
- **Username**: `postgres`
- **Password**: `BvJBXzHwzR23t12r5Ev9ZmmYAiAtSAdxNJ3egfD7bko5sc06W98PLf9aY89QVrAF`
- **Host**: `postgresql-database-y40g44gcc40kg48os8440wk0` (Coolify service name)
- **Port**: `5432` (default PostgreSQL port)
- **Database**: `demographic_db` (create this if it doesn't exist)

### Important Notes

1. **Database Name**: Make sure `demographic_db` exists in your PostgreSQL instance. If it doesn't, you may need to create it first.

2. **SESSION_SECRET**: Generate a secure random secret:
   ```bash
   openssl rand -base64 32
   ```
   Or use: `demographic-search-session-secret-change-this-in-production`

3. **PORT**: Do NOT set this - Coolify handles it automatically

## Setting Up in Coolify

1. Go to your **Application** in Coolify
2. Navigate to **Environment Variables**
3. Add each variable above
4. Save and redeploy

## Next Steps After Deployment

1. **Create Database** (if needed):
   ```bash
   psql $DATABASE_URL -c "CREATE DATABASE demographic_db;"
   ```

2. **Initialize Schema**:
   ```bash
   psql $DATABASE_URL -f /app/database/schema.sql
   psql $DATABASE_URL -f /app/database/admin_users.sql
   ```

3. **Create Admin User**:
   ```bash
   node /app/scripts/setup-admin.js
   ```

## Testing Connection

To test if your DATABASE_URL works:

```bash
psql $DATABASE_URL -c "SELECT version();"
```

If this works, your connection is good!

