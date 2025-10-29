import pool from './db';
import { DemographicRecord } from './fileParser';
import { parseDate } from './fileParser';

export interface ProgressCallback {
  (progress: {
    processed: number;
    inserted: number;
    total: number;
    currentBatch: number;
    totalBatches: number;
    errors: number;
  }): void;
}

/**
 * Insert records in batches with progress reporting
 */
export async function batchInsertRecordsWithProgress(
  records: DemographicRecord[],
  batchSize: number = 1000,
  onProgress?: ProgressCallback
): Promise<{ inserted: number; errors: string[] }> {
  const errors: string[] = [];
  let inserted = 0;
  const totalBatches = Math.ceil(records.length / batchSize);

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const currentBatch = Math.floor(i / batchSize) + 1;
    
    try {
      const batchInserted = await insertBatch(batch);
      inserted += batchInserted;

      // Report progress
      if (onProgress) {
        onProgress({
          processed: Math.min(i + batchSize, records.length),
          inserted,
          total: records.length,
          currentBatch,
          totalBatches,
          errors: errors.length,
        });
      }
    } catch (error: any) {
      errors.push(`Batch ${currentBatch}: ${error.message}`);
      if (onProgress) {
        onProgress({
          processed: Math.min(i + batchSize, records.length),
          inserted,
          total: records.length,
          currentBatch,
          totalBatches,
          errors: errors.length,
        });
      }
    }
  }

  return { inserted, errors };
}

async function insertBatch(records: DemographicRecord[]): Promise<number> {
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

