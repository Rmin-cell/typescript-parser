# Docker Setup for Compiler Visualizer

This document provides instructions for running the TypeScript Compiler Visualizer using Docker.

## Prerequisites

- Docker (version 20.10 or later)
- Docker Compose (version 2.0 or later)

## Quick Start

### Production Build

1. **Build and run the production container:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Open your browser and go to `http://localhost:8080`

### Development Mode

1. **Run in development mode:**
   ```bash
   docker-compose --profile dev up compiler-gui-dev --build
   ```

2. **Access the development server:**
   - Open your browser and go to `http://localhost:5173`
   - Hot reload is enabled for development

## Manual Docker Commands

### Production Build

```bash
# Build the image
docker build -t compiler-visualizer .

# Run the container
docker run -p 8080:80 compiler-visualizer
```

### Development Build

```bash
# Build the development image
docker build -f Dockerfile.dev -t compiler-visualizer-dev .

# Run the development container
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules compiler-visualizer-dev
```

## Docker Images

### Production Image (`compiler-visualizer`)
- **Base:** nginx:alpine
- **Features:**
  - Multi-stage build for optimized size
  - Nginx web server for serving static files
  - Gzip compression enabled
  - Security headers configured
  - Client-side routing support

### Development Image (`compiler-visualizer-dev`)
- **Base:** node:18-alpine
- **Features:**
  - Vite development server
  - Hot reload enabled
  - Volume mounting for live code changes

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `PORT` | `80` | Nginx port (internal) |

### Ports

| Service | Internal Port | External Port | Description |
|---------|---------------|---------------|-------------|
| Production | 80 | 8080 | Nginx web server |
| Development | 5173 | 5173 | Vite dev server |

## File Structure

```
ts/
├── Dockerfile              # Production Dockerfile
├── Dockerfile.dev          # Development Dockerfile
├── docker-compose.yml      # Docker Compose configuration
├── nginx.conf              # Nginx configuration
├── .dockerignore           # Docker ignore file
└── DOCKER.md               # This file
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Change the port mapping in docker-compose.yml
   ports:
     - "8081:80"  # Use port 8081 instead of 8080
   ```

2. **Build fails:**
   ```bash
   # Clean Docker cache and rebuild
   docker system prune -a
   docker-compose up --build --force-recreate
   ```

3. **Permission issues (Linux/macOS):**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Logs

```bash
# View container logs
docker-compose logs compiler-gui

# Follow logs in real-time
docker-compose logs -f compiler-gui
```

### Container Management

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache
```

## Performance Optimization

### Production Optimizations

- **Multi-stage build:** Reduces final image size
- **Nginx caching:** Static assets are cached for 1 year
- **Gzip compression:** Reduces bandwidth usage
- **Alpine Linux:** Minimal base image for security and size

### Development Optimizations

- **Volume mounting:** Live code changes without rebuild
- **Hot reload:** Instant feedback during development
- **Source maps:** Better debugging experience

## Security Considerations

- **Non-root user:** Nginx runs as non-root
- **Security headers:** XSS protection, content type sniffing prevention
- **Minimal attack surface:** Alpine Linux base image
- **No unnecessary packages:** Only required dependencies included

## Monitoring

### Health Checks

The production container includes health checks:
- **Interval:** 30 seconds
- **Timeout:** 10 seconds
- **Retries:** 3 attempts
- **Start period:** 40 seconds

### Logging

- **Access logs:** `/var/log/nginx/access.log`
- **Error logs:** `/var/log/nginx/error.log`
- **Container logs:** Available via `docker-compose logs`

## Advanced Usage

### Custom Nginx Configuration

To modify the nginx configuration:

1. Edit `nginx.conf`
2. Rebuild the container:
   ```bash
   docker-compose up --build
   ```

### Adding Environment Variables

Add to `docker-compose.yml`:

```yaml
services:
  compiler-gui:
    environment:
      - CUSTOM_VAR=value
      - NODE_ENV=production
```

### Volume Mounting

For persistent data:

```yaml
services:
  compiler-gui:
    volumes:
      - ./data:/app/data
      - ./logs:/var/log/nginx
```

## Support

For issues related to:
- **Docker setup:** Check this documentation
- **Application functionality:** See main README.md
- **Build errors:** Check Docker logs and ensure all dependencies are installed
