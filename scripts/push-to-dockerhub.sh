#!/bin/bash

# Push to Docker Hub Script
# Usage: ./scripts/push-to-dockerhub.sh [dockerhub-username]

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <dockerhub-username>"
    echo ""
    echo "Example: $0 inamul5020"
    exit 1
fi

DOCKER_USERNAME=$1
IMAGE_NAME="$DOCKER_USERNAME/demographic-search"
TAG="latest"

echo "=========================================="
echo "Building and Pushing to Docker Hub"
echo "=========================================="
echo ""
echo "Docker Hub Username: $DOCKER_USERNAME"
echo "Image: $IMAGE_NAME:$TAG"
echo ""

# Check if image already exists locally
if docker images | grep -q "demographic-search.*latest"; then
    echo "✓ Local image found"
    LOCAL_IMAGE="demographic-search:latest"
else
    echo "Building Docker image..."
    docker build -t demographic-search:latest .
    LOCAL_IMAGE="demographic-search:latest"
fi

# Tag for Docker Hub
echo ""
echo "Tagging image for Docker Hub..."
docker tag $LOCAL_IMAGE $IMAGE_NAME:$TAG

# Check if logged in to Docker Hub
echo ""
echo "Checking Docker Hub login..."
if ! docker info | grep -q "Username"; then
    echo "⚠️  Not logged in to Docker Hub"
    echo "Please run: docker login"
    echo "Then run this script again"
    exit 1
fi

# Push to Docker Hub
echo ""
echo "Pushing to Docker Hub..."
docker push $IMAGE_NAME:$TAG

echo ""
echo "=========================================="
echo "✅ Successfully pushed to Docker Hub!"
echo "=========================================="
echo ""
echo "Image: $IMAGE_NAME:$TAG"
echo ""
echo "Use this in Coolify:"
echo "  Docker Image: $IMAGE_NAME:$TAG"
echo ""
echo "To update, rebuild and push again:"
echo "  docker build -t demographic-search:latest ."
echo "  docker tag demographic-search:latest $IMAGE_NAME:$TAG"
echo "  docker push $IMAGE_NAME:$TAG"

