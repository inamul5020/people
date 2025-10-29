import getPool from './db';
import { DemographicRecord } from './fileParser';
import { parseDate } from './fileParser';

/**
 * Insert records in batches for better performance
 */
export async function batchInsertRecords(
  records: DemographicRecord[],
  batchSize: number = 1000
): Promise<{ inserted: number; errors: string[] }> {
  const errors: string[] = [];
  let inserted = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    try {
      const result = await insertBatch(batch);
      inserted += result;
    } catch (error: any) {
      errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
    }
  }

  return { inserted, errors };
}

async function insertBatch(records: DemographicRecord[]): Promise<number> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    let inserted = 0;
    
    for (const record of records) {
      try {
        const dob = record.dateOfBirth ? parseDate(record.dateOfBirth) : null;
        
        const result = await client.query(
          `INSERT INTO demographic_records 
           (first_name, last_name, address, city, state, zip_code, ssn, date_of_birth)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (ssn) DO UPDATE SET
             first_name = EXCLUDED.first_name,
             last_name = EXCLUDED.last_name,
             address = EXCLUDED.address,
             city = EXCLUDED.city,
             state = EXCLUDED.state,
             zip_code = EXCLUDED.zip_code,
             date_of_birth = EXCLUDED.date_of_birth,
             updated_at = CURRENT_TIMESTAMP`,
          [
            record.firstName,
            record.lastName,
            record.address,
            record.city,
            record.state,
            record.zipCode,
            record.ssn,
            dob,
          ]
        );
        inserted++;
      } catch (error: any) {
        // Skip individual record errors, continue with batch
        console.error(`Error inserting record with SSN ${record.ssn}:`, error.message);
      }
    }

    await client.query('COMMIT');
    return inserted;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

