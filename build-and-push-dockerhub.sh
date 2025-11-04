#!/bin/bash

# Script to build and push Docker image to Docker Hub
# Usage: ./build-and-push-dockerhub.sh

set -e

IMAGE_NAME="inamul5020/demographic-search-app"
TAG="${1:-latest}"

echo "Building Docker image: ${IMAGE_NAME}:${TAG}"
docker build -t ${IMAGE_NAME}:${TAG} .

echo "Tagging image as latest..."
docker tag ${IMAGE_NAME}:${TAG} ${IMAGE_NAME}:latest

echo "Pushing to Docker Hub..."
docker push ${IMAGE_NAME}:${TAG}
docker push ${IMAGE_NAME}:latest

echo "✅ Successfully pushed ${IMAGE_NAME}:${TAG} and ${IMAGE_NAME}:latest to Docker Hub"
echo ""
echo "Now update Coolify to use: docker-compose.coolify.image.yml"

