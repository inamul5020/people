# Coolify Build Troubleshooting

## Build Error: `npm run build` failed

If you're seeing this error:
```
failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
```

### Step 1: Get Full Build Logs

In Coolify, the build logs might be truncated. To see the full error:

1. Go to your application in Coolify
2. Click on "Build Logs" or "View Logs"
3. Scroll to find the actual TypeScript/compilation errors
4. Look for lines that show:
   - TypeScript errors (e.g., `error TS2307: Cannot find module`)
   - Missing dependencies
   - File not found errors

### Step 2: Check Build Context

The build might be failing because some files are missing. Verify:

```bash
# In Coolify terminal or locally
docker-compose -f docker-compose.coolify.yml config
```

### Step 3: Test Build Locally

Test the exact same build command locally:

```bash
# Build using the same Dockerfile
docker build -t test-build -f Dockerfile .

# Or build with compose
docker-compose -f docker-compose.coolify.yml build
```

### Step 4: Common Issues and Solutions

#### Issue: TypeScript Compilation Errors
**Solution**: Check for TypeScript errors in the build logs and fix them.

#### Issue: Missing Files
**Solution**: Ensure `.dockerignore` isn't excluding necessary files:
```bash
# Check what's being excluded
cat .dockerignore
```

#### Issue: Database Connection During Build
**Solution**: Already fixed - `lib/db.ts` uses lazy initialization.

#### Issue: Missing Environment Variables
**Solution**: Ensure all required env vars are set in Coolify, even if they're not used during build.

### Step 5: Use docker-compose.yml Temporarily

If `docker-compose.coolify.yml` continues to fail, you can temporarily use `docker-compose.yml`:

**⚠️ Warning**: This is NOT recommended for production, but can help diagnose the issue.

1. In Coolify, set Docker Compose file to: `docker-compose.yml`
2. Remove the `ports` section if Coolify complains
3. The main difference is it uses `ports` instead of `expose`

**However**, you should switch back to `docker-compose.coolify.yml` once the build works, as it's properly configured for Coolify.

### Step 6: Verify Dockerfile Build Stages

The Dockerfile uses multi-stage builds. If one stage fails, check:

1. **deps stage**: `npm ci` - Are all dependencies installing?
2. **builder stage**: `npm run build` - This is where it's failing
3. **runner stage**: Should work if builder succeeds

### Getting Help

When asking for help, provide:
1. Full build logs from Coolify (not just the error line)
2. Output of `docker-compose -f docker-compose.coolify.yml config`
3. Any TypeScript errors shown in the logs
4. Node.js version (should be 18 from Dockerfile)

## Quick Fix: Check if it's a port issue

If the error is about ports, try this version of `docker-compose.coolify.yml`:

- Use `expose` for Coolify's automatic port management
- Add `ports` as fallback if needed
- Keep `coolify.port` label

The current `docker-compose.coolify.yml` should work. The build error is likely a TypeScript or dependency issue, not a compose file issue.

