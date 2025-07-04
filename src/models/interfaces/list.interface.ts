/**
 * Core List entity interface
 * Represents a to-do list with all its properties
 */
export interface IList {
    /**
     * Unique identifier for the list (UUID v4)
     */
    id: string;

    /**
     * Name of the list (1-100 characters)
     * Must be unique per user (future requirement)
     */
    name: string;

    /**
     * Optional description of the list (max 500 characters)
     */
    description?: string;

    /**
     * Timestamp when the list was created
     */
    createdAt: Date;

    /**
     * Timestamp when the list was last updated
     */
    updatedAt: Date;

    /**
     * Computed field: number of tasks in this list
     * This is calculated dynamically and not stored
     */
    taskCount?: number;
}
