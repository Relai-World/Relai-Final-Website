# Production Deployment Guide

## Overview
This guide addresses the deployment issues you're experiencing with the Relai website backend.

## Issues Resolved

### 1. Missing .env File
The application was looking for environment variables but couldn't find a `.env` file.

**Solution:**
- Environment variables are now set with defaults in the Dockerfile
- You can override them using Docker environment variables or your deployment platform's environment configuration

### 2. Frontend Build Error
The backend was trying to load frontend files via Vite dev server in production.

**Solution:**
- Vite dev server is now disabled in production mode
- Frontend build is handled during the Docker build process
- Static file serving is properly configured for production

## Required Environment Variables

Set these environment variables in your deployment platform:

```bash
# Required for Google Maps functionality
GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key
GOOGLE_API_KEY=your_actual_google_maps_api_key

# Required for chatbot functionality
N8N_API_KEY=your_actual_n8n_api_key

# Database configuration
MONGODB_URI=your_mongodb_connection_string

# Supabase configuration (already set with defaults)
SUPABASE_URL=https://sshlgndtfgcetserjfow.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGxnbmR0ZmdjZXRzZXJqZm93Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkwOTkzNiwiZXhwIjoyMDYzNDg1OTM2fQ.JgQPgcUhWcIP5NQfXDBGAJbiiJ4ulbhkNhQ5b6t-lG8

# Server configuration
NODE_ENV=production
PORT=5001
```

## Deployment Options

### Option 1: Full Stack Deployment (Recommended)
Deploy both frontend and backend together using the provided Dockerfile:

```bash
# Build and run the container
docker build -t relai-backend .
docker run -p 5001:5001 \
  -e GOOGLE_MAPS_API_KEY=your_key \
  -e GOOGLE_API_KEY=your_key \
  -e N8N_API_KEY=your_key \
  -e MONGODB_URI=your_mongodb_uri \
  relai-backend
```

### Option 2: Backend-Only Deployment
If you want to deploy frontend separately:

1. **Build frontend separately:**
   ```bash
   cd backend
   npm run build:client
   ```

2. **Deploy backend only:**
   ```bash
   npm run build:server
   npm start
   ```

3. **Deploy frontend to a static hosting service** (Vercel, Netlify, etc.)

## Docker Deployment

### Using Docker Compose (Recommended)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  relai-backend:
    build: .
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - N8N_API_KEY=${N8N_API_KEY}
      - MONGODB_URI=${MONGODB_URI}
    volumes:
      - ./public:/app/public
    restart: unless-stopped
```

### Using Docker directly

```bash
# Build the image
docker build -t relai-backend .

# Run with environment variables
docker run -d \
  --name relai-backend \
  -p 5001:5001 \
  -e GOOGLE_MAPS_API_KEY=your_key \
  -e GOOGLE_API_KEY=your_key \
  -e N8N_API_KEY=your_key \
  -e MONGODB_URI=your_mongodb_uri \
  relai-backend
```

## Platform-Specific Deployment

### Railway
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Render
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Use the Dockerfile for deployment

### Heroku
1. Create a `Procfile`:
   ```
   web: npm start
   ```
2. Set environment variables in Heroku dashboard
3. Deploy using Heroku CLI or GitHub integration

## Verification

After deployment, verify the following:

1. **API endpoints are working:**
   ```bash
   curl http://your-domain:5001/api/properties
   ```

2. **Environment variables are loaded:**
   ```bash
   curl http://your-domain:5001/api/database-status
   ```

3. **Frontend is served (if using full-stack deployment):**
   ```bash
   curl http://your-domain:5001/
   ```

## Troubleshooting

### Environment Variables Not Found
- Check that environment variables are properly set in your deployment platform
- Verify the variable names match exactly (case-sensitive)
- Use the deployment platform's environment variable interface

### Frontend Not Loading
- Ensure the frontend build completed successfully
- Check that the `public` directory exists and contains built files
- Verify static file serving is configured correctly

### Database Connection Issues
- Verify MongoDB connection string is correct
- Check network connectivity to your database
- Ensure database credentials are valid

## Security Notes

1. **Never commit API keys to version control**
2. **Use environment variables for all sensitive data**
3. **Enable HTTPS in production**
4. **Set up proper CORS configuration for your domain**
5. **Use a production-grade database**

## Support

If you encounter issues:
1. Check the application logs
2. Verify environment variables are set correctly
3. Test API endpoints individually
4. Review the troubleshooting section above 