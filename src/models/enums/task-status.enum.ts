/**
 * Enumeration for task completion status
 * Used for filtering and status-based queries
 */
export enum TaskStatus {
    /**
     * Task is not completed
     */
    PENDING = 'pending',

    /**
     * Task has been completed
     */
    COMPLETED = 'completed',

    /**
     * Task is overdue (deadline passed and not completed)
     */
    OVERDUE = 'overdue'
}

/**
 * Enumeration for list status (future use)
 */
export enum ListStatus {
    /**
     * List is active and can be modified
     */
    ACTIVE = 'active',

    /**
     * List is archived but still accessible
     */
    ARCHIVED = 'archived'
}
