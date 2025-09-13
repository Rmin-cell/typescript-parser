# Multi-stage build for TypeScript GUI
# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files from ts directory
COPY ts/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code from ts directory
COPY ts/ .

# Build the TypeScript application
RUN npm run build

# Stage 2: Production server
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy package.json for runtime dependencies
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Create a simple Express server
RUN echo 'const express = require("express"); const path = require("path"); const app = express(); app.use(express.static(path.join(__dirname, "dist"))); app.get("*", (req, res) => { res.sendFile(path.join(__dirname, "dist", "index.html")); }); const PORT = process.env.PORT || 3000; app.listen(PORT, "0.0.0.0", () => { console.log(`Server running on port ${PORT}`); });' > server.js

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
