import { SortOrder, TaskSortBy } from '../enums/task-sort.enum';

/**
 * Request interface for creating a new list
 */
export interface ICreateListRequest {
    /**
     * Name of the list (1-100 characters, required)
     */
    name: string;

    /**
     * Optional description (max 500 characters)
     */
    description?: string;
}

/**
 * Request interface for updating an existing list
 */
export interface IUpdateListRequest {
    /**
     * Updated name of the list (1-100 characters, optional)
     */
    name?: string;

    /**
     * Updated description (max 500 characters, optional)
     */
    description?: string;
}

/**
 * Request interface for creating a new task
 */
export interface ICreateTaskRequest {
    /**
     * Title of the task (1-200 characters, required)
     */
    title: string;

    /**
     * Optional description (max 1000 characters)
     */
    description?: string;

    /**
     * Optional deadline (must be future date)
     */
    deadline?: Date | string;
}

/**
 * Request interface for updating an existing task
 */
export interface IUpdateTaskRequest {
    /**
     * Updated title (1-200 characters, optional)
     */
    title?: string;

    /**
     * Updated description (max 1000 characters, optional)
     */
    description?: string;

    /**
     * Updated deadline (must be future date, optional)
     */
    deadline?: Date | string;

    /**
     * Updated completion status (optional)
     */
    completed?: boolean;
}

/**
 * Query parameters for task filtering and sorting
 */
export interface ITaskQuery {
    /**
     * Filter by list ID
     */
    listId?: string;

    /**
     * Include completed tasks in results
     * Default: true
     */
    includeCompleted?: boolean;

    /**
     * Sort tasks by specified field
     * Default: createdAt
     */
    sortBy?: TaskSortBy;

    /**
     * Sort order direction
     * Default: desc
     */
    order?: SortOrder;

    /**
     * Filter by deadline range (for "due this week" etc.)
     */
    deadlineFrom?: Date | string;
    deadlineTo?: Date | string;

    /**
     * Pagination: limit number of results
     */
    limit?: number;

    /**
     * Pagination: offset for results
     */
    offset?: number;
}
