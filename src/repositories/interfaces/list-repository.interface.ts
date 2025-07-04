import { IList } from '../../models/interfaces/list.interface';

/**
 * Repository interface for List entity operations
 * Defines all CRUD operations and specialized queries for lists
 */
export interface IListRepository {
    /**
     * Creates a new list in the data store
     * @param listData - The list data without id, createdAt, updatedAt
     * @returns Promise resolving to the created list with generated id and timestamps
     * @throws Error if list with same name already exists
     */
    create(listData: Omit<IList, 'id' | 'createdAt' | 'updatedAt' | 'taskCount'>): Promise<IList>;

    /**
     * Retrieves all lists from the data store
     * @param includeTaskCount - Whether to include computed taskCount field
     * @returns Promise resolving to array of all lists
     */
    findAll(includeTaskCount?: boolean): Promise<IList[]>;

    /**
     * Retrieves a specific list by its ID
     * @param id - The unique identifier of the list
     * @param includeTaskCount - Whether to include computed taskCount field
     * @returns Promise resolving to the list if found, null otherwise
     */
    findById(id: string, includeTaskCount?: boolean): Promise<IList | null>;

    /**
     * Retrieves a list by its name
     * @param name - The name of the list to search for
     * @param includeTaskCount - Whether to include computed taskCount field
     * @returns Promise resolving to the list if found, null otherwise
     */
    findByName(name: string, includeTaskCount?: boolean): Promise<IList | null>;

    /**
     * Updates an existing list
     * @param id - The unique identifier of the list to update
     * @param updateData - Partial list data to update (excluding id, createdAt, updatedAt)
     * @returns Promise resolving to the updated list if found, null otherwise
     * @throws Error if trying to update name to an existing name
     */
    update(id: string, updateData: Partial<Omit<IList, 'id' | 'createdAt' | 'updatedAt' | 'taskCount'>>): Promise<IList | null>;

    /**
     * Deletes a list from the data store
     * @param id - The unique identifier of the list to delete
     * @returns Promise resolving to true if list was deleted, false if not found
     * @throws Error if list has associated tasks (cascade delete should be handled at service layer)
     */
    delete(id: string): Promise<boolean>;

    /**
     * Checks if a list exists by ID
     * @param id - The unique identifier to check
     * @returns Promise resolving to true if list exists, false otherwise
     */
    exists(id: string): Promise<boolean>;

    /**
     * Checks if a list with the given name exists
     * @param name - The name to check for uniqueness
     * @param excludeId - Optional ID to exclude from the check (for updates)
     * @returns Promise resolving to true if name exists, false otherwise
     */
    nameExists(name: string, excludeId?: string): Promise<boolean>;

    /**
     * Gets the count of tasks for a specific list
     * @param listId - The unique identifier of the list
     * @returns Promise resolving to the number of tasks in the list
     */
    getTaskCount(listId: string): Promise<number>;

    /**
     * Updates the task count for a list (used internally by repository implementations)
     * This method is typically called when tasks are added/removed
     * @param listId - The unique identifier of the list
     * @param count - The new task count
     * @returns Promise resolving when count is updated
     */
    updateTaskCount(listId: string, count: number): Promise<void>;

    /**
     * Retrieves lists with their task counts in a single operation
     * @returns Promise resolving to array of lists with taskCount populated
     */
    findAllWithTaskCounts(): Promise<IList[]>;

    /**
     * Clears all lists from the data store (primarily for testing)
     * @returns Promise resolving when all lists are cleared
     */
    clear(): Promise<void>;

    /**
     * Gets the total count of lists in the data store
     * @returns Promise resolving to the total number of lists
     */
    count(): Promise<number>;
}
