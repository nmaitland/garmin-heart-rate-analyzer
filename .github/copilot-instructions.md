# Coding pattern preferences

– Always prefer simple solutions  
– Avoid duplication of code whenever possible, which means checking for other areas of the codebase that might already have similar code and functionality  
– Write code that takes into account the different environments: dev, test, and prod  
– You are careful to only make changes that are requested or you are confident are well understood and related to the change being requested  
– When fixing an issue or bug, do not introduce a new pattern or technology without first exhausting all options for the existing implementation. And if you finally do this, make sure to remove the old implementation afterwards so we don’t have duplicate logic.  
– Keep the codebase very clean and organized  
– Avoid writing scripts in files if possible, especially if the script is likely only to be run once  
– Avoid having files over 200–300 lines of code. Refactor at that point.  
– Mocking data is only needed for tests, never mock data for dev or prod  
– Never add stubbing or fake data patterns to code that affects the dev or prod environments  
– Never overwrite my .env file without first asking and confirming

# 🚀 Tech Stack Rules

## 🧱 Core Stack
- **Frontend:** React (TypeScript)
- **Backend:** NestJS (TypeScript)
- **Database:** PostgreSQL (latest stable)

## 🐳 Containerization
- Use Docker Compose for local dev and test environments.
- Each service must run in its own container.
- Environment configs must be handled via `.env` files (`.env.dev`, `.env.test`, `.env.prod`).
- Only necessary ports should be exposed (e.g., 3000, 4000, 5432).

## 🌐 Environment Strategy
- Support three isolated environments: `development`, `testing`, and `production`.
- Configs must switch based on `NODE_ENV`.
- Use Docker volumes for DB persistence in dev/test.
- Production should run in a cloud-native container orchestration setup (e.g., AWS/GCP).

## 📁 Project Structure
/ ├── frontend/ # React App ├── backend/ # NestJS API ├── docker/ # Docker-related files ├── scripts/ # Utility scripts └── docker-compose.yml


## 🔁 Dev/Test Workflow
- Local dev/test must use Docker Compose.
- Provide npm/yarn scripts: `start:dev`, `start:test`, `test:e2e`, etc.
- Run all tests in containers with `NODE_ENV=test`.
- Use TypeORM CLI or Prisma for DB migrations.

## 🛡️ CI/CD (Future-Ready)
- Use GitHub Actions or similar for CI/CD pipelines.
- Isolate build/test/deploy steps.
- Manage secrets securely (e.g., GitHub Secrets or Vault).

## 🧹 Code Standards
- Use **ESLint** + **Prettier** for linting and formatting.
- Enforce TypeScript rules across frontend and backend.
- Backend follows `controller-service-repository` pattern.

## 🧭 Observability
- Logging enabled in all environments.
- Use Winston or similar logger in NestJS.
- Dev: verbose logs.
- Prod: log to files or external service.

# Coding workflow preferences

- Focus on the areas of code relevant to the task
- Do not touch code that is unrelated to the task
- Write thorough tests for all major functionality
- Avoid making major changes to the patterns and architecture of how a feature works, after it has shown to work well, unless explicitly instructed
- Always think about what other methods and areas of code might be affected by code changes
