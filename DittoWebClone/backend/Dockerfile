# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy the entire source code
COPY . .

# Build the application
RUN npm run build:client && npm run build:server

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 5001

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
