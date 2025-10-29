import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import getPool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const pool = getPool();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    // Extract search parameters
    const firstName = searchParams.get('firstName') || '';
    const lastName = searchParams.get('lastName') || '';
    const city = searchParams.get('city') || '';
    const state = searchParams.get('state') || '';
    const zipCode = searchParams.get('zipCode') || '';
    const ssn = searchParams.get('ssn') || '';
    const dateOfBirth = searchParams.get('dateOfBirth') || '';
    const generalSearch = searchParams.get('search') || '';
    
    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortOrder = searchParams.get('sortOrder') || 'ASC';

    // Validate sortBy to prevent SQL injection
    const allowedSortColumns = [
      'id', 'first_name', 'last_name', 'city', 'state', 
      'zip_code', 'ssn', 'date_of_birth', 'created_at'
    ];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id';
    const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (firstName) {
      conditions.push(`first_name ILIKE $${paramIndex}`);
      params.push(`%${firstName}%`);
      paramIndex++;
    }

    if (lastName) {
      conditions.push(`last_name ILIKE $${paramIndex}`);
      params.push(`%${lastName}%`);
      paramIndex++;
    }

    if (city) {
      conditions.push(`city ILIKE $${paramIndex}`);
      params.push(`%${city}%`);
      paramIndex++;
    }

    if (state) {
      conditions.push(`state = $${paramIndex}`);
      params.push(state.toUpperCase());
      paramIndex++;
    }

    if (zipCode) {
      conditions.push(`zip_code = $${paramIndex}`);
      params.push(zipCode);
      paramIndex++;
    }

    if (ssn) {
      conditions.push(`ssn = $${paramIndex}`);
      params.push(ssn);
      paramIndex++;
    }

    if (dateOfBirth) {
      // Support both MM/DD/YYYY and YYYY-MM-DD formats
      let dobValue = dateOfBirth;
      const mmddyyyyMatch = dateOfBirth.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (mmddyyyyMatch) {
        const month = parseInt(mmddyyyyMatch[1], 10);
        const day = parseInt(mmddyyyyMatch[2], 10);
        const year = parseInt(mmddyyyyMatch[3], 10);
        dobValue = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
      conditions.push(`date_of_birth = $${paramIndex}`);
      params.push(dobValue);
      paramIndex++;
    }

    // Full-text search across multiple fields
    if (generalSearch) {
      conditions.push(`search_vector @@ plainto_tsquery('english', $${paramIndex})`);
      params.push(generalSearch);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM demographic_records ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // Get paginated results
    params.push(limit, offset);
    const dataQuery = `
      SELECT 
        id,
        first_name,
        last_name,
        address,
        city,
        state,
        zip_code,
        ssn,
        date_of_birth,
        created_at
      FROM demographic_records
      ${whereClause}
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataResult = await pool.query(dataQuery, params);

    return NextResponse.json({
      results: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      sort: {
        sortBy: validSortBy,
        sortOrder: validSortOrder,
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

