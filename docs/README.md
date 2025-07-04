# To-Do List API

A comprehensive RESTful API for managing to-do lists and tasks, built with TypeScript, Express.js, and following clean architecture principles.

## 📋 Features

- **Multiple Lists Management**: Create, update, delete, and organize multiple to-do lists
- **Task Management**: Full CRUD operations for tasks within lists
- **Deadline Tracking**: Set and track task deadlines with smart filtering
- **Completion Status**: Mark tasks as completed/pending with automatic timestamp tracking
- **Advanced Querying**: Retrieve tasks due this week, sort by various criteria
- **Layered Architecture**: Clean separation between API, Service, and Repository layers
- **Dual Storage Support**: Memory storage for development, Oracle database for production
- **Comprehensive Documentation**: Interactive Swagger/OpenAPI documentation
- **Input Validation**: Robust validation using Joi schemas
- **Type Safety**: Full TypeScript implementation with strict typing

## 🏗️ Architecture

The application follows a clean layered architecture:

```
┌─────────────────┐
│   API Layer     │  ← REST endpoints, request/response handling
├─────────────────┤
│ Service Layer   │  ← Business logic, validation, data processing
├─────────────────┤
│Repository Layer │  ← Data access (Memory & Database implementations)
└─────────────────┘
```

### Layer Responsibilities

- **API Layer**: HTTP request/response handling, routing, Swagger documentation
- **Service Layer**: Business logic, validation rules, data processing workflows
- **Repository Layer**: Data persistence with dual implementation (Memory/Oracle DB)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Oracle Database (for production) or use memory storage for development

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todolist-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Development mode (Memory storage)**
   ```bash
   npm run dev
   ```

5. **Access the API**
   - API Base URL: `http://localhost:3000/api`
   - Documentation: `http://localhost:3000/docs`
   - Health Check: `http://localhost:3000/health`

## 📖 API Documentation

Interactive API documentation is available at `/docs` when the server is running.

### Quick API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/lists` | GET | Get all lists |
| `/api/lists` | POST | Create a new list |
| `/api/lists/{id}` | GET | Get specific list |
| `/api/lists/{id}` | PUT | Update list |
| `/api/lists/{id}` | DELETE | Delete list |
| `/api/lists/{listId}/tasks` | POST | Add task to list |
| `/api/lists/{listId}/tasks` | GET | Get tasks for list |
| `/api/tasks/{id}` | PUT | Update task |
| `/api/tasks/{id}` | DELETE | Delete task |
| `/api/tasks/{id}/complete` | PATCH | Toggle task completion |
| `/api/tasks/due-this-week` | GET | Get tasks due this week |
| `/api/tasks` | GET | Get all tasks with filtering |

## 🛠️ Development

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Run database migrations
npm run migrate
```

### Project Structure

```
src/
├── api/           # Controllers and route handlers
├── services/      # Business logic and validation
├── repositories/  # Data access layer
├── models/        # TypeScript interfaces and types
├── utils/         # Utility functions
├── config/        # Configuration management
└── index.ts       # Application entry point

migrations/        # Database migration scripts
docs/             # Project documentation
tests/            # Test files
```

## 🗄️ Database

### Memory Storage (Development)
The application uses in-memory storage by default for development, which is perfect for:
- Local development
- Testing
- Quick prototyping

### Oracle Database (Production)
For production deployment, configure Oracle database:

1. **Setup environment variables**
   ```env
   DB_TYPE=oracle
   DB_HOST=your-oracle-host
   DB_PORT=1521
   DB_SERVICE_NAME=your-service
   DB_USER=your-username
   DB_PASSWORD=your-password
   ```

2. **Run migrations**
   ```bash
   npm run migrate
   ```

### Migration Files
- `001_create_lists_table.sql` - Lists table with constraints
- `002_create_tasks_table.sql` - Tasks table with foreign keys
- `003_create_indexes_and_views.sql` - Performance indexes and views
- `004_insert_sample_data.sql` - Sample data for testing

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `DB_TYPE` | Database type | `memory` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `1521` |
| `API_PREFIX` | API path prefix | `/api` |
| `CORS_ORIGIN` | CORS origin | `*` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm test -- --testNamePattern="ListService"
```

### Test Coverage
- **Unit Tests**: Service layer, utilities, validation
- **Integration Tests**: API endpoints, database operations
- **Target Coverage**: 80% minimum

## 📊 Performance

### Benchmarks
- Single record operations: < 200ms
- List operations (<100 items): < 500ms
- Concurrent request handling with rate limiting

### Optimization Features
- Database indexing strategy
- Connection pooling
- Response compression
- Memory-efficient query operations

## 🔒 Security

### Security Features
- **Input Validation**: Joi schemas for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **Rate Limiting**: Configurable request limits
- **Security Headers**: Helmet.js integration
- **CORS Configuration**: Configurable origin policies
- **Error Handling**: No sensitive data exposure

## 🚀 Deployment

### Production Checklist
- [ ] Configure production database
- [ ] Set environment variables
- [ ] Run database migrations
- [ ] Configure reverse proxy (nginx)
- [ ] Setup SSL certificates
- [ ] Configure monitoring
- [ ] Setup log aggregation

### Docker Support (Optional)
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Monitoring

### Health Checks
- `/health` endpoint provides system status
- Database connectivity monitoring
- Memory usage tracking
- Request/response metrics

### Logging
- Structured logging for production
- Request/response logging
- Error tracking and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Maintain test coverage above 80%
- Add JSDoc documentation for all public methods
- Follow the established layered architecture
- Update API documentation for new endpoints

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Port already in use**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**Database connection issues**
- Verify Oracle database is running
- Check connection parameters in .env
- Ensure user has proper permissions

**Memory storage reset**
- Restart the development server
- Memory data is not persistent

### Getting Help
- Check the [API Documentation](http://localhost:3000/docs)
- Review the [Implementation Tasks](docs/tasks.md)
- Examine the test files for usage examples

---

**Project Status**: ✅ Implementation Ready  
**Last Updated**: July 3, 2025  
**Version**: 1.0.0
