# Use Node.js 18 with Alpine for smaller image size
FROM node:18-alpine

# Install FFmpeg (required for YouTube audio extraction)
RUN apk add --no-cache ffmpeg

# Set working directory
WORKDIR /app

# Copy server package files and install backend dependencies only
COPY server/package*.json ./server/
RUN cd server && npm install --only=production

# Copy pre-built frontend (dist folder)
COPY dist/ ./dist/

# Copy server source code
COPY server/ ./server/

# Create uploads directory for temporary files
RUN mkdir -p /app/server/uploads

# Set production environment
ENV NODE_ENV=production

# Expose the port
EXPOSE 3001

# Start the server
CMD ["node", "server/server.js"]
