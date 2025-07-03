# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Set environment variables with defaults
ENV NODE_ENV=production
ENV PORT=5001
ENV GOOGLE_MAPS_API_KEY=""
ENV GOOGLE_API_KEY=""
ENV N8N_API_KEY=""
ENV MONGODB_URI="mongodb://localhost:27017/relai"
ENV SUPABASE_URL="https://sshlgndtfgcetserjfow.supabase.co"
ENV SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGxnbmR0ZmdjZXRzZXJqZm93Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkwOTkzNiwiZXhwIjoyMDYzNDg1OTM2fQ.JgQPgcUhWcIP5NQfXDBGAJbiiJ4ulbhkNhQ5b6t-lG8"

# Build the application (this will build both backend and frontend)
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 5001

# Start the application
CMD ["npm", "start"] 