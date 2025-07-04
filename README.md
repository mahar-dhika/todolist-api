# To-Do List API

A comprehensive RESTful API for managing to-do lists and tasks built with TypeScript, Express.js, and a layered architecture. This API provides a robust foundation for todo list applications with enterprise-grade features including validation, documentation, testing, and dual storage strategies.

## 🚀 Features

- **RESTful API Design**: Comprehensive endpoints following REST principles
- **TypeScript**: Full type safety and enhanced development experience
- **Layered Architecture**: Clean separation with API → Service → Repository layers
- **Dual Storage Strategy**: Memory storage for development, Oracle database for production
- **Comprehensive Validation**: Input validation using Joi schemas with detailed error messages
- **Interactive Documentation**: Swagger/OpenAPI documentation with live testing interface
- **Security**: Built-in security middleware (Helmet, CORS, Rate Limiting)
- **Full Test Coverage**: Unit and integration tests with Jest
- **Environment Configuration**: Flexible environment-based configuration
- **Developer Experience**: Hot reload, TypeScript support, comprehensive error handling

## 📋 API Endpoints

### Lists
- `GET /api/lists` - Get all lists
- `POST /api/lists` - Create a new list
- `GET /api/lists/{id}` - Get a specific list
- `PUT /api/lists/{id}` - Update a list
- `DELETE /api/lists/{id}` - Delete a list

### Tasks
- `POST /api/lists/{listId}/tasks` - Create a task in a list
- `GET /api/lists/{listId}/tasks` - Get all tasks in a list
- `GET /api/tasks` - Get all tasks with optional filtering
- `GET /api/tasks/due-this-week` - Get tasks due this week
- `PUT /api/tasks/{id}` - Update a task
- `PATCH /api/tasks/{id}/complete` - Toggle task completion
- `DELETE /api/tasks/{id}` - Delete a task

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.1+
- **Framework**: Express.js 4.18+
- **Build Tool**: Vite 4.4+
- **Validation**: Joi 17.9+
- **Documentation**: Swagger UI
- **Testing**: Jest with ts-jest
- **Database**: Oracle Database (production) / Memory (development)

## 📦 Installation

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Oracle Database**: Only required for production deployment

### Quick Start
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd todolist-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment configuration**:
   ```bash
   cp .env.example .env.development
   ```
   
4. **Start development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000` (or the next available port) and the interactive documentation at `http://localhost:3000/docs`.

### Development Setup
For a complete development environment:

1. **Install development tools** (optional but recommended):
   ```bash
   npm install -g typescript ts-node nodemon
   ```

2. **Verify installation**:
   ```bash
   npm run test
   npm run lint
   ```

## 🔧 Scripts

- `npm run dev` - Start development server with hot reload and watch mode
- `npm run build` - Build the application for production
- `npm start` - Start production server (requires build first)
- `npm test` - Run test suite once
- `npm run test:watch` - Run tests in watch mode (for development)
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Run ESLint with automatic fixes

### Development Workflow
1. `npm run dev` - Start development with hot reload
2. Make your changes
3. `npm run test:watch` - Run tests in watch mode
4. `npm run lint:fix` - Fix any linting issues
5. `npm run build` - Build for production testing

## 📖 Documentation

### Available Documentation
- **Interactive API Documentation**: Available at `/docs` when server is running
- **Architecture Guide**: Detailed system architecture in `docs/architecture.md`
- **Implementation Tasks**: Development progress tracking in `docs/tasks.md`
- **Unit Testing Guide**: Testing strategy and guidelines in `docs/unit_testing.md`
- **Setup Guide**: Environment and database setup instructions in this README
- **Developer Guide**: See `docs/DEVELOPER_GUIDE.md` for contribution guidelines
- **Troubleshooting**: Common issues and solutions in `docs/TROUBLESHOOTING.md`

### Quick Links
- [API Documentation (Swagger)](http://localhost:3000/docs) - Interactive API testing
- [Architecture Overview](docs/architecture.md) - System design and patterns
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Development setup and contribution guidelines
- [Environment Setup](#environment-variables) - Configuration details below

## 🔒 Environment Variables

### Required Configuration
Copy `.env.example` to `.env.development` and configure the following variables:

#### Server Configuration
```env
PORT=3000                    # Server port (default: 3000)
HOST=localhost              # Server host (default: localhost)
NODE_ENV=development        # Environment (development/production)
SHUTDOWN_TIMEOUT=10000      # Graceful shutdown timeout in ms
```

#### Database Configuration
```env
DATABASE_TYPE=memory        # 'memory' for dev, 'oracle' for production
```

#### Oracle Database (Production Only)
```env
DB_CONNECTION_STRING=oracle://username:password@hostname:port/service_name
DB_USER=your_username
DB_PASSWORD=your_password
DB_POOL_MIN=2              # Minimum connections in pool
DB_POOL_MAX=10             # Maximum connections in pool
```

#### Security Configuration
```env
CORS_ORIGIN=*              # CORS allowed origins
RATE_LIMIT_WINDOW_MS=900000    # Rate limit window (15 min)
RATE_LIMIT_MAX_REQUESTS=100    # Max requests per window
```

### Environment Files
- `.env.example` - Template with all available options
- `.env.development` - Development environment (you create this)
- `.env.production` - Production environment configuration
- `.env` - Used if no environment-specific file exists

See `.env.example` for complete configuration options and descriptions.

## 🧪 Testing

The project includes comprehensive testing with multiple levels:

### Test Types
- **Unit Tests**: Services, utilities, and business logic
- **Integration Tests**: API endpoints and database operations
- **Coverage Reports**: Detailed coverage analysis

### Running Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode (development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage
- Target: Minimum 80% code coverage
- Current coverage reports available in `coverage/` directory
- Coverage includes: statements, branches, functions, and lines

### Test Structure
```
tests/
├── config/          # Configuration tests
├── controllers/     # API endpoint tests
├── repositories/    # Data access tests
├── services/        # Business logic tests
└── utils/          # Utility function tests
```

## 📁 Project Structure

```
src/
├── api/           # Controllers and routes
├── services/      # Business logic
├── repositories/  # Data access layer
├── models/        # TypeScript interfaces
├── utils/         # Utility functions
├── config/        # Configuration
└── index.ts       # Application entry point
```

## 🚀 Deployment

### Production Build
1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables**:
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

3. **Start production server**:
   ```bash
   NODE_ENV=production npm start
   ```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Oracle database setup and accessible
- [ ] Security settings reviewed
- [ ] Performance testing completed
- [ ] Monitoring and logging configured
- [ ] Backup procedures in place

### Recommended Production Setup
- **Process Manager**: PM2 or similar for process management
- **Reverse Proxy**: Nginx for load balancing and SSL termination
- **Monitoring**: Application and infrastructure monitoring
- **Logging**: Centralized logging solution
- **Database**: Oracle database with proper indexing and backup

For detailed deployment instructions, see `docs/DEPLOYMENT_GUIDE.md`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See `docs/DEVELOPER_GUIDE.md` for detailed contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` directory for comprehensive guides
- **Issues**: Report bugs and request features via GitHub Issues
- **API Testing**: Use the interactive documentation at `/docs` endpoint
- **Troubleshooting**: See `docs/TROUBLESHOOTING.md` for common issues

## 📈 Roadmap

- [ ] User authentication and authorization
- [ ] Task priorities and categories
- [ ] File attachments for tasks
- [ ] Real-time updates with WebSocket
- [ ] Mobile API optimizations
- [ ] Advanced filtering and search
