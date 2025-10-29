# Coolify Deployment via Docker Hub

If you're experiencing build issues in Coolify, you can build the Docker image locally, push it to Docker Hub, and deploy directly from there.

## Advantages

✅ Test builds locally before deploying  
✅ Faster deployments (no build step)  
✅ Avoid build timeouts in Coolify  
✅ Easier debugging  
✅ Reuse the same image across environments  

## Quick Start

### 1. Build and Push to Docker Hub

```bash
cd /root/demographic-search-app

# Replace 'your-username' with your Docker Hub username
docker build -t your-username/demographic-search:latest .

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push your-username/demographic-search:latest
```

Or use the automated script:
```bash
./scripts/build-and-push.sh your-username latest
```

### 2. Configure in Coolify

1. Go to Coolify dashboard
2. **Resources** → **New Resource** → **Application**
3. Choose **Docker Image** (not Git Repository)
4. Set **Docker Image**: `your-username/demographic-search:latest`
5. Configure environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/demographic_db
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin786@@@
   SESSION_SECRET=your-secret-key
   NODE_ENV=production
   ```
6. **Do NOT set PORT** - Coolify handles this automatically
7. Click **Deploy**

### 3. Update Image (When Making Changes)

```bash
# Rebuild image
docker build -t your-username/demographic-search:latest .

# Push updated image
docker push your-username/demographic-search:latest

# In Coolify, trigger a new deployment (pull latest image)
```

## Using Version Tags

For better version management:

```bash
# Build with version tag
docker build -t your-username/demographic-search:v1.0.0 .
docker push your-username/demographic-search:v1.0.0

# Or use timestamp
TAG=$(date +%Y%m%d-%H%M%S)
docker build -t your-username/demographic-search:$TAG .
docker push your-username/demographic-search:$TAG
```

Then set the tagged image in Coolify: `your-username/demographic-search:v1.0.0`

## Testing Before Push

Test the built image locally:

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://user:pass@host:5432/demographic_db \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=admin786@@@ \
  -e SESSION_SECRET=test-secret \
  your-username/demographic-search:latest
```

Access at `http://localhost:3000`

## Troubleshooting

### Build Fails Locally
- Check Node.js version matches (18+)
- Ensure all dependencies are in `package.json`
- Run `npm install` locally first to verify

### Image Too Large
- The standalone build should be relatively small
- Check `.dockerignore` excludes unnecessary files

### Container Won't Start
- Verify environment variables are set correctly
- Check logs: `docker logs <container-id>`
- Ensure DATABASE_URL is accessible

## Benefits Over Git Build

- ✅ No build failures in Coolify
- ✅ Faster deployments
- ✅ Test locally before deploying
- ✅ More control over build process
- ✅ Reuse images across multiple Coolify instances

