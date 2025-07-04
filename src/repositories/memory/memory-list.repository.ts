import { v4 as uuidv4 } from 'uuid';
import { IList } from '../../models/interfaces/list.interface';
import { IListRepository } from '../interfaces/list-repository.interface';

/**
 * In-memory implementation of the List repository
 * Stores lists in memory for development and testing
 */
export class MemoryListRepository implements IListRepository {
    private lists: Map<string, IList> = new Map();
    private taskCounts: Map<string, number> = new Map();

    /**
     * Creates a new list in memory
     */
    async create(listData: Omit<IList, 'id' | 'createdAt' | 'updatedAt' | 'taskCount'>): Promise<IList> {
        // Check if list with same name already exists
        const existingList = Array.from(this.lists.values()).find(list => list.name === listData.name);
        if (existingList) {
            throw new Error(`List with name '${listData.name}' already exists`);
        }

        const now = new Date();
        const list: IList = {
            id: uuidv4(),
            name: listData.name,
            ...(listData.description !== undefined && { description: listData.description }),
            createdAt: now,
            updatedAt: now,
            taskCount: 0
        };

        this.lists.set(list.id, list);
        this.taskCounts.set(list.id, 0);

        return { ...list };
    }

    /**
     * Retrieves all lists from memory
     */
    async findAll(includeTaskCount = false): Promise<IList[]> {
        const lists = Array.from(this.lists.values());

        if (includeTaskCount) {
            return lists.map(list => ({
                ...list,
                taskCount: this.taskCounts.get(list.id) || 0
            }));
        }

        return lists.map(list => ({ ...list }));
    }

    /**
     * Retrieves a specific list by ID
     */
    async findById(id: string, includeTaskCount = false): Promise<IList | null> {
        const list = this.lists.get(id);
        if (!list) {
            return null;
        }

        const result = { ...list };
        if (includeTaskCount) {
            result.taskCount = this.taskCounts.get(id) || 0;
        }

        return result;
    }

    /**
     * Retrieves a list by name
     */
    async findByName(name: string, includeTaskCount = false): Promise<IList | null> {
        const list = Array.from(this.lists.values()).find(list => list.name === name);
        if (!list) {
            return null;
        }

        const result = { ...list };
        if (includeTaskCount) {
            result.taskCount = this.taskCounts.get(list.id) || 0;
        }

        return result;
    }

    /**
     * Updates an existing list
     */
    async update(id: string, updateData: Partial<Omit<IList, 'id' | 'createdAt' | 'updatedAt' | 'taskCount'>>): Promise<IList | null> {
        const existingList = this.lists.get(id);
        if (!existingList) {
            return null;
        }

        // Check if trying to update name to an existing name
        if (updateData.name && updateData.name !== existingList.name) {
            const nameExists = Array.from(this.lists.values()).some(list =>
                list.id !== id && list.name === updateData.name
            );
            if (nameExists) {
                throw new Error(`List with name '${updateData.name}' already exists`);
            }
        }

        const updatedList: IList = {
            ...existingList,
            ...updateData,
            id: existingList.id, // Ensure ID cannot be changed
            createdAt: existingList.createdAt, // Ensure createdAt cannot be changed
            updatedAt: new Date()
        };

        this.lists.set(id, updatedList);
        return { ...updatedList };
    }

    /**
     * Deletes a list from memory
     */
    async delete(id: string): Promise<boolean> {
        const hasTasksCount = this.taskCounts.get(id) || 0;
        if (hasTasksCount > 0) {
            throw new Error('Cannot delete list that contains tasks. Delete tasks first.');
        }

        const existed = this.lists.has(id);
        this.lists.delete(id);
        this.taskCounts.delete(id);
        return existed;
    }

    /**
     * Checks if a list exists by ID
     */
    async exists(id: string): Promise<boolean> {
        return this.lists.has(id);
    }

    /**
     * Checks if a list with the given name exists
     */
    async nameExists(name: string, excludeId?: string): Promise<boolean> {
        return Array.from(this.lists.values()).some(list =>
            list.name === name && (!excludeId || list.id !== excludeId)
        );
    }

    /**
     * Gets the count of tasks for a specific list
     */
    async getTaskCount(listId: string): Promise<number> {
        return this.taskCounts.get(listId) || 0;
    }

    /**
     * Updates the task count for a list
     */
    async updateTaskCount(listId: string, count: number): Promise<void> {
        if (this.lists.has(listId)) {
            this.taskCounts.set(listId, Math.max(0, count));
        }
    }

    /**
     * Retrieves lists with their task counts
     */
    async findAllWithTaskCounts(): Promise<IList[]> {
        return this.findAll(true);
    }

    /**
     * Clears all lists from memory (for testing)
     */
    async clear(): Promise<void> {
        this.lists.clear();
        this.taskCounts.clear();
    }

    /**
     * Gets the total count of lists
     */
    async count(): Promise<number> {
        return this.lists.size;
    }

    /**
     * Seeds the repository with sample data (for testing)
     */
    async seedData(): Promise<void> {
        await this.clear();

        const sampleLists = [
            {
                name: 'Personal Tasks',
                description: 'Personal to-do items and errands'
            },
            {
                name: 'Work Projects',
                description: 'Work-related tasks and deadlines'
            },
            {
                name: 'Shopping List',
                description: 'Grocery and shopping items'
            }
        ];

        for (const listData of sampleLists) {
            await this.create(listData);
        }
    }
}
