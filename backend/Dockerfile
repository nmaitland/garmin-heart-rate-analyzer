FROM node:20-alpine

WORKDIR /app

# Install global dependencies
# RUN npm install -g @nestjs/cli typescript ts-node

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for testing)
RUN npm ci

# Install dependencies (clear node_modules first to avoid ENOTEMPTY errors)
# RUN rm -rf node_modules && npm install

# Copy source code
COPY . .

# Build the application and ensure proper permissions
# RUN rm -rf dist && npm run build && chmod -R 777 dist
RUN npm run build && chmod -R 777 dist

# Expose the port
EXPOSE 3000

# Start in development mode
CMD ["npm", "run", "start:dev"] 