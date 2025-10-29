#!/bin/bash
# Database initialization script for Coolify
# This can be run as a one-time setup or via Coolify Exec

set -e

echo "Initializing database..."

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

# Extract connection details from DATABASE_URL if needed
# For now, assuming DATABASE_URL is set correctly

echo "Running schema migrations..."
psql "$DATABASE_URL" -f /app/database/schema.sql

echo "Creating admin_users table..."
psql "$DATABASE_URL" -f /app/database/admin_users.sql

echo "Database initialization complete!"
echo ""
echo "Next steps:"
echo "1. Run: node scripts/setup-admin.js"
echo "   Or set ADMIN_USERNAME and ADMIN_PASSWORD environment variables"
echo "2. Verify admin user was created in the database"

