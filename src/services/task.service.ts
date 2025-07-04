import { ICreateTaskRequest, ITaskQuery, IUpdateTaskRequest } from '../models/interfaces/request.interface';
import { ITask } from '../models/interfaces/task.interface';
import { IListRepository } from '../repositories/interfaces/list-repository.interface';
import { ITaskRepository } from '../repositories/interfaces/task-repository.interface';
import { ValidationService } from './validation.service';

/**
 * Task Service
 * 
 * Handles all business logic operations for tasks including:
 * - Task creation with list validation
 * - Task retrieval with sorting and filtering options
 * - Task updates with validation
 * - Task completion toggle functionality
 * - Task deletion with proper validation
 * - "Due this week" query logic
 * - General task queries with filters and pagination
 * - Proper error handling and validation
 */
export class TaskService {
    private readonly taskRepository: ITaskRepository;
    private readonly listRepository: IListRepository;

    /**
     * Constructor with dependency injection
     * @param taskRepository - Repository for task data operations
     * @param listRepository - Repository for list data operations (needed for validation)
     */
    constructor(taskRepository: ITaskRepository, listRepository: IListRepository) {
        this.taskRepository = taskRepository;
        this.listRepository = listRepository;
    }

    /**
     * Creates a new task with validation and list existence checking
     * @param listId - The ID of the parent list
     * @param taskData - The task creation data
     * @returns Promise resolving to the created task
     * @throws Error if validation fails or parent list doesn't exist
     */
    async createTask(listId: string, taskData: ICreateTaskRequest): Promise<ITask> {
        // Validate list ID format
        await ValidationService.validateUuid(listId);

        // Validate input data
        const { error, value } = ValidationService.createTaskSchema.validate(taskData);
        if (error) {
            throw new Error(`Validation error: ${error.details[0].message}`);
        }

        try {
            // Check if parent list exists
            const parentList = await this.listRepository.findById(listId);
            if (!parentList) {
                throw new Error(`List with ID ${listId} not found`);
            }

            // Convert string deadline to Date if provided
            const processedData = {
                ...value,
                listId,
                completed: false,
                deadline: value.deadline ? new Date(value.deadline) : undefined
            };

            // Create the task
            const createdTask = await this.taskRepository.create(processedData);
            return createdTask;
        } catch (repositoryError) {
            if (repositoryError instanceof Error) {
                throw new Error(`Failed to create task: ${repositoryError.message}`);
            }
            throw new Error('Failed to create task: Unknown error');
        }
    }

    /**
     * Retrieves all tasks with optional filtering and sorting
     * @param query - Optional query parameters for filtering and sorting
     * @returns Promise resolving to array of tasks matching criteria
     */
    async getAllTasks(query: ITaskQuery = {}): Promise<ITask[]> {
        try {
            // Validate query parameters
            const { error, value } = ValidationService.taskQuerySchema.validate(query);
            if (error) {
                throw new Error(`Query validation error: ${error.details[0].message}`);
            }

            // Convert query to repository options
            const options = this.convertQueryToOptions(value);

            // Retrieve tasks from repository
            const tasks = await this.taskRepository.findAll(options);
            return tasks;
        } catch (repositoryError) {
            if (repositoryError instanceof Error) {
                throw new Error(`Failed to retrieve tasks: ${repositoryError.message}`);
            }
            throw new Error('Failed to retrieve tasks: Unknown error');
        }
    }

    /**
     * Retrieves all tasks belonging to a specific list
     * @param listId - The ID of the parent list
     * @param query - Optional query parameters for filtering and sorting
     * @returns Promise resolving to array of tasks in the list
     * @throws Error if list doesn't exist
     */
    async getTasksByListId(listId: string, query: Omit<ITaskQuery, 'listId'> = {}): Promise<ITask[]> {
        // Validate list ID format
        await ValidationService.validateUuid(listId);

        try {
            // Check if list exists
            const parentList = await this.listRepository.findById(listId);
            if (!parentList) {
                throw new Error(`List with ID ${listId} not found`);
            }

            // Validate query parameters
            const { error, value } = ValidationService.taskQuerySchema.validate(query);
            if (error) {
                throw new Error(`Query validation error: ${error.details[0].message}`);
            }

            // Convert query to repository options
            const options = this.convertQueryToOptions(value);

            // Retrieve tasks from repository
            const tasks = await this.taskRepository.findByListId(listId, options);
            return tasks;
        } catch (repositoryError) {
            if (repositoryError instanceof Error && !repositoryError.message.includes('not found')) {
                throw new Error(`Failed to retrieve tasks: ${repositoryError.message}`);
            }
            throw repositoryError;
        }
    }

    /**
     * Retrieves a specific task by its ID
     * @param taskId - The unique identifier of the task
     * @returns Promise resolving to the task if found, null otherwise
     */
    async getTaskById(taskId: string): Promise<ITask | null> {
        // Validate task ID format
        await ValidationService.validateUuid(taskId);

        try {
            const task = await this.taskRepository.findById(taskId);
            return task;
        } catch (repositoryError) {
            if (repositoryError instanceof Error) {
                throw new Error(`Failed to retrieve task: ${repositoryError.message}`);
            }
            throw new Error('Failed to retrieve task: Unknown error');
        }
    }

    /**
     * Updates an existing task with validation
     * @param taskId - The unique identifier of the task to update
     * @param updateData - Partial task data to update
     * @returns Promise resolving to the updated task if found, null otherwise
     * @throws Error if validation fails or task doesn't exist
     */
    async updateTask(taskId: string, updateData: IUpdateTaskRequest): Promise<ITask | null> {
        // Validate task ID format
        await ValidationService.validateUuid(taskId);

        // Validate input data
        const { error, value } = ValidationService.updateTaskSchema.validate(updateData);
        if (error) {
            throw new Error(`Validation error: ${error.details[0].message}`);
        }

        try {
            // Check if task exists
            const existingTask = await this.taskRepository.findById(taskId);
            if (!existingTask) {
                return null;
            }

            // Process deadline if provided
            const processedData = {
                ...value,
                deadline: value.deadline ? new Date(value.deadline) : value.deadline,
                // Handle completion logic
                completedAt: value.completed !== undefined
                    ? (value.completed ? new Date() : undefined)
                    : undefined
            };

            // Remove undefined values
            const cleanData = Object.fromEntries(
                Object.entries(processedData).filter(([_, v]) => v !== undefined)
            );

            // Update the task
            const updatedTask = await this.taskRepository.update(taskId, cleanData);
            return updatedTask;
        } catch (repositoryError) {
            if (repositoryError instanceof Error) {
                throw new Error(`Failed to update task: ${repositoryError.message}`);
            }
            throw new Error('Failed to update task: Unknown error');
        }
    }

    /**
     * Toggles the completion status of a task
     * @param taskId - The unique identifier of the task
     * @returns Promise resolving to the updated task if found, null otherwise
     * @throws Error if task doesn't exist
     */
    async toggleTaskCompletion(taskId: string): Promise<ITask | null> {
        // Validate task ID format
        await ValidationService.validateUuid(taskId);

        try {
            // Check if task exists
            const existingTask = await this.taskRepository.findById(taskId);
            if (!existingTask) {
                return null;
            }

            // Toggle completion status
            const updatedTask = await this.taskRepository.toggleCompletion(taskId);
            return updatedTask;
        } catch (repositoryError) {
            if (repositoryError instanceof Error) {
                throw new Error(`Failed to toggle task completion: ${repositoryError.message}`);
            }
            throw new Error('Failed to toggle task completion: Unknown error');
        }
    }

    /**
     * Marks a task as completed
     * @param taskId - The unique identifier of the task
     * @returns Promise resolving to the updated task if found, null otherwise
     * @throws Error if task doesn't exist
     */
    async markTaskCompleted(taskId: string): Promise<ITask | null> {
        // Validate task ID format
        await ValidationService.validateUuid(taskId);

        try {
            const updatedTask = await this.taskRepository.markCompleted(taskId);
            return updatedTask;
        } catch (repositoryError) {
            if (repositoryError instanceof Error) {
                throw new Error(`Failed to mark task as completed: ${repositoryError.message}`);
            }
            throw new Error('Failed to mark task as completed: Unknown error');
        }
    }

    /**
     * Marks a task as incomplete
     * @param taskId - The unique identifier of the task
     * @returns Promise resolving to the updated task if found, null otherwise
     * @throws Error if task doesn't exist
     */
    async markTaskIncomplete(taskId: string): Promise<ITask | null> {
        // Validate task ID format
        await ValidationService.validateUuid(taskId);

        try {
            const updatedTask = await this.taskRepository.markIncomplete(taskId);
            return updatedTask;
        } catch (repositoryError) {
            if (repositoryError instanceof Error) {
                throw new Error(`Failed to mark task as incomplete: ${repositoryError.message}`);
            }
            throw new Error('Failed to mark task as incomplete: Unknown error');
        }
    }

    /**
     * Deletes a task from the system
     * @param taskId - The unique identifier of the task to delete
     * @returns Promise resolving to true if task was deleted, false if not found
     * @throws Error if deletion fails
     */
    async deleteTask(taskId: string): Promise<boolean> {
        // Validate task ID format
        await ValidationService.validateUuid(taskId);

        try {
            const wasDeleted = await this.taskRepository.delete(taskId);
            return wasDeleted;
        } catch (repositoryError) {
            if (repositoryError instanceof Error) {
                throw new Error(`Failed to delete task: ${repositoryError.message}`);
            }
            throw new Error('Failed to delete task: Unknown error');
        }
    }

    /**
     * Retrieves tasks that are due this week (Monday to Sunday)
     * @param query - Optional query parameters for additional filtering
     * @returns Promise resolving to array of tasks due this week
     */
    async getTasksDueThisWeek(query: Omit<ITaskQuery, 'deadlineFrom' | 'deadlineTo'> = {}): Promise<ITask[]> {
        try {
            // Validate query parameters
            const { error, value } = ValidationService.taskQuerySchema.validate(query);
            if (error) {
                throw new Error(`Query validation error: ${error.details[0].message}`);
            }

            // Convert query to repository options
            const options = this.convertQueryToOptions(value);

            // Get tasks due this week from repository
            const tasks = await this.taskRepository.findDueThisWeek(options);
            return tasks;
        } catch (repositoryError) {
            if (repositoryError instanceof Error) {
                throw new Error(`Failed to retrieve tasks due this week: ${repositoryError.message}`);
            }
            throw new Error('Failed to retrieve tasks due this week: Unknown error');
        }
    }

    /**
     * Retrieves overdue tasks (deadline has passed and not completed)
     * @param query - Optional query parameters for additional filtering
     * @returns Promise resolving to array of overdue tasks
     */
    async getOverdueTasks(query: Omit<ITaskQuery, 'deadlineFrom' | 'deadlineTo'> = {}): Promise<ITask[]> {
        try {
            // Validate query parameters
            const { error, value } = ValidationService.taskQuerySchema.validate(query);
            if (error) {
                throw new Error(`Query validation error: ${error.details[0].message}`);
            }

            // Convert query to repository options
            const options = this.convertQueryToOptions(value);

            // Get overdue tasks from repository
            const tasks = await this.taskRepository.findOverdue(options);
            return tasks;
        } catch (repositoryError) {
            if (repositoryError instanceof Error) {
                throw new Error(`Failed to retrieve overdue tasks: ${repositoryError.message}`);
            }
            throw new Error('Failed to retrieve overdue tasks: Unknown error');
        }
    }

    /**
     * Retrieves tasks within a specific date range
     * @param startDate - Start of the date range (inclusive)
     * @param endDate - End of the date range (inclusive)
     * @param query - Optional query parameters for additional filtering
     * @returns Promise resolving to array of tasks in the date range
     */
    async getTasksByDateRange(
        startDate: Date | string,
        endDate: Date | string,
        query: Omit<ITaskQuery, 'deadlineFrom' | 'deadlineTo'> = {}
    ): Promise<ITask[]> {
        try {
            // Convert string dates to Date objects
            const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
            const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

            // Validate dates
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new Error('Invalid date format provided');
            }

            if (start > end) {
                throw new Error('Start date must be before or equal to end date');
            }

            // Validate query parameters
            const { error, value } = ValidationService.taskQuerySchema.validate(query);
            if (error) {
                throw new Error(`Query validation error: ${error.details[0].message}`);
            }

            // Convert query to repository options
            const options = this.convertQueryToOptions(value);

            // Get tasks in date range from repository
            const tasks = await this.taskRepository.findByDateRange(start, end, options);
            return tasks;
        } catch (repositoryError) {
            if (repositoryError instanceof Error) {
                throw new Error(`Failed to retrieve tasks by date range: ${repositoryError.message}`);
            }
            throw new Error('Failed to retrieve tasks by date range: Unknown error');
        }
    }

    /**
     * Converts ITaskQuery to repository query options
     * @param query - The task query object
     * @returns Repository-compatible query options
     */
    private convertQueryToOptions(query: ITaskQuery): any {
        const options: any = {};

        if (query.listId) options.listId = query.listId;
        if (query.includeCompleted !== undefined) options.includeCompleted = query.includeCompleted;
        if (query.sortBy) options.sortBy = query.sortBy;
        if (query.order) options.sortOrder = query.order;
        if (query.limit) options.limit = query.limit;
        if (query.offset) options.offset = query.offset;

        // Handle date range
        if (query.deadlineFrom || query.deadlineTo) {
            options.deadlineRange = {
                start: query.deadlineFrom ? new Date(query.deadlineFrom) : new Date(0),
                end: query.deadlineTo ? new Date(query.deadlineTo) : new Date('2099-12-31')
            };
        }

        return options;
    }
}
