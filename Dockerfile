# Stage 1: Build the frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy frontend package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy frontend source code and build
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
RUN npm run build

# Stage 2: Create the production image
FROM node:20-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy server package files and install production dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --only=production

# Copy server source code
COPY server/ ./server/

# Copy built frontend from the builder stage
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p /app/server/uploads

# Set production environment
ENV NODE_ENV=production

# Expose the port
EXPOSE 3001

# Start the server
CMD ["node", "server/server.js"]
