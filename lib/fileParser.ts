export interface DemographicRecord {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  ssn: string;
  dateOfBirth: string | null;
}

export interface ParseResult {
  records: DemographicRecord[];
  errors: string[];
  totalLines: number;
}

/**
 * Parse a delimited text file with demographic data
 * Format: FIRST_NAME:LAST_NAME:ADDRESS:CITY:STATE:ZIP_CODE:SSN:DATE_OF_BIRTH
 */
export function parseDemographicFile(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  const records: DemographicRecord[] = [];
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(':');
    
    // Allow 7 or 8 fields (date of birth is optional)
    if (parts.length < 7 || parts.length > 8) {
      errors.push(`Line ${i + 1}: Invalid format - expected 7-8 fields, got ${parts.length}`);
      continue;
    }

    // Pad to 8 fields if needed (missing date of birth)
    while (parts.length < 8) {
      parts.push('');
    }

    const [
      firstName,
      lastName,
      address,
      city,
      state,
      zipCode,
      ssn,
      dateOfBirth
    ] = parts.map(p => p.trim());

    // Validate required fields are not empty
    if (!firstName || !lastName || !ssn) {
      errors.push(`Line ${i + 1}: Missing required fields (first name, last name, or SSN)`);
      continue;
    }

    // Validate SSN format (XXX-XX-XXXX)
    if (!/^\d{3}-\d{2}-\d{4}$/.test(ssn)) {
      errors.push(`Line ${i + 1}: Invalid SSN format - expected XXX-XX-XXXX`);
      continue;
    }

    // Date of birth is optional - validate only if provided
    let parsedDateOfBirth: string | null = null;
    if (dateOfBirth && dateOfBirth.length > 0) {
      if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateOfBirth)) {
        errors.push(`Line ${i + 1}: Invalid date format - expected MM/DD/YYYY or empty`);
        continue;
      }
      parsedDateOfBirth = dateOfBirth;
    }

    // Validate state (2 letters) - handle various edge cases
    let validState = state.toUpperCase().trim();
    if (!/^[A-Z]{2}$/.test(validState)) {
      if (validState.length > 2) {
        // If state is longer (like "CHATTAHOOCHEE"), take first 2 chars
        // This handles data quality issues where city name appears in state field
        validState = validState.substring(0, 2);
      } else if (validState.length === 0) {
        errors.push(`Line ${i + 1}: State is required`);
        continue;
      } else if (validState.length === 1) {
        // Single character - pad with space or reject
        errors.push(`Line ${i + 1}: Invalid state format - expected 2 uppercase letters, got "${state}"`);
        continue;
      }
    }

    // Validate zip code (5 digits) - allow empty but validate format if provided
    if (zipCode && !/^\d{5}$/.test(zipCode)) {
      errors.push(`Line ${i + 1}: Invalid zip code format - expected 5 digits`);
      continue;
    }

    records.push({
      firstName,
      lastName,
      address: address || '',
      city: city || '',
      state: validState,
      zipCode: zipCode || '',
      ssn,
      dateOfBirth: parsedDateOfBirth,
    });
  }

  return {
    records,
    errors,
    totalLines: lines.length,
  };
}

/**
 * Convert date string from MM/DD/YYYY to YYYY-MM-DD (PostgreSQL format)
 */
export function parseDate(dateStr: string): string | null {
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

