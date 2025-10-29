# Demographic Data Search Application

A full-stack Next.js application for searching through demographic data with support for 4+ million records using PostgreSQL.

## Features

- **Secure Authentication**: Database-backed admin authentication with bcrypt password hashing (prevents attacks)
- **Data Import**: Import demographic data from delimited text files with real-time progress tracking
- **Advanced Search**: Search by any field (name, city, state, zip, SSN, DOB)
- **Full-text Search**: Search across all fields simultaneously
- **Sorting**: Sort results by any column (ascending/descending)
- **Pagination**: Efficient pagination for large result sets
- **Performance**: Optimized for 4+ million records with proper indexing

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL
- **Language**: TypeScript
- **Styling**: CSS Modules

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/demographic_db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
SESSION_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### 3. Set Up Database

Create the PostgreSQL database:

```bash
createdb demographic_db
```

Run the schema migration:

```bash
psql -d demographic_db -f database/schema.sql
```

Or use the setup script:

```bash
psql -d demographic_db -f database/schema.sql
psql -d demographic_db -f database/admin_users.sql
```

### 4. Set Up Admin User

Create the admin user with hashed password:

```bash
node scripts/setup-admin.js
```

This will create an admin user with credentials from your `.env` file (default: `admin` / `admin123`).

### 5. Run the Application

Development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

Production build:

```bash
npm run build
npm start
```

## Data Format

The application expects data in the following delimited format:

```
FIRST_NAME:LAST_NAME:ADDRESS:CITY:STATE:ZIP_CODE:SSN:DATE_OF_BIRTH
```

Example:
```
MARY:SUAREZ:1822 11TH ST 1:WICHITA FALLS:TX:76306:455-13-5814:10/2/1957
```

### Field Requirements

- **First Name**: Any string
- **Last Name**: Any string
- **Address**: Any string (up to 500 chars)
- **City**: Any string
- **State**: 2 uppercase letters (e.g., TX, CA, NY)
- **Zip Code**: 5 digits (e.g., 76306)
- **SSN**: Format XXX-XX-XXXX (e.g., 455-13-5814)
- **Date of Birth**: Format MM/DD/YYYY (e.g., 10/2/1957)

## Usage

### Login

1. Navigate to the application
2. Login with admin credentials (configured in `.env`)
3. Default credentials: `admin` / `admin123`

### Import Data

1. Go to the "Import Data" tab
2. Select a text file with demographic data
3. Click "Import File"
4. Monitor import progress and review results

### Search Records

1. Go to the "Search" tab
2. Fill in any combination of search fields:
   - First Name
   - Last Name
   - City
   - State (2 letters)
   - Zip Code (5 digits)
   - SSN (XXX-XX-XXXX)
   - Date of Birth (MM/DD/YYYY)
   - General Search (searches across all fields)
3. Click "Search"
4. Use column headers to sort results
5. Navigate pages using pagination controls

## Performance Optimizations

- **Indexed Fields**: All searchable fields are indexed
- **Composite Indexes**: Common query patterns use composite indexes
- **Full-text Search**: PostgreSQL GIN index for efficient text search
- **Batch Processing**: Imports are processed in batches of 1000 records
- **Connection Pooling**: PostgreSQL connection pool for efficient query handling
- **Pagination**: Results are paginated (50 per page by default)

## Database Schema

The `demographic_records` table includes:

- All demographic fields
- Automatic timestamp tracking (created_at, updated_at)
- Full-text search vector (automatically maintained)
- Unique constraint on SSN (duplicate SSNs update existing records)

## Deployment (Coolify)

See [COOLIFY.md](./COOLIFY.md) for detailed Coolify deployment instructions.

### Quick Start for Coolify

1. **Push code to Git repository**
2. **Create new resource in Coolify** (Docker-based application)
3. **Set environment variables**:
   - `DATABASE_URL=postgresql://user:pass@host:5432/demographic_db`
   - `ADMIN_USERNAME=admin`
   - `ADMIN_PASSWORD=admin786@@@`
   - `SESSION_SECRET=<random-secret>`
   - `NODE_ENV=production`
4. **Deploy**
5. **Initialize database** (via Coolify Exec):
   ```bash
   psql $DATABASE_URL -f database/schema.sql
   psql $DATABASE_URL -f database/admin_users.sql
   node scripts/setup-admin.js
   ```

For detailed instructions, see [COOLIFY.md](./COOLIFY.md).

## Deployment (Coolify) - Original

### Environment Variables

Set the following in Coolify:

- `DATABASE_URL`: PostgreSQL connection string
- `ADMIN_USERNAME`: Admin username
- `ADMIN_PASSWORD`: Admin password (change from default!)
- `SESSION_SECRET`: Random secret key
- `NODE_ENV`: production

### Build Settings

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18+

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database exists and user has permissions

### Import Issues

- Verify file format matches expected format
- Check SSN, date, and state formats are correct
- Review error messages in import results

### Performance Issues

- Ensure all indexes are created (check `database/schema.sql`)
- Verify connection pool settings
- Consider increasing batch size for imports (in `lib/batchInsert.ts`)

## License

ISC

