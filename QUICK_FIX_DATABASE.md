# Quick Fix: Database Doesn't Exist

If you see `database "demographic_db" does not exist`, the database wasn't created. Here's how to fix it:

## Option 1: Delete Volume and Redeploy (Fresh Start)

1. In Coolify, stop the PostgreSQL service
2. Delete the `postgres_data` volume
3. Redeploy - the init scripts will run automatically

## Option 2: Create Database Manually (Quick Fix)

In Coolify PostgreSQL terminal:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE demographic_db;

# Exit psql
\q
```

Then run the schema initialization:

```bash
# Connect to the new database
psql -U postgres -d demographic_db

# Run the schema SQL (copy from database/01-init-schema.sql)
# Or use the COOLIFY_DB_INIT.sql file
```

## Option 3: Use SQL Script Directly

```bash
# Create database
psql -U postgres -c "CREATE DATABASE demographic_db;"

# Then run schema
psql -U postgres -d demographic_db -f /path/to/01-init-schema.sql
```

## Why This Happens

PostgreSQL only runs init scripts (`/docker-entrypoint-initdb.d/*`) when the database directory is **completely empty**. If the volume already exists from a previous deployment, init scripts are skipped.

## After Fix

Once the database exists and schema is created, the application should work. Login with:
- Username: `admin`
- Password: `admin786@@@`

