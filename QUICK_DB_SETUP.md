# Quick Database Setup (No psql Needed!)

## 🚀 Quick Setup - One Command

Since `psql` is not available in your container, use this Node.js script:

```bash
node scripts/init-database.js
```

Or if that doesn't work:

```bash
node /app/scripts/init-database.js
```

Or:

```bash
node ./scripts/init-database.js
```

## What This Script Does

✅ Connects to your database  
✅ Creates all tables (demographic_records, indexes, etc.)  
✅ Creates admin_users table  
✅ Creates admin user with your credentials  

All in one command! No psql needed.

## After Running

You'll see:
```
✅ Connected to database
✅ Schema created successfully
✅ Admin users table created successfully
✅ Admin user "admin" created/updated successfully
🎉 Database initialization complete!
```

Then you can login at your application URL with:
- Username: `admin`
- Password: `admin786@@@`

## Troubleshooting

### Script not found?
The script needs to be in your container. If you're using the Docker image from Docker Hub, you might need to rebuild it or run it manually.

### Can't connect?
Check your `DATABASE_URL` environment variable is set correctly.

### Want to verify?
After running, test:
```bash
node -e "const {Pool}=require('pg');const p=new Pool({connectionString:process.env.DATABASE_URL});p.query('SELECT COUNT(*) FROM demographic_records').then(r=>{console.log('Records:',r.rows[0]);p.end();});"
```

