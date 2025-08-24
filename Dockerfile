# Use Node.js 18 with Alpine for smaller image size
FROM node:20-alpine

# Install FFmpeg (required for YouTube audio extraction)
RUN apk add --no-cache ffmpeg

# Set working directory
WORKDIR /app

# Copy frontend package files and install ALL dependencies (including dev deps for build)
COPY package*.json ./
RUN npm install

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY tailwind.config.cjs ./
COPY tailwind.config.js ./
COPY postcss.config.cjs ./
COPY .eslintrc ./
COPY .eslintignore ./
COPY .prettierrc ./

# Build the frontend with verbose output
RUN npm run build --verbose

# Clean up frontend node_modules to save space (keep only dist)
RUN rm -rf node_modules package*.json src public index.html vite.config.ts tsconfig*.json tailwind.config.* postcss.config.cjs .eslintrc .eslintignore .prettierrc

# Copy server package files and install backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --only=production

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
