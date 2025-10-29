# Docker Hub Deployment Guide

This guide shows how to build the Docker image locally, push it to Docker Hub, and use it in Coolify.

## Method 1: Build Locally and Push to Docker Hub

### Step 1: Build Docker Image Locally

```bash
cd /root/demographic-search-app

# Build the image
docker build -t your-dockerhub-username/demographic-search:latest .
```

Replace `your-dockerhub-username` with your Docker Hub username.

### Step 2: Test the Image Locally

```bash
# Run the container locally to test
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://user:pass@host:5432/demographic_db \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=admin786@@@ \
  -e SESSION_SECRET=your-secret-key \
  your-dockerhub-username/demographic-search:latest
```

### Step 3: Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push the image
docker push your-dockerhub-username/demographic-search:latest
```

### Step 4: Use in Coolify

1. Go to Coolify dashboard
2. Create new resource → **Application** → **Docker Image**
3. Set the Docker image: `your-dockerhub-username/demographic-search:latest`
4. Configure environment variables
5. Deploy

## Method 2: Automated Build Script

Use the provided script to automate the process.

