import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { parseDemographicFile } from '@/lib/fileParser';
import { batchInsertRecordsWithProgress } from '@/lib/batchInsertWithProgress';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const send = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          // Send initial status
          send({ type: 'start', message: 'Reading file...' });

          // Read file content
          const content = await file.text();
          send({ type: 'progress', message: 'Parsing file...', progress: 10 });

          // Parse the file
          const parseResult = parseDemographicFile(content);

          if (parseResult.records.length === 0) {
            send({
              type: 'error',
              error: 'No valid records found in file',
              errors: parseResult.errors,
            });
            controller.close();
            return;
          }

          send({
            type: 'progress',
            message: `Parsed ${parseResult.records.length.toLocaleString()} records. Starting import...`,
            progress: 20,
            totalRecords: parseResult.records.length,
            parsedRecords: parseResult.records.length,
            parseErrors: parseResult.errors.length,
          });

          // Insert records with progress updates
          let lastProgressTime = Date.now();
          const insertResult = await batchInsertRecordsWithProgress(
            parseResult.records,
            500, // Smaller batches for more frequent updates
            (progress) => {
              // Throttle updates to every 100ms to avoid overwhelming the client
              const now = Date.now();
              if (now - lastProgressTime > 100) {
                const progressPercent = 20 + Math.floor((progress.processed / progress.total) * 80);
                send({
                  type: 'progress',
                  message: `Importing: ${progress.inserted.toLocaleString()} records inserted...`,
                  progress: progressPercent,
                  inserted: progress.inserted,
                  processed: progress.processed,
                  total: progress.total,
                  currentBatch: progress.currentBatch,
                  totalBatches: progress.totalBatches,
                  errors: progress.errors,
                });
                lastProgressTime = now;
              }
            }
          );

          // Send completion
          send({
            type: 'complete',
            success: true,
            totalLines: parseResult.totalLines,
            parsedRecords: parseResult.records.length,
            insertedRecords: insertResult.inserted,
            parseErrors: parseResult.errors.length,
            insertErrors: insertResult.errors.length,
            errors: {
              parse: parseResult.errors,
              insert: insertResult.errors,
            },
          });

          controller.close();
        } catch (error: any) {
          send({
            type: 'error',
            error: error.message || 'Internal server error',
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

