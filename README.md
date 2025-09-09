# Garmin Heart Rate Analyzer

A full-stack application for syncing and analyzing heart rate data from Garmin Connect, providing comprehensive visualization and statistical analysis capabilities.

## 🏗️ Architecture

**Frontend:** React with TypeScript, Material-UI, Recharts  
**Backend:** NestJS with TypeScript, Swagger API documentation  
**Database:** PostgreSQL with TypeORM  
**Infrastructure:** Docker/Podman Compose for containerized development

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose **OR** Podman and Podman Compose
- Node.js 16+ (for local development)
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd garmin-heart-rate-analyzer-vscode
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Start development environment**
   
   **Using Docker:**
   ```bash
   npm run start:dev
   ```
   
   **Using Podman:**
   ```bash
   # Replace docker-compose with podman-compose in package.json scripts, or run directly:
   podman-compose -f docker-compose.yml up --build
   ```

   This starts all services:
   - Backend API: http://localhost:3000
   - Frontend: http://localhost:3001
   - PostgreSQL: localhost:54322
   - Swagger API docs: http://localhost:3000/api

## 📋 Available Commands

### Root Level (Docker/Podman Compose)

**Using npm scripts (Docker by default):**
```bash
npm run start:dev     # Start all services in development mode
npm run start:test    # Start test environment
npm run test          # Run all tests in containers
npm run build         # Build all services
npm run down          # Stop and cleanup development
npm run down:test     # Stop and cleanup test environment
npm run install:all   # Install dependencies for all services
```

**Using Podman directly:**
```bash
podman-compose -f docker-compose.yml up --build         # Start development
podman-compose -f docker-compose.test.yml up --build    # Start test environment
podman-compose -f docker-compose.yml down               # Stop and cleanup
podman-compose -f docker-compose.test.yml down          # Stop test cleanup
```

### Backend (NestJS)
```bash
cd backend/
npm run start:dev     # Hot reload development server
npm run start:debug   # Development with debug mode
npm run test          # Unit tests with Jest
npm run test:watch    # Tests in watch mode
npm run test:cov      # Tests with coverage
npm run test:e2e      # End-to-end tests
npm run lint          # ESLint with auto-fix
npm run format        # Prettier formatting
npm run build         # Production build
```

### Frontend (React)
```bash
cd frontend/
npm start             # Development server (port 3001)
npm test              # Jest with React Testing Library
npm run test:watch    # Tests in watch mode
npm run test:coverage # Tests with coverage
npm run build         # Production build
```

## 🔌 API Endpoints

### Garmin Integration
- `POST /garmin/sync` - Sync heart rate data from Garmin Connect

### Heart Rate Data
- `GET /heart-rate/:userId` - Get heart rate data for date range
- `GET /heart-rate/:userId/average` - Calculate average heart rate

### Documentation
- `GET /api` - Interactive Swagger API documentation

## 🏛️ Project Structure

```
├── backend/           # NestJS API server
│   ├── src/
│   │   ├── garmin/    # Garmin Connect integration
│   │   └── heart-rate/ # Heart rate data management
│   └── test/          # Backend tests
├── frontend/          # React application
│   ├── src/
│   │   ├── components/ # React components
│   │   └── services/   # API communication
│   └── public/        # Static assets
├── docs/              # Project documentation
└── docker-compose.yml # Development environment
```

## 🎯 Key Features

### Data Synchronization
- Secure integration with Garmin Connect API
- Automated heart rate data fetching
- Multi-user support with user-specific data isolation

### Analytics & Visualization
- Interactive charts using Recharts library
- Date range selection for targeted analysis
- Statistical calculations (averages, trends)
- Responsive design with Material-UI components

### Development Experience
- Hot reload for both frontend and backend
- Comprehensive test coverage
- Container-first development workflow (Docker/Podman)
- Automated API documentation generation

## 🗄️ Database Schema

### HeartRate Entity
- Timestamped heart rate measurements
- User association for multi-user support
- Optimized indexing for time-range queries

## 🌍 Environment Configuration

The application supports multiple environments with specific configurations:

- **Development** (`.env.dev`): Full logging, hot reload, database sync
- **Test** (`.env.test`): Isolated test database
- **Production** (`.env.prod`): Optimized for performance and security

### Required Environment Variables
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=garmin_hr_analyzer

# Application
NODE_ENV=development
REACT_APP_API_URL=http://localhost:3000
```

## 🧪 Testing Strategy

- **Backend**: Jest with supertest for API testing
- **Frontend**: Jest with React Testing Library
- **E2E**: Containerized test environment with isolated database
- **Coverage**: Comprehensive test coverage reporting

## 🔧 Development Workflow

### Code Quality
- ESLint + Prettier enforced formatting
- TypeScript strict mode
- Pre-commit hooks for quality assurance

### Architecture Patterns
- **Backend**: Controller-Service-Repository pattern
- **Frontend**: Functional components with React hooks
- **API**: RESTful design with OpenAPI documentation

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Write tests for new functionality
3. Update documentation as needed
4. Ensure all tests pass before submitting

## 📝 Development Notes

- File size limit: 200-300 lines (refactor beyond this threshold)
- Environment-aware configuration
- No data mocking in development/production environments
- Container volumes enable hot reload while maintaining data persistence

## 🔐 Security Considerations

- Environment variables for sensitive configuration
- No secrets committed to repository
- Secure API authentication patterns
- Input validation and sanitization

---

For detailed development guidance, see [CLAUDE.md](./CLAUDE.md).