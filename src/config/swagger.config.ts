/**
 * Swagger/OpenAPI Configuration
 * 
 * This module configures the Swagger documentation for the To-Do List API.
 * It includes the OpenAPI specification, data schemas, and configuration
 * for swagger-jsdoc and swagger-ui-express.
 */

import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import { config } from './app.config';

/**
 * OpenAPI specification definition
 */
const swaggerDefinition = {
    openapi: '3.0.3',
    info: {
        title: 'To-Do List API',
        version: '1.0.0',
        description: `
A comprehensive RESTful API for managing to-do lists and tasks built with TypeScript, Express.js, and layered architecture.

## Features
- **Lists Management**: Create, read, update, and delete to-do lists
- **Tasks Management**: Full CRUD operations for tasks within lists
- **Task Completion**: Toggle task completion status with automatic timestamps
- **Deadline Management**: Set and query tasks by deadlines
- **Sorting & Filtering**: Sort tasks by various criteria and filter by completion status
- **Data Validation**: Comprehensive input validation using Joi schemas
- **Error Handling**: Structured error responses with proper HTTP status codes
- **Memory Storage**: In-memory repository for development (Oracle support planned)

## Architecture
The API follows a clean layered architecture:
- **API Layer**: HTTP request/response handling and routing
- **Service Layer**: Business logic and validation
- **Repository Layer**: Data persistence with pluggable storage backends

## Response Format
All API endpoints return responses in a consistent format:
\`\`\`json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
\`\`\`

For errors:
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... },
    "timestamp": "2025-07-04T10:00:00.000Z"
  }
}
\`\`\`
        `,
        contact: {
            name: 'API Support',
            email: 'support@todolist-api.com',
            url: 'https://github.com/your-org/todolist-api'
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
        }
    },
    servers: [
        {
            url: `http://localhost:${config.server.port}${config.server.apiPrefix}`,
            description: 'Development server'
        },
        {
            url: `https://api.todolist.com${config.server.apiPrefix}`,
            description: 'Production server'
        }
    ],
    tags: [
        {
            name: 'Health',
            description: 'System health and status endpoints'
        },
        {
            name: 'Lists',
            description: 'To-do list management operations'
        },
        {
            name: 'Tasks',
            description: 'Task management operations within lists'
        }
    ],
    components: {
        schemas: {
            // Core Entity Schemas
            List: {
                type: 'object',
                required: ['id', 'name', 'createdAt', 'updatedAt'],
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Unique identifier for the list (UUID v4)',
                        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
                    },
                    name: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 100,
                        description: 'Name of the list (1-100 characters)',
                        example: 'Work Tasks'
                    },
                    description: {
                        type: 'string',
                        maxLength: 500,
                        description: 'Optional description of the list (max 500 characters)',
                        example: 'Tasks related to work and professional development',
                        nullable: true
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Timestamp when the list was created',
                        example: '2025-07-04T10:00:00.000Z'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Timestamp when the list was last updated',
                        example: '2025-07-04T10:30:00.000Z'
                    },
                    taskCount: {
                        type: 'integer',
                        minimum: 0,
                        description: 'Computed field: number of tasks in this list',
                        example: 5,
                        nullable: true
                    }
                }
            },
            Task: {
                type: 'object',
                required: ['id', 'listId', 'title', 'completed', 'createdAt', 'updatedAt'],
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Unique identifier for the task (UUID v4)',
                        example: 'b2c3d4e5-f6a7-8901-bcde-f23456789012'
                    },
                    listId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Foreign key reference to the parent list',
                        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
                    },
                    title: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 200,
                        description: 'Title of the task (1-200 characters)',
                        example: 'Complete API documentation'
                    },
                    description: {
                        type: 'string',
                        maxLength: 1000,
                        description: 'Optional detailed description of the task (max 1000 characters)',
                        example: 'Write comprehensive Swagger documentation for all API endpoints',
                        nullable: true
                    },
                    deadline: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Optional deadline for the task (must be a future date when setting)',
                        example: '2025-07-10T17:00:00.000Z',
                        nullable: true
                    },
                    completed: {
                        type: 'boolean',
                        description: 'Whether the task has been completed',
                        example: false,
                        default: false
                    },
                    completedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Timestamp when the task was marked as completed (only set when completed = true)',
                        example: '2025-07-04T15:30:00.000Z',
                        nullable: true
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Timestamp when the task was created',
                        example: '2025-07-04T10:00:00.000Z'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Timestamp when the task was last updated',
                        example: '2025-07-04T15:30:00.000Z'
                    }
                }
            },

            // Request Schemas
            CreateListRequest: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 100,
                        description: 'Name of the list (1-100 characters)',
                        example: 'Personal Tasks'
                    },
                    description: {
                        type: 'string',
                        maxLength: 500,
                        description: 'Optional description of the list (max 500 characters)',
                        example: 'Personal tasks and household chores',
                        nullable: true
                    }
                }
            },
            UpdateListRequest: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 100,
                        description: 'Name of the list (1-100 characters)',
                        example: 'Updated Personal Tasks'
                    },
                    description: {
                        type: 'string',
                        maxLength: 500,
                        description: 'Optional description of the list (max 500 characters)',
                        example: 'Updated description for personal tasks',
                        nullable: true
                    }
                }
            },
            CreateTaskRequest: {
                type: 'object',
                required: ['title'],
                properties: {
                    title: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 200,
                        description: 'Title of the task (1-200 characters)',
                        example: 'Buy groceries'
                    },
                    description: {
                        type: 'string',
                        maxLength: 1000,
                        description: 'Optional detailed description of the task (max 1000 characters)',
                        example: 'Buy milk, bread, eggs, and vegetables from the local supermarket',
                        nullable: true
                    },
                    deadline: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Optional deadline for the task (must be a future date)',
                        example: '2025-07-05T18:00:00.000Z',
                        nullable: true
                    }
                }
            },
            UpdateTaskRequest: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 200,
                        description: 'Title of the task (1-200 characters)',
                        example: 'Buy organic groceries'
                    },
                    description: {
                        type: 'string',
                        maxLength: 1000,
                        description: 'Optional detailed description of the task (max 1000 characters)',
                        example: 'Buy organic milk, whole grain bread, free-range eggs, and fresh vegetables',
                        nullable: true
                    },
                    deadline: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Optional deadline for the task (must be a future date)',
                        example: '2025-07-06T18:00:00.000Z',
                        nullable: true
                    },
                    completed: {
                        type: 'boolean',
                        description: 'Whether the task has been completed',
                        example: true
                    }
                }
            },

            // Response Schemas
            ApiResponse: {
                type: 'object',
                required: ['success'],
                properties: {
                    success: {
                        type: 'boolean',
                        description: 'Indicates if the request was successful',
                        example: true
                    },
                    data: {
                        description: 'Response data (only present on successful requests)',
                        nullable: true
                    },
                    error: {
                        $ref: '#/components/schemas/ApiError',
                        description: 'Error information (only present on failed requests)'
                    },
                    meta: {
                        $ref: '#/components/schemas/ApiMeta',
                        description: 'Optional metadata about the response'
                    }
                }
            },
            ApiError: {
                type: 'object',
                required: ['code', 'message', 'timestamp'],
                properties: {
                    code: {
                        type: 'string',
                        description: 'Error code for programmatic handling',
                        example: 'VALIDATION_ERROR'
                    },
                    message: {
                        type: 'string',
                        description: 'Human-readable error message',
                        example: 'The provided data is invalid'
                    },
                    details: {
                        description: 'Additional error details (validation errors, etc.)',
                        example: {
                            field: 'name',
                            constraint: 'minLength',
                            value: ''
                        },
                        nullable: true
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Request timestamp when error occurred',
                        example: '2025-07-04T10:00:00.000Z'
                    }
                }
            },
            ApiMeta: {
                type: 'object',
                properties: {
                    totalCount: {
                        type: 'integer',
                        minimum: 0,
                        description: 'Total number of items (for paginated responses)',
                        example: 25
                    },
                    page: {
                        type: 'integer',
                        minimum: 1,
                        description: 'Current page number (for paginated responses)',
                        example: 1
                    },
                    pageSize: {
                        type: 'integer',
                        minimum: 1,
                        description: 'Number of items per page (for paginated responses)',
                        example: 10
                    },
                    hasMore: {
                        type: 'boolean',
                        description: 'Whether there are more pages available (for paginated responses)',
                        example: true
                    }
                }
            },

            // Health Check Schemas
            HealthStatus: {
                type: 'object',
                required: ['status', 'timestamp'],
                properties: {
                    status: {
                        type: 'string',
                        enum: ['healthy', 'degraded', 'unhealthy'],
                        description: 'Overall system health status',
                        example: 'healthy'
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Timestamp of the health check',
                        example: '2025-07-04T10:00:00.000Z'
                    },
                    version: {
                        type: 'string',
                        description: 'API version',
                        example: '1.0.0'
                    },
                    uptime: {
                        type: 'number',
                        description: 'Server uptime in seconds',
                        example: 3600.5
                    },
                    environment: {
                        type: 'string',
                        description: 'Current environment',
                        example: 'development'
                    }
                }
            },
            DetailedHealthStatus: {
                type: 'object',
                required: ['status', 'timestamp', 'checks'],
                properties: {
                    status: {
                        type: 'string',
                        enum: ['healthy', 'degraded', 'unhealthy'],
                        description: 'Overall system health status',
                        example: 'healthy'
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Timestamp of the health check',
                        example: '2025-07-04T10:00:00.000Z'
                    },
                    version: {
                        type: 'string',
                        description: 'API version',
                        example: '1.0.0'
                    },
                    uptime: {
                        type: 'number',
                        description: 'Server uptime in seconds',
                        example: 3600.5
                    },
                    environment: {
                        type: 'string',
                        description: 'Current environment',
                        example: 'development'
                    },
                    checks: {
                        type: 'object',
                        description: 'Individual component health checks',
                        properties: {
                            memory: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'healthy' },
                                    responseTime: { type: 'number', example: 1.2 },
                                    details: { type: 'object' }
                                }
                            },
                            storage: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'healthy' },
                                    responseTime: { type: 'number', example: 2.5 },
                                    details: { type: 'object' }
                                }
                            }
                        }
                    }
                }
            }
        },
        parameters: {
            ListId: {
                name: 'listId',
                in: 'path',
                required: true,
                description: 'Unique identifier of the list',
                schema: {
                    type: 'string',
                    format: 'uuid',
                    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
                }
            },
            TaskId: {
                name: 'taskId',
                in: 'path',
                required: true,
                description: 'Unique identifier of the task',
                schema: {
                    type: 'string',
                    format: 'uuid',
                    example: 'b2c3d4e5-f6a7-8901-bcde-f23456789012'
                }
            },
            IncludeTaskCount: {
                name: 'includeTaskCount',
                in: 'query',
                description: 'Whether to include task count in list responses',
                schema: {
                    type: 'boolean',
                    default: true,
                    example: true
                }
            },
            SortBy: {
                name: 'sortBy',
                in: 'query',
                description: 'Field to sort tasks by',
                schema: {
                    type: 'string',
                    enum: ['createdAt', 'updatedAt', 'deadline', 'title', 'completed'],
                    default: 'createdAt',
                    example: 'deadline'
                }
            },
            SortOrder: {
                name: 'order',
                in: 'query',
                description: 'Sort order (ascending or descending)',
                schema: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    default: 'desc',
                    example: 'asc'
                }
            },
            IncludeCompleted: {
                name: 'includeCompleted',
                in: 'query',
                description: 'Whether to include completed tasks in results',
                schema: {
                    type: 'boolean',
                    default: true,
                    example: false
                }
            }
        },
        responses: {
            ValidationError: {
                description: 'Validation error - invalid request data',
                content: {
                    'application/json': {
                        schema: {
                            allOf: [
                                { $ref: '#/components/schemas/ApiResponse' },
                                {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: false },
                                        error: {
                                            type: 'object',
                                            properties: {
                                                code: { type: 'string', example: 'VALIDATION_ERROR' },
                                                message: { type: 'string', example: 'Request data validation failed' },
                                                details: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            field: { type: 'string', example: 'name' },
                                                            message: { type: 'string', example: 'Name is required' }
                                                        }
                                                    }
                                                },
                                                timestamp: { type: 'string', format: 'date-time' }
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            NotFound: {
                description: 'Resource not found',
                content: {
                    'application/json': {
                        schema: {
                            allOf: [
                                { $ref: '#/components/schemas/ApiResponse' },
                                {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: false },
                                        error: {
                                            type: 'object',
                                            properties: {
                                                code: { type: 'string', example: 'NOT_FOUND' },
                                                message: { type: 'string', example: 'The requested resource was not found' },
                                                timestamp: { type: 'string', format: 'date-time' }
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            InternalServerError: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: {
                            allOf: [
                                { $ref: '#/components/schemas/ApiResponse' },
                                {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: false },
                                        error: {
                                            type: 'object',
                                            properties: {
                                                code: { type: 'string', example: 'INTERNAL_ERROR' },
                                                message: { type: 'string', example: 'An internal server error occurred' },
                                                timestamp: { type: 'string', format: 'date-time' }
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }
    }
};

/**
 * Swagger JSDoc options
 */
const swaggerOptions: Options = {
    definition: swaggerDefinition,
    apis: [
        './src/api/controllers/*.ts',
        './src/api/routes/*.ts',
        './src/models/interfaces/*.ts'
    ]
};

/**
 * Generate Swagger specification
 */
export const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Swagger UI Express options
 */
export const swaggerUiOptions = {
    customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #3b82f6; }
        .swagger-ui .scheme-container { background: #f8fafc; }
    `,
    customSiteTitle: 'To-Do List API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
        docExpansion: 'list',
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true
    }
};

/**
 * Export configuration for use in application
 */
export const swaggerConfig = {
    spec: swaggerSpec,
    uiOptions: swaggerUiOptions
};
