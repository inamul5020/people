import getPool from '../lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

async function setupDatabase() {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    console.log('Reading schema file...');
    const schemaPath = join(process.cwd(), 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    console.log('Executing schema...');
    await client.query(schema);
    
    console.log('Database setup completed successfully!');
  } catch (error: any) {
    console.error('Error setting up database:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();

