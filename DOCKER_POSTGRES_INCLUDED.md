# Docker Image with PostgreSQL Included

This version includes PostgreSQL inside the same Docker image, making deployment simpler (no separate database setup needed).

## ⚠️ Trade-offs

### Advantages:
✅ Single container deployment  
✅ No separate database setup required  
✅ Works great for development/testing  
✅ Simpler for small applications  

### Disadvantages:
⚠️ **NOT recommended for production with large datasets**  
⚠️ Data is ephemeral (lost when container is removed)  
⚠️ Less scalable  
⚠️ Harder to backup/restore  
⚠️ Container restart = database restart  

## Building the Image

Use the `Dockerfile.with-postgres` instead of the regular Dockerfile:

```bash
docker build -f Dockerfile.with-postgres -t inamul5020/demographic-search:with-postgres .
```

Or in Coolify:
- Set **Dockerfile Path** to: `Dockerfile.with-postgres`

## Environment Variables

The image has default PostgreSQL settings, but you can override them:

```env
POSTGRES_USER=postgres           # PostgreSQL username
POSTGRES_PASSWORD=postgres       # PostgreSQL password  
POSTGRES_DB=demographic_db       # Database name
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/demographic_db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin786@@@
SESSION_SECRET=your-secret-key
NODE_ENV=production
```

**Note:** The database is automatically initialized on first run!

## Local Testing

```bash
docker build -f Dockerfile.with-postgres -t demographic-search:with-postgres .
docker run -d \
  -p 3000:3000 \
  --name demographic-full \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=admin786@@@ \
  -e SESSION_SECRET=test-secret \
  demographic-search:with-postgres
```

Access at: http://localhost:3000

## Data Persistence (Optional)

If you want to persist database data across container restarts:

```bash
docker run -d \
  -p 3000:3000 \
  -v demographic-db-data:/var/lib/postgresql/data \
  --name demographic-full \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=admin786@@@ \
  demographic-search:with-postgres
```

This creates a Docker volume to persist PostgreSQL data.

## Using in Coolify

1. **Set Dockerfile Path**: `Dockerfile.with-postgres`

2. **Set Environment Variables**:
   ```
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your-secure-password
   POSTGRES_DB=demographic_db
   DATABASE_URL=postgresql://postgres:your-secure-password@localhost:5432/demographic_db
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin786@@@
   SESSION_SECRET=your-secret
   NODE_ENV=production
   ```

3. **Optional - Add Volume for Data Persistence**:
   - Add persistent storage volume
   - Mount to: `/var/lib/postgresql/data`

## What Happens on First Run

1. ✅ PostgreSQL starts automatically
2. ✅ Database `demographic_db` is created
3. ✅ Schema (`database/schema.sql`) is applied
4. ✅ Admin users table is created
5. ✅ Admin user is created via `setup-admin.js`
6. ✅ Next.js application starts

All automatic! No manual database setup needed.

## Recommended Approach

For **production**, use separate PostgreSQL (either Coolify's PostgreSQL service or external database).

For **development/testing** or **simple deployments**, this all-in-one image works great!

