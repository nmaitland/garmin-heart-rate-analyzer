# Use Node.js 20 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set environment variables to prevent browser opening and fix React Refresh issues
ENV BROWSER=none
ENV WATCHPACK_POLLING=true
ENV FAST_REFRESH=false
ENV WDS_SOCKET_HOST=localhost
ENV WDS_SOCKET_PORT=0

# Copy package files
COPY package*.json ./

# Install dependencies (clear node_modules first to avoid ENOTEMPTY errors)
RUN rm -rf node_modules && npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]