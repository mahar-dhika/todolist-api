/**
 * Enumeration for task sorting options
 * Used to specify how tasks should be sorted in queries
 */
export enum TaskSortBy {
    /**
     * Sort by task creation date
     */
    CREATED_AT = 'createdAt',

    /**
     * Sort by task last update date
     */
    UPDATED_AT = 'updatedAt',

    /**
     * Sort by task title alphabetically
     */
    TITLE = 'title',

    /**
     * Sort by task deadline (null deadlines last)
     */
    DEADLINE = 'deadline',

    /**
     * Sort by task completion status (incomplete first)
     */
    COMPLETED = 'completed'
}

/**
 * Enumeration for sort order direction
 */
export enum SortOrder {
    /**
     * Ascending order (A-Z, oldest first, false first)
     */
    ASC = 'asc',

    /**
     * Descending order (Z-A, newest first, true first)
     */
    DESC = 'desc'
}
