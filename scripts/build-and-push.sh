#!/bin/bash

# Docker Hub Build and Push Script
# Usage: ./scripts/build-and-push.sh [your-dockerhub-username] [tag]

set -e

DOCKER_USERNAME=${1:-"your-dockerhub-username"}
TAG=${2:-"latest"}
IMAGE_NAME="$DOCKER_USERNAME/demographic-search:$TAG"

echo "Building Docker image: $IMAGE_NAME"
docker build -t "$IMAGE_NAME" .

echo ""
echo "Build completed successfully!"
echo ""
read -p "Do you want to push to Docker Hub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Pushing to Docker Hub..."
    docker push "$IMAGE_NAME"
    echo ""
    echo "✅ Image pushed successfully!"
    echo ""
    echo "Use this image in Coolify: $IMAGE_NAME"
else
    echo "Image built but not pushed. To push manually:"
    echo "  docker push $IMAGE_NAME"
fi

echo ""
echo "To test locally:"
echo "  docker run -p 3000:3000 -e DATABASE_URL=postgresql://user:pass@host:5432/db $IMAGE_NAME"

