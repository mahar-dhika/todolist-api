# Developer Guide

This guide provides comprehensive information for developers working on the To-Do List API project, including setup, coding standards, contribution guidelines, and development workflows.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Development Workflow](#development-workflow)
- [Testing Guidelines](#testing-guidelines)
- [API Development](#api-development)
- [Database Development](#database-development)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Git**: Latest version
- **VS Code**: Recommended IDE with extensions
- **Oracle Database**: For production development (optional)

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd todolist-api

# Install dependencies
npm install

# Setup environment
cp .env.example .env.development

# Install recommended VS Code extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-jest

# Start development server
npm run dev
```

### VS Code Configuration
Recommended VS Code settings (`.vscode/settings.json`):
```json
{
  "typescript.preferences.useAliasesForRenames": false,
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "jest.autoRun": "watch"
}
```

## 🔧 Development Environment

### Environment Variables
Create and configure environment files:

```bash
# Development environment
cp .env.example .env.development
# Edit .env.development with development settings

# Testing environment
cp .env.example .env.test
# Configure for testing (usually memory storage)
```

### Development Scripts
```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📁 Project Structure

```
todolist-api/
├── src/                          # Source code
│   ├── api/                      # API layer
│   │   ├── controllers/          # Request handlers
│   │   ├── middleware/           # Custom middleware
│   │   └── routes/               # Route definitions
│   ├── services/                 # Business logic layer
│   ├── repositories/             # Data access layer
│   │   ├── interfaces/           # Repository contracts
│   │   └── memory/               # Memory implementations
│   ├── models/                   # TypeScript interfaces/types
│   │   ├── interfaces/           # Data models
│   │   └── enums/                # Enumerations
│   ├── utils/                    # Utility functions
│   ├── config/                   # Configuration modules
│   └── index.ts                  # Application entry point
├── tests/                        # Test files
│   ├── config/                   # Configuration tests
│   ├── controllers/              # Controller tests
│   ├── services/                 # Service tests
│   ├── repositories/             # Repository tests
│   ├── utils/                    # Utility tests
│   └── setup.ts                  # Test setup
├── docs/                         # Documentation
├── coverage/                     # Test coverage reports
├── dist/                         # Built application
└── database/                     # Database scripts
    └── migrations/               # SQL migration files
```

### Layer Responsibilities

#### API Layer (`src/api/`)
- **Controllers**: Handle HTTP requests/responses
- **Routes**: Define endpoint mappings
- **Middleware**: Request processing and validation

#### Service Layer (`src/services/`)
- **Business Logic**: Core application logic
- **Validation**: Input validation using Joi
- **Data Processing**: Transform and process data

#### Repository Layer (`src/repositories/`)
- **Data Access**: Database/storage operations
- **Interfaces**: Define data access contracts
- **Implementations**: Memory and Oracle implementations

## 📝 Coding Standards

### TypeScript Guidelines

#### Type Definitions
```typescript
// Use interfaces for object shapes
interface IUser {
    id: string;
    name: string;
    email: string;
}

// Use types for unions and complex types
type UserStatus = 'active' | 'inactive' | 'pending';

// Use enums for constants
enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}
```

#### Function Declarations
```typescript
// Use async/await for asynchronous operations
async function getUserById(id: string): Promise<IUser | null> {
    try {
        return await userRepository.findById(id);
    } catch (error) {
        throw new Error(`Failed to get user: ${error.message}`);
    }
}

// Use arrow functions for simple operations
const formatDate = (date: Date): string => date.toISOString();
```

#### Class Structure
```typescript
export class UserService {
    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async createUser(userData: ICreateUserRequest): Promise<IUser> {
        // Implementation
    }

    private validateUser(userData: ICreateUserRequest): void {
        // Private validation method
    }
}
```

### Naming Conventions

#### Files and Directories
- **Files**: kebab-case (`user.service.ts`, `task.controller.ts`)
- **Directories**: kebab-case (`user-management/`, `api-controllers/`)
- **Test Files**: `*.test.ts` or `*.spec.ts`

#### Variables and Functions
- **Variables**: camelCase (`userName`, `taskList`)
- **Functions**: camelCase (`getUserById`, `createTask`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`, `DEFAULT_PORT`)

#### Classes and Interfaces
- **Classes**: PascalCase (`UserService`, `TaskController`)
- **Interfaces**: PascalCase with 'I' prefix (`IUser`, `ITaskRepository`)
- **Types**: PascalCase (`UserStatus`, `ApiResponse`)
- **Enums**: PascalCase (`TaskPriority`, `UserRole`)

### Code Organization

#### Imports Order
```typescript
// 1. Node.js built-in modules
import { readFile } from 'fs/promises';

// 2. External dependencies
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

// 3. Internal modules (absolute paths)
import { IUserService } from '@/services/interfaces';
import { UserRepository } from '@/repositories';

// 4. Relative imports
import { validateInput } from '../utils';
import { UserController } from './user.controller';
```

#### Export Organization
```typescript
// Named exports preferred
export { UserService } from './user.service';
export { TaskService } from './task.service';

// Default exports for main classes
export default class Application {
    // Implementation
}
```

### Documentation Standards

#### JSDoc Comments
```typescript
/**
 * Creates a new task in the specified list
 * 
 * @param listId - The UUID of the list to add the task to
 * @param taskData - The task data to create
 * @returns Promise resolving to the created task
 * @throws {ValidationError} When task data is invalid
 * @throws {NotFoundError} When the list doesn't exist
 * 
 * @example
 * ```typescript
 * const task = await taskService.createTask('list-id', {
 *   title: 'New Task',
 *   description: 'Task description'
 * });
 * ```
 */
async createTask(listId: string, taskData: ICreateTaskRequest): Promise<ITask> {
    // Implementation
}
```

#### Inline Comments
```typescript
// TODO: Implement caching for frequently accessed data
// FIXME: Handle edge case when deadline is in the past
// NOTE: This method is optimized for large datasets

const result = await expensiveOperation(); // Explain complex operations
```

## 🔄 Development Workflow

### Git Workflow

#### Branch Naming
- **Feature**: `feature/add-task-priorities`
- **Bug Fix**: `bugfix/fix-validation-error`
- **Hotfix**: `hotfix/critical-security-patch`
- **Release**: `release/v1.2.0`

#### Commit Messages
```bash
# Format: type(scope): description
feat(api): add task priority filtering
fix(database): resolve connection pool exhaustion
docs(readme): update installation instructions
test(services): add unit tests for task service
refactor(utils): simplify date utility functions
```

#### Pull Request Process
1. **Create Feature Branch**: `git checkout -b feature/your-feature`
2. **Develop and Test**: Write code and tests
3. **Lint and Format**: `npm run lint:fix`
4. **Run Tests**: `npm run test`
5. **Commit Changes**: Use conventional commit format
6. **Push Branch**: `git push origin feature/your-feature`
7. **Create PR**: Include description and testing instructions
8. **Review Process**: Address review feedback
9. **Merge**: Squash and merge after approval

### Development Process

#### Before Starting Development
```bash
# Update dependencies
npm audit
npm update

# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/your-feature

# Verify environment
npm run test
npm run lint
```

#### During Development
```bash
# Run development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Check linting continuously
npm run lint:fix
```

#### Before Committing
```bash
# Run full test suite
npm run test

# Check test coverage
npm run test:coverage

# Verify build
npm run build

# Final lint check
npm run lint
```

## 🧪 Testing Guidelines

### Testing Strategy

#### Test Types
1. **Unit Tests**: Individual functions and classes
2. **Integration Tests**: API endpoints and database operations
3. **End-to-End Tests**: Complete user workflows

#### Test Structure
```typescript
describe('TaskService', () => {
    let taskService: TaskService;
    let mockTaskRepository: jest.Mocked<ITaskRepository>;
    let mockListRepository: jest.Mocked<IListRepository>;

    beforeEach(() => {
        mockTaskRepository = createMockTaskRepository();
        mockListRepository = createMockListRepository();
        taskService = new TaskService(mockTaskRepository, mockListRepository);
    });

    describe('createTask', () => {
        it('should create a task successfully', async () => {
            // Arrange
            const taskData = { title: 'Test Task' };
            const expectedTask = { id: 'task-id', ...taskData };
            mockTaskRepository.create.mockResolvedValue(expectedTask);

            // Act
            const result = await taskService.createTask('list-id', taskData);

            // Assert
            expect(result).toEqual(expectedTask);
            expect(mockTaskRepository.create).toHaveBeenCalledWith(
                expect.objectContaining(taskData)
            );
        });

        it('should throw error when list does not exist', async () => {
            // Arrange
            mockListRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(
                taskService.createTask('invalid-id', { title: 'Test' })
            ).rejects.toThrow('List not found');
        });
    });
});
```

#### Test Data Management
```typescript
// test-helpers.ts
export const createTestList = (overrides = {}): IList => ({
    id: uuidv4(),
    name: 'Test List',
    description: 'Test Description',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
});

export const createTestTask = (overrides = {}): ITask => ({
    id: uuidv4(),
    listId: 'list-id',
    title: 'Test Task',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
});
```

### Testing Best Practices

#### AAA Pattern
```typescript
test('should return formatted date string', () => {
    // Arrange
    const date = new Date('2023-07-04T12:00:00Z');
    const expected = '2023-07-04';

    // Act
    const result = formatDate(date);

    // Assert
    expect(result).toBe(expected);
});
```

#### Mock Management
```typescript
// Use jest.mocked for better TypeScript support
const mockRepository = jest.mocked(repository);

// Reset mocks between tests
beforeEach(() => {
    jest.clearAllMocks();
});

// Use specific mock implementations
mockRepository.findById.mockImplementation(async (id) => {
    return id === 'valid-id' ? testData : null;
});
```

## 🌐 API Development

### Controller Structure
```typescript
export class TaskController {
    constructor(
        private readonly taskService: ITaskService
    ) {}

    /**
     * @swagger
     * /api/tasks:
     *   post:
     *     summary: Create a new task
     *     tags: [Tasks]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateTaskRequest'
     *     responses:
     *       201:
     *         description: Task created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TaskResponse'
     */
    createTask = async (req: Request, res: Response): Promise<void> => {
        try {
            const { listId } = req.params;
            const taskData = req.body;
            
            const task = await this.taskService.createTask(listId, taskData);
            
            res.status(201).json({
                success: true,
                data: task
            });
        } catch (error) {
            throw error; // Let global error handler manage this
        }
    };
}
```

### Route Configuration
```typescript
// routes/task.routes.ts
import { Router } from 'express';
import { TaskController } from '../controllers';
import { validateRequest } from '../middleware';
import { createTaskSchema } from '../schemas';

export const createTaskRoutes = (taskController: TaskController): Router => {
    const router = Router();

    router.post(
        '/lists/:listId/tasks',
        validateRequest(createTaskSchema),
        taskController.createTask
    );

    return router;
};
```

### Error Handling
```typescript
// middleware/error-handler.ts
export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (error instanceof ValidationError) {
        res.status(400).json({
            success: false,
            error: {
                type: 'VALIDATION_ERROR',
                message: error.message,
                details: error.details
            }
        });
        return;
    }

    // Log unexpected errors
    logger.error('Unexpected error:', error);

    res.status(500).json({
        success: false,
        error: {
            type: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred'
        }
    });
};
```

## 🗄️ Database Development

### Repository Pattern
```typescript
// interfaces/task.repository.interface.ts
export interface ITaskRepository {
    create(task: Omit<ITask, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITask>;
    findById(id: string): Promise<ITask | null>;
    findByListId(listId: string, options?: IQueryOptions): Promise<ITask[]>;
    update(id: string, updates: Partial<ITask>): Promise<ITask>;
    delete(id: string): Promise<void>;
}

// memory/memory-task.repository.ts
export class MemoryTaskRepository implements ITaskRepository {
    private tasks: Map<string, ITask> = new Map();

    async create(taskData: Omit<ITask, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITask> {
        const task: ITask = {
            ...taskData,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.tasks.set(task.id, task);
        return task;
    }

    // ... other methods
}
```

### Migration Development
```sql
-- migrations/001_create_tasks_table.sql
CREATE TABLE tasks (
    id VARCHAR2(36) PRIMARY KEY,
    list_id VARCHAR2(36) NOT NULL,
    title VARCHAR2(200) NOT NULL,
    description VARCHAR2(1000),
    deadline TIMESTAMP,
    completed NUMBER(1) DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT tasks_list_fk 
        FOREIGN KEY (list_id) 
        REFERENCES lists(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT tasks_completed_chk 
        CHECK (completed IN (0, 1))
);

-- Create indexes for performance
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

## 🤝 Contributing

### Contribution Process
1. **Fork Repository**: Create your own fork
2. **Create Branch**: Follow naming conventions
3. **Develop Feature**: Follow coding standards
4. **Write Tests**: Ensure good coverage
5. **Update Documentation**: Keep docs current
6. **Submit PR**: Use PR template
7. **Address Feedback**: Respond to reviews
8. **Merge**: Celebrate your contribution!

### Code Review Guidelines

#### For Authors
- **Self Review**: Review your own code first
- **Test Coverage**: Ensure adequate test coverage
- **Documentation**: Update relevant documentation
- **Description**: Provide clear PR description
- **Small PRs**: Keep changes focused and small

#### For Reviewers
- **Be Constructive**: Provide helpful feedback
- **Be Timely**: Review within 24-48 hours
- **Check Tests**: Verify tests are comprehensive
- **Verify Standards**: Ensure coding standards compliance
- **Test Locally**: Test changes when needed

### Issue Reporting
```markdown
## Bug Report Template

**Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- OS: [e.g. Windows 11]
- Node.js Version: [e.g. 18.16.0]
- npm Version: [e.g. 9.6.7]

**Additional Context**
Any other context about the problem.
```

## 🛠️ Troubleshooting

### Common Development Issues

#### TypeScript Compilation Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript configuration
npx tsc --noEmit
```

#### Test Failures
```bash
# Run specific test file
npm test -- --testPathPattern=task.service.test.ts

# Run tests with verbose output
npm test -- --verbose

# Update snapshots
npm test -- --updateSnapshot
```

#### Linting Issues
```bash
# Fix auto-fixable issues
npm run lint:fix

# Check specific files
npx eslint src/services/task.service.ts

# Disable specific rules (use sparingly)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
```

#### Development Server Issues
```bash
# Check port usage
netstat -tulpn | grep 3000

# Clear node_modules and restart
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Debugging Tips

#### VS Code Debugging
```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Debug API",
            "skipFiles": ["<node_internals>/**"],
            "program": "${workspaceFolder}/src/index.ts",
            "outFiles": ["${workspaceFolder}/dist/**/*.js"],
            "env": {
                "NODE_ENV": "development"
            }
        }
    ]
}
```

#### Console Debugging
```typescript
// Use debug points
console.log('Debug point 1:', variable);

// Use console.table for objects
console.table(arrayOfObjects);

// Use console.time for performance
console.time('operation');
// ... operation
console.timeEnd('operation');
```

## 📚 Additional Resources

### Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

### Tools and Extensions
- [VS Code TypeScript Extensions](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)
- [Prettier Code Formatter](https://prettier.io/)
- [ESLint JavaScript Linter](https://eslint.org/)
- [Postman API Testing](https://www.postman.com/)

### Team Resources
- [Architecture Documentation](./architecture.md)
- [Database Setup Guide](./DATABASE_SETUP.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [API Documentation](http://localhost:3000/docs)

---

**Last Updated**: July 4, 2025  
**Document Version**: 1.0  
**Maintained by**: Development Team
