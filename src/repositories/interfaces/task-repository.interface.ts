import { TaskSortBy } from '../../models/enums/task-sort.enum';
import { ITask } from '../../models/interfaces/task.interface';

/**
 * Query options for task filtering and sorting
 */
export interface ITaskQueryOptions {
    /**
     * Filter by list ID
     */
    listId?: string;

    /**
     * Include completed tasks in results
     */
    includeCompleted?: boolean;

    /**
     * Filter by completion status
     */
    completed?: boolean;

    /**
     * Sort field and direction
     */
    sortBy?: TaskSortBy;

    /**
     * Sort order (asc or desc)
     */
    sortOrder?: 'asc' | 'desc';

    /**
     * Filter tasks with deadlines in date range
     */
    deadlineRange?: {
        start: Date;
        end: Date;
    };

    /**
     * Filter tasks created in date range
     */
    createdRange?: {
        start: Date;
        end: Date;
    };

    /**
     * Limit number of results
     */
    limit?: number;

    /**
     * Offset for pagination
     */
    offset?: number;
}

/**
 * Repository interface for Task entity operations
 * Defines all CRUD operations and specialized queries for tasks
 */
export interface ITaskRepository {
    /**
     * Creates a new task in the data store
     * @param taskData - The task data without id, createdAt, updatedAt
     * @returns Promise resolving to the created task with generated id and timestamps
     * @throws Error if referenced list doesn't exist
     */
    create(taskData: Omit<ITask, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITask>;

    /**
     * Retrieves all tasks from the data store
     * @param options - Optional query options for filtering and sorting
     * @returns Promise resolving to array of tasks matching criteria
     */
    findAll(options?: ITaskQueryOptions): Promise<ITask[]>;

    /**
     * Retrieves a specific task by its ID
     * @param id - The unique identifier of the task
     * @returns Promise resolving to the task if found, null otherwise
     */
    findById(id: string): Promise<ITask | null>;

    /**
     * Retrieves all tasks belonging to a specific list
     * @param listId - The unique identifier of the parent list
     * @param options - Optional query options for filtering and sorting
     * @returns Promise resolving to array of tasks in the list
     */
    findByListId(listId: string, options?: Omit<ITaskQueryOptions, 'listId'>): Promise<ITask[]>;

    /**
     * Retrieves tasks that have deadlines within the specified date range
     * @param startDate - Start of the date range (inclusive)
     * @param endDate - End of the date range (inclusive)
     * @param options - Optional query options for additional filtering
     * @returns Promise resolving to array of tasks with deadlines in range
     */
    findByDateRange(startDate: Date, endDate: Date, options?: Omit<ITaskQueryOptions, 'deadlineRange'>): Promise<ITask[]>;

    /**
     * Retrieves tasks that are due this week (Monday to Sunday)
     * @param options - Optional query options for additional filtering
     * @returns Promise resolving to array of tasks due this week
     */
    findDueThisWeek(options?: Omit<ITaskQueryOptions, 'deadlineRange'>): Promise<ITask[]>;

    /**
     * Retrieves overdue tasks (deadline has passed and not completed)
     * @param options - Optional query options for additional filtering
     * @returns Promise resolving to array of overdue tasks
     */
    findOverdue(options?: Omit<ITaskQueryOptions, 'deadlineRange' | 'completed'>): Promise<ITask[]>;

    /**
     * Updates an existing task
     * @param id - The unique identifier of the task to update
     * @param updateData - Partial task data to update (excluding id, createdAt, updatedAt)
     * @returns Promise resolving to the updated task if found, null otherwise
     * @throws Error if trying to update to reference a non-existent list
     */
    update(id: string, updateData: Partial<Omit<ITask, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ITask | null>;

    /**
     * Toggles the completion status of a task
     * @param id - The unique identifier of the task
     * @returns Promise resolving to the updated task if found, null otherwise
     */
    toggleCompletion(id: string): Promise<ITask | null>;

    /**
     * Marks a task as completed
     * @param id - The unique identifier of the task
     * @returns Promise resolving to the updated task if found, null otherwise
     */
    markCompleted(id: string): Promise<ITask | null>;

    /**
     * Marks a task as not completed
     * @param id - The unique identifier of the task
     * @returns Promise resolving to the updated task if found, null otherwise
     */
    markIncomplete(id: string): Promise<ITask | null>;

    /**
     * Deletes a task from the data store
     * @param id - The unique identifier of the task to delete
     * @returns Promise resolving to true if task was deleted, false if not found
     */
    delete(id: string): Promise<boolean>;

    /**
     * Deletes all tasks belonging to a specific list
     * @param listId - The unique identifier of the parent list
     * @returns Promise resolving to the number of tasks deleted
     */
    deleteByListId(listId: string): Promise<number>;

    /**
     * Checks if a task exists by ID
     * @param id - The unique identifier to check
     * @returns Promise resolving to true if task exists, false otherwise
     */
    exists(id: string): Promise<boolean>;

    /**
     * Gets the count of tasks for a specific list
     * @param listId - The unique identifier of the list
     * @param includeCompleted - Whether to include completed tasks in count
     * @returns Promise resolving to the number of tasks in the list
     */
    countByListId(listId: string, includeCompleted?: boolean): Promise<number>;

    /**
     * Gets the count of completed tasks for a specific list
     * @param listId - The unique identifier of the list
     * @returns Promise resolving to the number of completed tasks in the list
     */
    countCompletedByListId(listId: string): Promise<number>;

    /**
     * Gets the count of pending (not completed) tasks for a specific list
     * @param listId - The unique identifier of the list
     * @returns Promise resolving to the number of pending tasks in the list
     */
    countPendingByListId(listId: string): Promise<number>;

    /**
     * Gets the count of overdue tasks across all lists
     * @returns Promise resolving to the number of overdue tasks
     */
    countOverdue(): Promise<number>;

    /**
     * Gets the count of tasks due this week across all lists
     * @returns Promise resolving to the number of tasks due this week
     */
    countDueThisWeek(): Promise<number>;

    /**
     * Clears all tasks from the data store (primarily for testing)
     * @returns Promise resolving when all tasks are cleared
     */
    clear(): Promise<void>;

    /**
     * Gets the total count of tasks in the data store
     * @param includeCompleted - Whether to include completed tasks in count
     * @returns Promise resolving to the total number of tasks
     */
    count(includeCompleted?: boolean): Promise<number>;

    /**
     * Bulk updates multiple tasks
     * @param updates - Array of task updates with id and data
     * @returns Promise resolving to array of updated tasks
     */
    bulkUpdate(updates: Array<{ id: string; data: Partial<Omit<ITask, 'id' | 'createdAt' | 'updatedAt'>> }>): Promise<ITask[]>;

    /**
     * Bulk deletes multiple tasks by their IDs
     * @param ids - Array of task IDs to delete
     * @returns Promise resolving to the number of tasks deleted
     */
    bulkDelete(ids: string[]): Promise<number>;
}
