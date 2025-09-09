# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Garmin Heart Rate Analyzer application built with a modern full-stack architecture. The application syncs and analyzes heart rate data from Garmin Connect, providing visualization and statistical analysis capabilities.

**Tech Stack:**
- Frontend: React with TypeScript, Material-UI, Recharts for data visualization
- Backend: NestJS with TypeScript, Swagger API documentation
- Database: PostgreSQL with TypeORM
- Infrastructure: Docker/Podman Compose for containerized development

## Development Commands

### Root Level Commands (Docker/Podman Compose)
**Using npm scripts (Docker by default):**
```bash
# Start development environment (all services)
npm run start:dev

# Start test environment
npm run start:test

# Run all tests in containerized environment
npm run test

# Build all services
npm run build

# Stop and cleanup development environment
npm run down

# Stop and cleanup test environment
npm run down:test

# Install all dependencies (root, backend, frontend)
npm run install:all
```

**Using Podman directly:**
```bash
# Start development environment (all services)
podman-compose -f docker-compose.yml up --build

# Start test environment
podman-compose -f docker-compose.test.yml up --build

# Run all tests in containerized environment
podman-compose -f docker-compose.test.yml up --abort-on-container-exit

# Stop and cleanup development environment
podman-compose -f docker-compose.yml down

# Stop and cleanup test environment
podman-compose -f docker-compose.test.yml down
```

### Backend Commands (NestJS in backend/ directory)
```bash
# Development
npm run start:dev          # Start with hot reload and watch mode
npm run start:debug        # Start with debug mode enabled

# Testing
npm run test              # Run unit tests with Jest
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Run tests with coverage reporting
npm run test:e2e          # Run end-to-end tests

# Code Quality
npm run lint              # ESLint with auto-fix
npm run format            # Prettier code formatting

# Building
npm run build             # Build for production
npm run start:prod        # Start production build
```

### Frontend Commands (React in frontend/ directory)
```bash
# Development
npm start                 # Start React development server (port 3001)

# Testing
npm test                  # Run Jest tests with React Testing Library
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage

# Building
npm run build             # Create production build
```

## Architecture Overview

### Core Application Flow
1. **Data Sync**: Backend fetches heart rate data from Garmin Connect API
2. **Data Storage**: Heart rate data persisted to PostgreSQL via TypeORM
3. **Data Analysis**: Backend provides statistical analysis (averages, trends)
4. **Visualization**: Frontend displays charts and analytics using Recharts

### Backend Architecture (NestJS)

**Module Structure:**
- **GarminModule**: Handles Garmin Connect API integration
  - `garmin.controller.ts`: Endpoints for syncing data (`POST /garmin/sync`)
  - `garmin.service.ts`: Business logic for Garmin API communication
  - Uses `garmin-connect` npm package for authentication and data fetching

- **HeartRateModule**: Manages heart rate data persistence and retrieval
  - `heart-rate.controller.ts`: CRUD operations (`GET /heart-rate/:userId`)
  - `heart-rate.service.ts`: Data processing and analysis logic
  - `heart-rate.entity.ts`: TypeORM entity defining database schema

**Key API Endpoints:**
- `POST /garmin/sync` - Sync heart rate data from Garmin Connect
- `GET /heart-rate/:userId` - Get heart rate data for date range
- `GET /heart-rate/:userId/average` - Calculate average heart rate
- `GET /api` - Swagger API documentation (auto-generated)

### Frontend Architecture (React + TypeScript)

**Component Structure:**
- **Dashboard**: Main application interface with date range selection
- **HeartRateChart**: Data visualization using Recharts library
- **HeartRateStats**: Statistical display components

**Key Features:**
- Date range picker using Material-UI DatePicker
- Real-time chart updates when date range changes
- Responsive grid layout with Material-UI components
- Axios-based API communication with backend

### Database Schema
- **HeartRate Entity**: Stores timestamped heart rate measurements
  - Links to user ID for multi-user support
  - Optimized for time-range queries

### Environment Configuration

**Multi-Environment Support:**
- **Development** (`.env.dev`): Full logging, hot reload, database sync
- **Test** (`.env.test`): Isolated test database, controlled environment
- **Production** (`.env.prod`): Optimized for performance, security

**Container Services:**
- PostgreSQL: Port 54322 (mapped from 5432), persistent volume
- Backend API: Port 3000, hot reload enabled
- Frontend: Port 3001, WebSocket support for development

**Critical Environment Variables:**
- `DB_*`: Database connection configuration
- `NODE_ENV`: Controls TypeORM synchronization and logging levels
- `REACT_APP_API_URL`: Frontend API endpoint configuration

## Development Workflow

### Container-First Development
All development occurs in containers (Docker/Podman):
- Volume mounts enable hot reload for both services
- Database persists data between restarts
- Services automatically restart on failure

### Code Quality Standards
- **ESLint + Prettier**: Enforced formatting and linting
- **TypeScript**: Strict mode enabled across frontend and backend
- **File Organization**: Controller-Service-Repository pattern in backend
- **Component Architecture**: Functional components with hooks in frontend

### Testing Strategy
- **Backend**: Jest with supertest for API endpoint testing
- **Frontend**: Jest with React Testing Library for component testing
- **E2E**: Containerized test environment with isolated database

## Key Patterns and Conventions

### Backend Patterns
- All controllers use Swagger decorators for API documentation
- Services handle business logic, controllers handle HTTP concerns
- TypeORM entities define database schema and relationships
- Environment-based configuration using NestJS ConfigService

### Frontend Patterns
- Material-UI components for consistent styling
- Custom hooks for API integration and state management
- Error handling with try-catch blocks and user feedback
- Responsive design with Material-UI Grid system

### Development Rules from Project Configuration
- Simple solutions preferred over complex implementations
- Avoid code duplication by checking existing implementations first
- Environment-aware code (dev/test/prod considerations)
- File size limit: 200-300 lines (refactor beyond this threshold)
- Never mock data in dev/prod environments (testing only)