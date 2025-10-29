import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { parseDemographicFile } from '@/lib/fileParser';
import { batchInsertRecords } from '@/lib/batchInsert';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    // Parse the file
    const parseResult = parseDemographicFile(content);

    if (parseResult.records.length === 0) {
      return NextResponse.json(
        { error: 'No valid records found in file', errors: parseResult.errors },
        { status: 400 }
      );
    }

    // Insert records in batches
    const insertResult = await batchInsertRecords(parseResult.records, 1000);

    return NextResponse.json({
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
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

