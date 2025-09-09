FROM node:20.12.2-alpine AS development

WORKDIR /app

# Install global dependencies
RUN npm install -g @nestjs/cli typescript ts-node

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy source code
COPY . .

# Build the application and ensure proper permissions
RUN rm -rf dist && npm run build && chmod -R 777 dist

# Expose the port
EXPOSE 3000

# Start in development mode
CMD ["npm", "run", "start:dev"]