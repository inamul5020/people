-- Create database if it doesn't exist
-- This runs on the default 'postgres' database first
SELECT 'CREATE DATABASE demographic_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'demographic_db')\gexec

