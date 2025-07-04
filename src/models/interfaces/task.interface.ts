/**
 * Core Task entity interface
 * Represents a task within a to-do list
 */
export interface ITask {
    /**
     * Unique identifier for the task (UUID v4)
     */
    id: string;

    /**
     * Foreign key reference to the parent list
     */
    listId: string;

    /**
     * Title of the task (1-200 characters)
     */
    title: string;

    /**
     * Optional detailed description of the task (max 1000 characters)
     */
    description?: string;

    /**
     * Optional deadline for the task
     * Must be a future date when setting
     */
    deadline?: Date;

    /**
     * Whether the task has been completed
     * Default: false
     */
    completed: boolean;

    /**
     * Timestamp when the task was marked as completed
     * Only set when completed = true, null when completed = false
     */
    completedAt?: Date | null;

    /**
     * Timestamp when the task was created
     */
    createdAt: Date;

    /**
     * Timestamp when the task was last updated
     */
    updatedAt: Date;
}
