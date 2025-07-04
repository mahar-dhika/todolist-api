import { IList } from '../models/interfaces/list.interface';
import { ICreateListRequest, IUpdateListRequest } from '../models/interfaces/request.interface';
import { IListRepository } from '../repositories/interfaces/list-repository.interface';
import { ITaskRepository } from '../repositories/interfaces/task-repository.interface';
import { ValidationService } from './validation.service';

/**
 * List Service
 * 
 * Handles all business logic operations for lists including:
 * - List creation with duplicate name validation
 * - List retrieval with task counts
 * - List updates with validation
 * - List deletion with cascade task deletion
 * - Proper error handling and validation
 */
export class ListService {
    private readonly listRepository: IListRepository;
    private readonly taskRepository: ITaskRepository;

    /**
     * Constructor with dependency injection
     * @param listRepository - Repository for list data operations
     * @param taskRepository - Repository for task data operations (needed for cascade operations)
     */
    constructor(listRepository: IListRepository, taskRepository: ITaskRepository) {
        this.listRepository = listRepository;
        this.taskRepository = taskRepository;
    }

    /**
     * Creates a new list with validation and duplicate name checking
     * @param listData - The list creation data
     * @returns Promise resolving to the created list
     * @throws Error if validation fails or list name already exists
     */
    async createList(listData: ICreateListRequest): Promise<IList> {
        // Validate input data
        const { error, value } = ValidationService.createListSchema.validate(listData);
        if (error) {
            throw new Error(`Validation error: ${error.details[0].message}`);
        }

        try {
            // Repository handles duplicate name validation
            const createdList = await this.listRepository.create(value);
            return createdList;
        } catch (repositoryError) {
            // Re-throw repository errors with additional context
            if (repositoryError instanceof Error && repositoryError.message.includes('already exists')) {
                throw new Error(`List creation failed: ${repositoryError.message}`);
            }
            throw new Error(`Failed to create list: ${repositoryError instanceof Error ? repositoryError.message : 'Unknown error'}`);
        }
    }

    /**
     * Retrieves all lists with optional task counts
     * @param includeTaskCount - Whether to include computed taskCount field
     * @returns Promise resolving to array of all lists
     */
    async getAllLists(includeTaskCount = true): Promise<IList[]> {
        try {
            return await this.listRepository.findAll(includeTaskCount);
        } catch (repositoryError) {
            throw new Error(`Failed to retrieve lists: ${repositoryError instanceof Error ? repositoryError.message : 'Unknown error'}`);
        }
    }

    /**
     * Retrieves a specific list by ID with optional task count
     * @param id - The unique identifier of the list
     * @param includeTaskCount - Whether to include computed taskCount field
     * @returns Promise resolving to the list if found, null otherwise
     * @throws Error if validation fails
     */
    async getListById(id: string, includeTaskCount = true): Promise<IList | null> {
        // Validate UUID format
        try {
            await ValidationService.validateUuid(id);
        } catch (validationError) {
            throw new Error(`Invalid list ID: ${validationError instanceof Error ? validationError.message : 'Invalid UUID format'}`);
        }

        try {
            return await this.listRepository.findById(id, includeTaskCount);
        } catch (repositoryError) {
            throw new Error(`Failed to retrieve list: ${repositoryError instanceof Error ? repositoryError.message : 'Unknown error'}`);
        }
    }

    /**
     * Updates an existing list with validation
     * @param id - The unique identifier of the list to update
     * @param updateData - Partial list data to update
     * @returns Promise resolving to the updated list if found, null otherwise
     * @throws Error if validation fails or list not found
     */
    async updateList(id: string, updateData: IUpdateListRequest): Promise<IList | null> {
        // Validate UUID format
        try {
            await ValidationService.validateUuid(id);
        } catch (validationError) {
            throw new Error(`Invalid list ID: ${validationError instanceof Error ? validationError.message : 'Invalid UUID format'}`);
        }

        // Validate update data
        const { error, value } = ValidationService.updateListSchema.validate(updateData);
        if (error) {
            throw new Error(`Validation error: ${error.details[0].message}`);
        }

        try {
            // Check if list exists
            const existingList = await this.listRepository.findById(id);
            if (!existingList) {
                return null;
            }

            // If updating name, check for duplicates (excluding current list)
            if (value.name && value.name !== existingList.name) {
                const nameExists = await this.listRepository.nameExists(value.name, id);
                if (nameExists) {
                    throw new Error(`List with name '${value.name}' already exists`);
                }
            }

            const updatedList = await this.listRepository.update(id, value);
            return updatedList;
        } catch (repositoryError) {
            if (repositoryError instanceof Error && repositoryError.message.includes('already exists')) {
                throw repositoryError;
            }
            throw new Error(`Failed to update list: ${repositoryError instanceof Error ? repositoryError.message : 'Unknown error'}`);
        }
    }

    /**
     * Deletes a list and all its associated tasks (cascade delete)
     * @param id - The unique identifier of the list to delete
     * @returns Promise resolving to true if list was deleted, false if not found
     * @throws Error if validation fails or cascade deletion fails
     */
    async deleteList(id: string): Promise<boolean> {
        // Validate UUID format
        try {
            await ValidationService.validateUuid(id);
        } catch (validationError) {
            throw new Error(`Invalid list ID: ${validationError instanceof Error ? validationError.message : 'Invalid UUID format'}`);
        }

        try {
            // Check if list exists
            const existingList = await this.listRepository.findById(id);
            if (!existingList) {
                return false;
            }

            // First, delete all tasks associated with this list (cascade delete)
            const tasks = await this.taskRepository.findByListId(id);
            if (tasks.length > 0) {
                // Delete all tasks in the list
                for (const task of tasks) {
                    await this.taskRepository.delete(task.id);
                }
            }

            // Then delete the list itself
            const deleted = await this.listRepository.delete(id);
            return deleted;
        } catch (repositoryError) {
            throw new Error(`Failed to delete list: ${repositoryError instanceof Error ? repositoryError.message : 'Unknown error'}`);
        }
    }

    /**
     * Checks if a list exists by ID
     * @param id - The unique identifier to check
     * @returns Promise resolving to true if list exists, false otherwise
     * @throws Error if validation fails
     */
    async listExists(id: string): Promise<boolean> {
        // Validate UUID format
        try {
            await ValidationService.validateUuid(id);
        } catch (validationError) {
            throw new Error(`Invalid list ID: ${validationError instanceof Error ? validationError.message : 'Invalid UUID format'}`);
        }

        try {
            return await this.listRepository.exists(id);
        } catch (repositoryError) {
            throw new Error(`Failed to check list existence: ${repositoryError instanceof Error ? repositoryError.message : 'Unknown error'}`);
        }
    }

    /**
     * Checks if a list name is available (not already taken)
     * @param name - The name to check for availability
     * @param excludeId - Optional ID to exclude from the check (for updates)
     * @returns Promise resolving to true if name is available, false if taken
     * @throws Error if validation fails
     */
    async isListNameAvailable(name: string, excludeId?: string): Promise<boolean> {
        // Validate name using the create schema's name validation
        const nameValidation = ValidationService.createListSchema.extract('name').validate(name);
        if (nameValidation.error) {
            throw new Error(`Invalid list name: ${nameValidation.error.details[0].message}`);
        }

        // Validate excludeId if provided
        if (excludeId) {
            try {
                await ValidationService.validateUuid(excludeId);
            } catch (validationError) {
                throw new Error(`Invalid exclude ID: ${validationError instanceof Error ? validationError.message : 'Invalid UUID format'}`);
            }
        }

        try {
            const nameExists = await this.listRepository.nameExists(name, excludeId);
            return !nameExists;
        } catch (repositoryError) {
            throw new Error(`Failed to check name availability: ${repositoryError instanceof Error ? repositoryError.message : 'Unknown error'}`);
        }
    }

    /**
     * Gets the count of tasks for a specific list
     * @param id - The unique identifier of the list
     * @returns Promise resolving to the number of tasks in the list
     * @throws Error if validation fails or list not found
     */
    async getListTaskCount(id: string): Promise<number> {
        // Validate UUID format
        try {
            await ValidationService.validateUuid(id);
        } catch (validationError) {
            throw new Error(`Invalid list ID: ${validationError instanceof Error ? validationError.message : 'Invalid UUID format'}`);
        }

        try {
            // Check if list exists first
            const exists = await this.listRepository.exists(id);
            if (!exists) {
                throw new Error(`List with ID '${id}' not found`);
            }

            return await this.listRepository.getTaskCount(id);
        } catch (repositoryError) {
            if (repositoryError instanceof Error && repositoryError.message.includes('not found')) {
                throw repositoryError;
            }
            throw new Error(`Failed to get task count: ${repositoryError instanceof Error ? repositoryError.message : 'Unknown error'}`);
        }
    }

    /**
     * Gets all lists with their task counts in a single optimized operation
     * @returns Promise resolving to array of lists with taskCount populated
     */
    async getAllListsWithTaskCounts(): Promise<IList[]> {
        try {
            return await this.listRepository.findAllWithTaskCounts();
        } catch (repositoryError) {
            throw new Error(`Failed to retrieve lists with task counts: ${repositoryError instanceof Error ? repositoryError.message : 'Unknown error'}`);
        }
    }

    /**
     * Gets the total count of lists
     * @returns Promise resolving to the total number of lists
     */
    async getListCount(): Promise<number> {
        try {
            return await this.listRepository.count();
        } catch (repositoryError) {
            throw new Error(`Failed to get list count: ${repositoryError instanceof Error ? repositoryError.message : 'Unknown error'}`);
        }
    }
}
