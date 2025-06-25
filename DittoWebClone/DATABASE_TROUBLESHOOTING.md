# Database Connection Troubleshooting Guide

## Issue: DNS Resolution Error

If you're seeing errors like:
```
getaddrinfo ENOTFOUND db.sshlgndtfgcetserjfow.supabase.co
```

This means the application cannot resolve the Supabase database hostname.

## Quick Fix Steps

### 1. Set up Environment Variables

Run the setup script to create a `.env` file:

```bash
npm run setup
```

This will create a `.env` file with the current Supabase credentials.

### 2. Check Database Status

Start the server and check the database status:

```bash
npm run dev
```

Then visit: `http://localhost:5000/api/database-status`

This endpoint will show you:
- Configuration status
- Connection test results
- Table statistics (if connected)
- Troubleshooting suggestions

### 3. Common Solutions

#### Option A: Supabase Project is Inactive/Deleted
If the Supabase project has been deleted or suspended:

1. **Create a new Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and API key

2. **Update your `.env` file:**
   ```env
   SUPABASE_URL=https://your-new-project.supabase.co
   SUPABASE_KEY=your-new-api-key
   ```

3. **Import your data:**
   - Use the existing data import scripts in the project
   - Or manually recreate your tables

#### Option B: Network/Firewall Issues
If you're behind a corporate firewall or VPN:

1. Check if you can access `https://supabase.com` in your browser
2. Try using a different network connection
3. Contact your network administrator if needed

#### Option C: Environment Variables Not Loading
If the `.env` file isn't being read:

1. Make sure the `.env` file is in the project root directory
2. Restart your development server
3. Check that `dotenv` is properly configured

## Diagnostic Endpoints

The application now includes several diagnostic endpoints:

- `/api/database-status` - Check database connection and configuration
- `/api/health` - Basic health check
- `/api/sql-query` - Run SQL queries (SELECT only, for debugging)

## Error Types and Solutions

### DNS Resolution Failed
- **Cause:** Supabase project URL is incorrect or project is inactive
- **Solution:** Verify project URL and create new project if needed

### Authentication Failed (401)
- **Cause:** Invalid or expired API key
- **Solution:** Generate new API key in Supabase dashboard

### Connection Timeout
- **Cause:** Network issues or firewall blocking
- **Solution:** Check network connection and firewall settings

### Table Not Found (404)
- **Cause:** Database tables don't exist
- **Solution:** Run database setup scripts or import data

## Getting Help

If you're still having issues:

1. Check the `/api/database-status` endpoint output
2. Look at the server console logs for detailed error messages
3. Verify your Supabase project is active and accessible
4. Ensure your API key has the correct permissions

## Environment Variables Reference

Required environment variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# Optional: Separate database (if using)
DATABASE_URL=your-database-url

# Optional: Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## Migration from Hardcoded Credentials

The application has been updated to use environment variables instead of hardcoded credentials. This provides:

- Better security
- Easier configuration management
- Support for different environments (dev/staging/prod)
- Centralized error handling

All API endpoints now use the centralized Supabase configuration from `server/supabase-config.ts`. 