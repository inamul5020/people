#!/bin/bash
set -e

# Create necessary directories
mkdir -p /run/postgresql
chown postgres:postgres /run/postgresql
chmod 755 /run/postgresql

# Initialize PostgreSQL if needed
if [ ! -d "$PGDATA" ] || [ -z "$(ls -A $PGDATA)" ]; then
  echo "Initializing PostgreSQL..."
  su-exec postgres initdb -D "$PGDATA"
fi

# Start PostgreSQL in background
echo "Starting PostgreSQL..."
su-exec postgres pg_ctl -D "$PGDATA" -o "-c listen_addresses='localhost'" -w start

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until su-exec postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  sleep 1
done

# Create database if it doesn't exist
echo "Ensuring database exists..."
su-exec postgres psql -U "$POSTGRES_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'" | grep -q 1 || \
  su-exec postgres createdb -U "$POSTGRES_USER" "$POSTGRES_DB"

# Run database schema if database is empty
echo "Setting up database schema..."
if su-exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" | grep -q "0"; then
  echo "Database is empty, running initial setup..."
  
  # Check if schema files exist
  if [ -f "/app/database/schema.sql" ]; then
    su-exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /app/database/schema.sql
  fi
  
  if [ -f "/app/database/admin_users.sql" ]; then
    su-exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /app/database/admin_users.sql
  fi
  
  # Create admin user
  if [ -f "/app/scripts/setup-admin.js" ]; then
    echo "Creating admin user..."
    cd /app
    node scripts/setup-admin.js || echo "Admin user setup skipped (may already exist)"
  fi
  
  echo "Database setup complete!"
else
  echo "Database already has tables, skipping schema setup"
fi

# Set environment variable for Next.js
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/demographic_db}"

# Start Next.js application
echo "Starting Next.js application..."
exec su-exec nextjs "$@"

