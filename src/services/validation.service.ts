import Joi from 'joi';
import { SortOrder, TaskSortBy } from '../models/enums/task-sort.enum';

/**
 * Validation Service
 * 
 * Provides comprehensive Joi validation schemas for all API operations
 * including custom validation rules and error formatting.
 */
export class ValidationService {

    // Custom UUID validation schema
    private static readonly uuidSchema = Joi.string()
        .uuid({ version: 'uuidv4' })
        .required()
        .messages({
            'string.uuid': 'Must be a valid UUID v4',
            'any.required': 'UUID is required'
        });

    // Custom future date validation
    private static readonly futureDateSchema = Joi.alternatives()
        .try(
            Joi.date().greater('now'),
            Joi.string().isoDate().custom((value, helpers) => {
                const date = new Date(value);
                if (date <= new Date()) {
                    return helpers.error('date.future');
                }
                return date;
            })
        )
        .messages({
            'date.future': 'Date must be in the future',
            'date.greater': 'Date must be in the future',
            'string.isoDate': 'Must be a valid ISO date string'
        });

    // List validation schemas
    static readonly createListSchema = Joi.object({
        name: Joi.string()
            .min(1)
            .max(100)
            .trim()
            .required()
            .messages({
                'string.min': 'List name must be at least 1 character long',
                'string.max': 'List name cannot exceed 100 characters',
                'any.required': 'List name is required'
            }),
        description: Joi.string()
            .max(500)
            .trim()
            .allow('')
            .optional()
            .messages({
                'string.max': 'Description cannot exceed 500 characters'
            })
    });

    static readonly updateListSchema = Joi.object({
        name: Joi.string()
            .min(1)
            .max(100)
            .trim()
            .optional()
            .messages({
                'string.min': 'List name must be at least 1 character long',
                'string.max': 'List name cannot exceed 100 characters'
            }),
        description: Joi.string()
            .max(500)
            .trim()
            .allow('')
            .optional()
            .messages({
                'string.max': 'Description cannot exceed 500 characters'
            })
    }).min(1).messages({
        'object.min': 'At least one field must be provided for update'
    });

    // Task validation schemas
    static readonly createTaskSchema = Joi.object({
        title: Joi.string()
            .min(1)
            .max(200)
            .trim()
            .required()
            .messages({
                'string.min': 'Task title must be at least 1 character long',
                'string.max': 'Task title cannot exceed 200 characters',
                'any.required': 'Task title is required'
            }),
        description: Joi.string()
            .max(1000)
            .trim()
            .allow('')
            .optional()
            .messages({
                'string.max': 'Description cannot exceed 1000 characters'
            }),
        deadline: ValidationService.futureDateSchema.optional(),
        listId: Joi.string()
            .uuid({ version: 'uuidv4' })
            .optional()
            .messages({
                'string.guid': 'List ID must be a valid UUID'
            })
    });

    static readonly updateTaskSchema = Joi.object({
        title: Joi.string()
            .min(1)
            .max(200)
            .trim()
            .optional()
            .messages({
                'string.min': 'Task title must be at least 1 character long',
                'string.max': 'Task title cannot exceed 200 characters'
            }),
        description: Joi.string()
            .max(1000)
            .trim()
            .allow('')
            .optional()
            .messages({
                'string.max': 'Description cannot exceed 1000 characters'
            }),
        deadline: ValidationService.futureDateSchema.optional(),
        completed: Joi.boolean()
            .optional()
            .messages({
                'boolean.base': 'Completed must be a boolean value'
            })
    }).min(1).messages({
        'object.min': 'At least one field must be provided for update'
    });

    // Query parameter validation schemas
    static readonly taskQuerySchema = Joi.object({
        listId: ValidationService.uuidSchema.optional(),
        includeCompleted: Joi.boolean()
            .default(true)
            .optional()
            .messages({
                'boolean.base': 'includeCompleted must be a boolean value'
            }),
        sortBy: Joi.string()
            .valid(...Object.values(TaskSortBy))
            .default(TaskSortBy.CREATED_AT)
            .optional()
            .messages({
                'any.only': `sortBy must be one of: ${Object.values(TaskSortBy).join(', ')}`
            }),
        order: Joi.string()
            .valid(...Object.values(SortOrder))
            .default(SortOrder.DESC)
            .optional()
            .messages({
                'any.only': `order must be one of: ${Object.values(SortOrder).join(', ')}`
            }),
        deadlineFrom: Joi.alternatives()
            .try(
                Joi.date(),
                Joi.string().isoDate()
            )
            .optional()
            .messages({
                'string.isoDate': 'deadlineFrom must be a valid ISO date string'
            }),
        deadlineTo: Joi.alternatives()
            .try(
                Joi.date(),
                Joi.string().isoDate()
            )
            .optional()
            .messages({
                'string.isoDate': 'deadlineTo must be a valid ISO date string'
            }),
        limit: Joi.number()
            .integer()
            .min(1)
            .max(1000)
            .default(100)
            .optional()
            .messages({
                'number.base': 'limit must be a number',
                'number.integer': 'limit must be an integer',
                'number.min': 'limit must be at least 1',
                'number.max': 'limit cannot exceed 1000'
            }),
        offset: Joi.number()
            .integer()
            .min(0)
            .default(0)
            .optional()
            .messages({
                'number.base': 'offset must be a number',
                'number.integer': 'offset must be an integer',
                'number.min': 'offset must be at least 0'
            })
    }).custom((value, helpers) => {
        // Custom validation: deadlineFrom should be before deadlineTo
        if (value.deadlineFrom && value.deadlineTo) {
            const fromDate = new Date(value.deadlineFrom);
            const toDate = new Date(value.deadlineTo);
            if (fromDate >= toDate) {
                return helpers.error('date.range');
            }
        }
        return value;
    }).messages({
        'date.range': 'deadlineFrom must be before deadlineTo'
    });

    // UUID parameter validation
    static readonly uuidParamSchema = ValidationService.uuidSchema;

    // Common pagination schema
    static readonly paginationSchema = Joi.object({
        limit: Joi.number()
            .integer()
            .min(1)
            .max(1000)
            .default(100)
            .optional(),
        offset: Joi.number()
            .integer()
            .min(0)
            .default(0)
            .optional()
    });

    /**
     * Validates data against a Joi schema
     * @param data - Data to validate
     * @param schema - Joi schema to validate against
     * @returns Validated and transformed data
     * @throws ValidationError if validation fails
     */
    static async validate<T>(data: any, schema: Joi.Schema): Promise<T> {
        try {
            const { error, value } = schema.validate(data, {
                abortEarly: false,
                stripUnknown: true,
                convert: true
            });

            if (error) {
                const validationError = new ValidationError(
                    'Validation failed',
                    error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message,
                        value: detail.context?.value
                    }))
                );
                throw validationError;
            }

            return value as T;
        } catch (err) {
            if (err instanceof ValidationError) {
                throw err;
            }
            throw new ValidationError('Validation failed', [
                { field: 'unknown', message: 'An unexpected validation error occurred' }
            ]);
        }
    }

    /**
     * Validates UUID parameter
     * @param uuid - UUID string to validate
     * @returns Validated UUID string
     * @throws ValidationError if invalid
     */
    static async validateUuid(uuid: string): Promise<string> {
        return this.validate<string>(uuid, this.uuidParamSchema);
    }

    /**
     * Validates list creation request
     * @param data - List creation data
     * @returns Validated list creation data
     */
    static async validateCreateList(data: any): Promise<{ name: string; description?: string }> {
        return this.validate(data, this.createListSchema);
    }

    /**
     * Validates list update request
     * @param data - List update data
     * @returns Validated list update data
     */
    static async validateUpdateList(data: any): Promise<{ name?: string; description?: string }> {
        return this.validate(data, this.updateListSchema);
    }

    /**
     * Validates task creation request
     * @param data - Task creation data
     * @returns Validated task creation data
     */
    static async validateCreateTask(data: any): Promise<{ title: string; description?: string; deadline?: Date }> {
        return this.validate(data, this.createTaskSchema);
    }

    /**
     * Validates task update request
     * @param data - Task update data
     * @returns Validated task update data
     */
    static async validateUpdateTask(data: any): Promise<{ title?: string; description?: string; deadline?: Date; completed?: boolean }> {
        return this.validate(data, this.updateTaskSchema);
    }

    /**
     * Validates task query parameters
     * @param data - Query parameters
     * @returns Validated query parameters
     */
    static async validateTaskQuery(data: any): Promise<{
        listId?: string;
        includeCompleted: boolean;
        sortBy: TaskSortBy;
        order: SortOrder;
        deadlineFrom?: Date;
        deadlineTo?: Date;
        limit: number;
        offset: number;
    }> {
        return this.validate(data, this.taskQuerySchema);
    }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
    public readonly isValidationError = true;
    public readonly errors: ValidationErrorDetail[];

    constructor(message: string, errors: ValidationErrorDetail[] = []) {
        super(message);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

/**
 * Validation error detail interface
 */
export interface ValidationErrorDetail {
    field: string;
    message: string;
    value?: any;
}
