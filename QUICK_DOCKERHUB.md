# Quick Docker Hub Deployment

## Step 1: Build and Push Image

### Option A: Using Script (Easiest)

```bash
cd /root/demographic-search-app

# Replace 'your-username' with your Docker Hub username
./scripts/push-to-dockerhub.sh your-username
```

If not logged in to Docker Hub:
```bash
docker login
# Enter your Docker Hub credentials
```

### Option B: Manual Commands

```bash
cd /root/demographic-search-app

# Build the image
docker build -t demographic-search:latest .

# Tag for Docker Hub (replace 'your-username')
docker tag demographic-search:latest your-username/demographic-search:latest

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push your-username/demographic-search:latest
```

## Step 2: Configure in Coolify

1. Go to Coolify dashboard
2. **Resources** → **New Resource** → **Application**
3. Select **Docker Image** (not Git Repository)
4. Set **Docker Image**: `your-username/demographic-search:latest`
5. Set environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/demographic_db
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin786@@@
   SESSION_SECRET=your-random-secret-here
   NODE_ENV=production
   ```
6. **Do NOT set PORT** - Coolify handles this
7. Click **Deploy**

## That's It!

The image is now in Docker Hub and ready to deploy in Coolify. Much faster than building in Coolify!

