# To-Do List API - Architecture Overview

## System Architecture

This document provides a comprehensive overview of the To-Do List API architecture, including the layered design, data flow, and key components.

## 🏗️ Layered Architecture

The application follows a clean layered architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (HTTP)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    List     │  │    Task     │  │   Swagger/OpenAPI   │  │
│  │ Controller  │  │ Controller  │  │   Documentation     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer (Business Logic)           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    List     │  │    Task     │  │     Validation      │  │
│  │   Service   │  │   Service   │  │      Service        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                Repository Layer (Data Access)              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Memory    │  │   Oracle    │  │    Repository       │  │
│  │Repository   │  │ Repository  │  │    Interfaces       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Component Details

### API Layer
**Responsibility**: HTTP request/response handling, routing, and API documentation

**Components**:
- `ListController`: Handles all list-related HTTP endpoints
- `TaskController`: Handles all task-related HTTP endpoints
- `Routes`: Centralized route configuration and dependency injection
- `Swagger Configuration`: OpenAPI specification and documentation

**Features**:
- RESTful API design
- Comprehensive JSDoc/TSDoc documentation
- Swagger UI integration at `/docs`
- Proper HTTP status code handling
- Request/response validation

### Service Layer
**Responsibility**: Business logic, validation rules, and data processing workflows

**Components**:
- `ListService`: Business logic for list operations
- `TaskService`: Business logic for task operations
- `ValidationService`: Joi schema validation

**Features**:
- Input validation using Joi schemas
- Business rule enforcement
- Data transformation and processing
- Error handling and messaging
- Cross-entity relationship management

### Repository Layer
**Responsibility**: Data persistence and retrieval with dual implementation strategy

**Components**:
- `IListRepository` & `ITaskRepository`: Repository interfaces
- `MemoryListRepository` & `MemoryTaskRepository`: In-memory implementations
- `OracleListRepository` & `OracleTaskRepository`: Database implementations (future)

**Features**:
- Dual storage strategy (Memory for dev, Oracle for prod)
- Repository pattern implementation
- Data mapping and transformation
- Query optimization and filtering

## 🔄 Data Flow

### Request Flow (Example: Create Task)
```
1. HTTP POST /api/lists/{listId}/tasks
   ↓
2. TaskController.createTask()
   ↓ 
3. TaskService.createTask()
   ├─ Validate request data (Joi)
   ├─ Check if list exists (ListRepository)
   ├─ Create task (TaskRepository)
   └─ Update list task count (ListRepository)
   ↓
4. Repository operations
   ├─ Generate UUID
   ├─ Set timestamps
   └─ Store in memory/database
   ↓
5. Return response with created task
```

### Error Flow
```
1. Error occurs at any layer
   ↓
2. Service layer catches and wraps error
   ↓
3. Controller handles service errors
   ↓
4. Express error middleware (global handler)
   ↓
5. Structured error response to client
```

## 🗄️ Data Models

### Core Entities

```typescript
interface IList {
  id: string;           // UUID
  name: string;         // Required, 1-100 chars
  description?: string; // Optional, max 500 chars
  createdAt: Date;
  updatedAt: Date;
  taskCount?: number;   // Computed field
}

interface ITask {
  id: string;           // UUID
  listId: string;       // Foreign key to List
  title: string;        // Required, 1-200 chars
  description?: string; // Optional, max 1000 chars
  deadline?: Date;      // Optional, future dates only
  completed: boolean;   // Default: false
  completedAt?: Date;   // Set when completed = true
  createdAt: Date;
  updatedAt: Date;
}
```

### Request/Response Models
- `ICreateListRequest` / `IUpdateListRequest`
- `ICreateTaskRequest` / `IUpdateTaskRequest`
- `IApiResponse<T>` / `IApiError` / `IApiMeta`

## 🔌 Dependency Injection

The application uses constructor injection for dependency management:

```typescript
// Routes configuration
const listRepository = new MemoryListRepository();
const taskRepository = new MemoryTaskRepository();

const listService = new ListService(listRepository, taskRepository);
const taskService = new TaskService(taskRepository, listRepository);

const listController = new ListController(listService);
const taskController = new TaskController(taskService);
```

## 🛠️ Technology Stack

### Core Technologies
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.1+
- **Framework**: Express.js 4.18+
- **Build Tool**: Vite 4.4+
- **Database**: Oracle Database (production) / Memory (development)

### Libraries & Tools
- **Validation**: Joi 17.9+
- **Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Security**: Helmet, CORS, Express Rate Limit
- **Testing**: Jest, ts-jest
- **Linting**: ESLint, TypeScript ESLint
- **UUID Generation**: uuid package

## 🔧 Configuration Management

### Environment-based Configuration
```typescript
export const config = {
  env: process.env.NODE_ENV || 'development',
  server: { port: 3000, apiPrefix: '/api' },
  database: { type: 'memory' | 'oracle', ... },
  cors: { origin: '*' },
  rateLimit: { windowMs: 900000, maxRequests: 100 },
  // ... other configurations
};
```

### Repository Selection Strategy
```typescript
// Dynamic repository selection based on configuration
const createRepositories = () => {
  if (config.database.type === 'oracle') {
    return {
      listRepo: new OracleListRepository(),
      taskRepo: new OracleTaskRepository()
    };
  }
  return {
    listRepo: new MemoryListRepository(),
    taskRepo: new MemoryTaskRepository()
  };
};
```

## 🚦 API Design Principles

### RESTful Design
- **Resource-based URLs**: `/api/lists`, `/api/tasks`
- **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- **Status Codes**: 200, 201, 204, 400, 404, 422, 500
- **Consistent Response Format**: `{ success, data?, error? }`

### Endpoint Patterns
- **Collections**: `GET /api/lists` (get all)
- **Individual Resources**: `GET /api/lists/{id}` (get one)
- **Nested Resources**: `POST /api/lists/{listId}/tasks` (add task to list)
- **Actions**: `PATCH /api/tasks/{id}/complete` (toggle completion)
- **Queries**: `GET /api/tasks/due-this-week` (special queries)

## 🔍 Query and Filtering

### Supported Query Parameters
- **Sorting**: `?sortBy=deadline&order=asc`
- **Filtering**: `?listId={uuid}&includeCompleted=true`
- **Date Ranges**: Automatic for "due this week" functionality

### Date/Time Handling
- **Week Calculation**: Monday to Sunday (configurable)
- **Timezone**: Server timezone or UTC
- **Format**: ISO 8601 strings in API, Date objects internally

## 🛡️ Security Considerations

### Input Validation
- Joi schema validation at service layer
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)

### Error Handling
- No sensitive data in error responses
- Structured error format
- Different error levels (validation, not found, server error)

## 📊 Performance Optimizations

### Database Design
- Proper indexing strategy (list_id, deadline, completed)
- Cascading deletes for referential integrity
- Triggers for automatic timestamp updates

### Application Level
- Connection pooling for database
- Compression middleware
- Efficient sorting algorithms in memory repository

## 🔮 Future Extensibility

### Planned Enhancements
- User authentication and authorization
- Task priorities and categories
- File attachments
- Real-time updates (WebSocket)
- Mobile API optimizations

### Architecture Extensibility Points
- Repository pattern allows easy database switching
- Service layer can accommodate new business rules
- Middleware architecture supports additional features
- Clear separation allows team scaling

## 📋 Development Workflow

### Layer Development Order
1. **Models**: Define TypeScript interfaces
2. **Repository**: Implement data access layer
3. **Services**: Implement business logic
4. **Controllers**: Implement API endpoints
5. **Documentation**: Add Swagger annotations

### Testing Strategy
- **Unit Tests**: Services, utilities, validation
- **Integration Tests**: API endpoints, database operations
- **E2E Tests**: Complete user workflows

---

This architecture provides a solid foundation for the To-Do List API with clear separation of concerns, extensibility, and maintainability. The layered approach ensures that changes to one layer don't affect others, and the dual repository strategy allows for flexible deployment scenarios.
