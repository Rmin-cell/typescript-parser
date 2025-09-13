# Multi-stage build for TypeScript GUI
# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Stage 2: Production server
FROM nginx:alpine AS production

# Install Node.js for running the built application
RUN apk add --no-cache nodejs npm

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy package.json for runtime dependencies
COPY --from=builder /app/package*.json /app/

# Install only production dependencies
WORKDIR /app
RUN npm ci --only=production

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
