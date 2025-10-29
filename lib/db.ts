import { Pool, PoolConfig } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const poolConfig: PoolConfig = {
      connectionString: process.env.DATABASE_URL,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    pool = new Pool(poolConfig);

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      // Don't exit during build, only during runtime
      if (process.env.NODE_ENV === 'production') {
        process.exit(-1);
      }
    });
  }
  return pool;
}

// Lazy export - only create pool when imported and used
// This prevents connection attempts during build time
export default getPool;

