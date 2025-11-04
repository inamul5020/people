# Coolify Build Fix Guide

## Problem
Build fails in Coolify with `npm run build` exit code 1, but works locally.

## Solution Options

### Option 1: Check Full Build Logs in Coolify

The error logs are truncated. To see the full error:

1. In Coolify dashboard, go to your application
2. Click on "Build Logs" 
3. **Scroll up** to find the actual TypeScript/compilation error
4. Look for lines showing:
   - `error TS2307: Cannot find module`
   - `error TS2322: Type...`
   - `Module not found`
   - Missing file errors

### Option 2: Use Docker Hub Image (Recommended)

If builds keep failing in Coolify, use a pre-built Docker image:

1. **Build locally** (works):
   ```bash
   docker build -t inamul5020/demographic-search-app:latest .
   docker push inamul5020/demographic-search-app:latest
   ```

2. **Update docker-compose.coolify.yml** to use the image:
   ```yaml
   app:
     image: inamul5020/demographic-search-app:latest
     # Remove build section
     # build:
     #   context: .
     #   dockerfile: Dockerfile
   ```

3. This bypasses Coolify's build environment issues

### Option 3: Check Git Repository

Ensure all files are committed:
```bash
git status
git add .
git commit -m "Ensure all files committed"
git push
```

### Option 4: Use docker-compose.yml Temporarily

In Coolify, try using `docker-compose.yml` instead:
- Set Docker Compose file to: `docker-compose.yml`
- This uses `ports` instead of `expose`
- Might work differently in Coolify

### Option 5: Check Build Context

In Coolify settings:
1. Verify build context is set to repository root
2. Check if build directory is correct
3. Ensure all source files are in the repository

## Common Issues

### Missing Files
If files are missing during build:
- Check `.gitignore` isn't excluding necessary files
- Verify all TypeScript files are committed
- Ensure `tsconfig.json`, `next.config.js`, `package.json` are in git

### TypeScript Errors
If TypeScript errors appear:
- Fix the errors locally first
- Test build locally: `npm run build`
- Commit and push fixes

### Environment Variables
Some builds might need environment variables even during build:
- `NODE_ENV=production` (should be set automatically)
- Database connection (should be lazy, but verify)

### Build Cache Issues
Try building without cache in Coolify:
- Look for "Rebuild" or "Clear Cache" option
- Or trigger a new deployment

## Debugging Steps

1. **Verify local build works**:
   ```bash
   npm run build
   ```

2. **Test Docker build locally**:
   ```bash
   docker build -t test .
   ```

3. **Check what files are in repository**:
   ```bash
   git ls-files | grep -E "\.(ts|tsx|js|json)$"
   ```

4. **Compare with Coolify**:
   - Check if Coolify is using the correct branch
   - Verify the commit hash matches

## Recommended Next Steps

1. **Get full error from Coolify logs** (most important)
2. If that's not possible, use **Option 2** (Docker Hub image)
3. Build the image locally and push to Docker Hub
4. Update Coolify to use the pre-built image

This bypasses Coolify's build environment entirely and should work reliably.

