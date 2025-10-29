# Database Initialization Steps in Coolify

## Accessing the Application Terminal

1. In Coolify dashboard, go to your **Application**
2. Look for a tab called **"Exec"** or **"Terminal"** or **"Console"**
3. Click on it - this opens a terminal inside your running container

You should see something like:
```
/app $
```

Or a prompt indicating you're inside the container.

## Step 1: Check if Database Files Are Present

First, verify the database schema files are available:

```bash
ls -la /app/database/
```

You should see:
- `schema.sql`
- `admin_users.sql`

If you see `app/` instead of `/app/`, the files might be in the current directory. Try:

```bash
ls -la ./database/
ls -la database/
```

## Step 2: Create Database (if needed)

If `demographic_db` doesn't exist, create it:

```bash
psql $DATABASE_URL -c "CREATE DATABASE demographic_db;"
```

Or if that doesn't work, use the default postgres database first:

```bash
psql postgresql://postgres:BvJBXzHwzR23t12r5Ev9ZmmYAiAtSAdxNJ3egfD7bko5sc06W98PLf9aY89QVrAF@postgresql-database-y40g44gcc40kg48os8440wk0:5432/postgres -c "CREATE DATABASE demographic_db;"
```

## Step 3: Run Schema Files

Run the database schema files:

```bash
# Option 1: If files are in /app/database/
psql $DATABASE_URL -f /app/database/schema.sql
psql $DATABASE_URL -f /app/database/admin_users.sql

# Option 2: If files are in ./database/ (current directory)
psql $DATABASE_URL -f ./database/schema.sql
psql $DATABASE_URL -f ./database/admin_users.sql

# Option 3: If files are in database/ (relative)
psql $DATABASE_URL -f database/schema.sql
psql $DATABASE_URL -f database/admin_users.sql
```

## Step 4: Create Admin User

```bash
# Option 1: If script is in /app/scripts/
node /app/scripts/setup-admin.js

# Option 2: If script is in ./scripts/
node ./scripts/setup-admin.js

# Option 3: If script is in scripts/
node scripts/setup-admin.js
```

## Step 5: Verify Setup

Test that everything worked:

```bash
# Check if tables exist
psql $DATABASE_URL -c "\dt"

# Check if admin user exists
psql $DATABASE_URL -c "SELECT username FROM admin_users;"
```

You should see the `admin` user listed.

## Troubleshooting

### "psql: command not found"
The container might not have psql. Install it:

```bash
apk add --no-cache postgresql-client
```

Or use Node.js to initialize instead.

### "File not found"
If schema files aren't in the container, you may need to copy them or rebuild the image.

### "Database does not exist"
Make sure the database name in DATABASE_URL matches what exists. Check:

```bash
psql postgresql://postgres:PASSWORD@postgresql-database-y40g44gcc40kg48os8440wk0:5432/postgres -c "\l"
```

This lists all databases.

