import { v4 as uuidv4 } from 'uuid';
import { TaskSortBy } from '../../models/enums/task-sort.enum';
import { ITask } from '../../models/interfaces/task.interface';
import { ITaskQueryOptions, ITaskRepository } from '../interfaces/task-repository.interface';

/**
 * In-memory implementation of the Task repository
 * Stores tasks in memory for development and testing
 */
export class MemoryTaskRepository implements ITaskRepository {
    private tasks: Map<string, ITask> = new Map();

    /**
     * Creates a new task in memory
     */
    async create(taskData: Omit<ITask, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITask> {
        const now = new Date();
        const task: ITask = {
            id: uuidv4(),
            listId: taskData.listId,
            title: taskData.title,
            ...(taskData.description !== undefined && { description: taskData.description }),
            ...(taskData.deadline !== undefined && { deadline: taskData.deadline }),
            completed: taskData.completed || false,
            ...(taskData.completedAt !== undefined && { completedAt: taskData.completedAt }),
            createdAt: now,
            updatedAt: now
        };

        this.tasks.set(task.id, task);
        return { ...task };
    }

    /**
     * Retrieves all tasks with optional filtering and sorting
     */
    async findAll(options?: ITaskQueryOptions): Promise<ITask[]> {
        let tasks = Array.from(this.tasks.values());

        // Apply filters
        if (options) {
            tasks = this.applyFilters(tasks, options);
            tasks = this.applySorting(tasks, options);
            tasks = this.applyPagination(tasks, options);
        }

        return tasks.map(task => ({ ...task }));
    }

    /**
     * Retrieves a specific task by ID
     */
    async findById(id: string): Promise<ITask | null> {
        const task = this.tasks.get(id);
        return task ? { ...task } : null;
    }

    /**
     * Retrieves all tasks belonging to a specific list
     */
    async findByListId(listId: string, options?: Omit<ITaskQueryOptions, 'listId'>): Promise<ITask[]> {
        const queryOptions: ITaskQueryOptions = { ...options, listId };
        return this.findAll(queryOptions);
    }

    /**
     * Retrieves tasks with deadlines in the specified date range
     */
    async findByDateRange(startDate: Date, endDate: Date, options?: Omit<ITaskQueryOptions, 'deadlineRange'>): Promise<ITask[]> {
        const queryOptions: ITaskQueryOptions = {
            ...options,
            deadlineRange: { start: startDate, end: endDate }
        };
        return this.findAll(queryOptions);
    }

    /**
     * Retrieves tasks due this week (Monday to Sunday)
     */
    async findDueThisWeek(options?: Omit<ITaskQueryOptions, 'deadlineRange'>): Promise<ITask[]> {
        const { start, end } = this.getCurrentWeekRange();
        return this.findByDateRange(start, end, options);
    }

    /**
     * Retrieves overdue tasks (deadline has passed and not completed)
     */
    async findOverdue(options?: Omit<ITaskQueryOptions, 'deadlineRange' | 'completed'>): Promise<ITask[]> {
        const now = new Date();
        const queryOptions: ITaskQueryOptions = {
            ...options,
            completed: false,
            deadlineRange: { start: new Date(0), end: now }
        };
        return this.findAll(queryOptions);
    }

    /**
     * Updates an existing task
     */
    async update(id: string, updateData: Partial<Omit<ITask, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ITask | null> {
        const existingTask = this.tasks.get(id);
        if (!existingTask) {
            return null;
        }

        const updatedTask: ITask = {
            ...existingTask,
            ...updateData,
            id: existingTask.id, // Ensure ID cannot be changed
            createdAt: existingTask.createdAt, // Ensure createdAt cannot be changed
            updatedAt: new Date()
        };

        // Handle completion logic
        if (updateData.completed !== undefined) {
            if (updateData.completed && !existingTask.completed) {
                updatedTask.completedAt = new Date();
            } else if (!updateData.completed && existingTask.completed) {
                updatedTask.completedAt = null;
            }
        }

        this.tasks.set(id, updatedTask);
        return { ...updatedTask };
    }

    /**
     * Toggles the completion status of a task
     */
    async toggleCompletion(id: string): Promise<ITask | null> {
        const task = this.tasks.get(id);
        if (!task) {
            return null;
        }

        return this.update(id, { completed: !task.completed });
    }

    /**
     * Marks a task as completed
     */
    async markCompleted(id: string): Promise<ITask | null> {
        return this.update(id, { completed: true });
    }

    /**
     * Marks a task as not completed
     */
    async markIncomplete(id: string): Promise<ITask | null> {
        return this.update(id, { completed: false });
    }

    /**
     * Deletes a task from memory
     */
    async delete(id: string): Promise<boolean> {
        return this.tasks.delete(id);
    }

    /**
     * Deletes all tasks belonging to a specific list
     */
    async deleteByListId(listId: string): Promise<number> {
        const tasksToDelete = Array.from(this.tasks.values()).filter(task => task.listId === listId);
        let deletedCount = 0;

        for (const task of tasksToDelete) {
            if (this.tasks.delete(task.id)) {
                deletedCount++;
            }
        }

        return deletedCount;
    }

    /**
     * Checks if a task exists by ID
     */
    async exists(id: string): Promise<boolean> {
        return this.tasks.has(id);
    }

    /**
     * Gets the count of tasks for a specific list
     */
    async countByListId(listId: string, includeCompleted = true): Promise<number> {
        return Array.from(this.tasks.values())
            .filter(task => task.listId === listId && (includeCompleted || !task.completed))
            .length;
    }

    /**
     * Gets the count of completed tasks for a specific list
     */
    async countCompletedByListId(listId: string): Promise<number> {
        return Array.from(this.tasks.values())
            .filter(task => task.listId === listId && task.completed)
            .length;
    }

    /**
     * Gets the count of pending tasks for a specific list
     */
    async countPendingByListId(listId: string): Promise<number> {
        return Array.from(this.tasks.values())
            .filter(task => task.listId === listId && !task.completed)
            .length;
    }

    /**
     * Gets the count of overdue tasks across all lists
     */
    async countOverdue(): Promise<number> {
        const now = new Date();
        return Array.from(this.tasks.values())
            .filter(task =>
                !task.completed &&
                task.deadline &&
                task.deadline < now
            )
            .length;
    }

    /**
     * Gets the count of tasks due this week
     */
    async countDueThisWeek(): Promise<number> {
        const { start, end } = this.getCurrentWeekRange();
        return Array.from(this.tasks.values())
            .filter(task =>
                task.deadline &&
                task.deadline >= start &&
                task.deadline <= end
            )
            .length;
    }

    /**
     * Clears all tasks from memory (for testing)
     */
    async clear(): Promise<void> {
        this.tasks.clear();
    }

    /**
     * Gets the total count of tasks
     */
    async count(includeCompleted = true): Promise<number> {
        if (includeCompleted) {
            return this.tasks.size;
        }
        return Array.from(this.tasks.values()).filter(task => !task.completed).length;
    }

    /**
     * Bulk updates multiple tasks
     */
    async bulkUpdate(updates: Array<{ id: string; data: Partial<Omit<ITask, 'id' | 'createdAt' | 'updatedAt'>> }>): Promise<ITask[]> {
        const updatedTasks: ITask[] = [];

        for (const update of updates) {
            const updatedTask = await this.update(update.id, update.data);
            if (updatedTask) {
                updatedTasks.push(updatedTask);
            }
        }

        return updatedTasks;
    }

    /**
     * Bulk deletes multiple tasks by their IDs
     */
    async bulkDelete(ids: string[]): Promise<number> {
        let deletedCount = 0;
        for (const id of ids) {
            if (await this.delete(id)) {
                deletedCount++;
            }
        }
        return deletedCount;
    }

    /**
     * Seeds the repository with sample data (for testing)
     */
    async seedData(listIds: string[]): Promise<void> {
        await this.clear();

        if (listIds.length === 0) return;

        const sampleTasks = [
            {
                listId: listIds[0],
                title: 'Buy groceries',
                description: 'Get milk, bread, and eggs',
                deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
                completed: false
            },
            {
                listId: listIds[0],
                title: 'Call dentist',
                description: 'Schedule annual cleaning',
                completed: true,
                completedAt: new Date()
            },
            {
                listId: listIds[1],
                title: 'Complete project proposal',
                description: 'Finish the Q4 project proposal document',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                completed: false
            },
            {
                listId: listIds[1],
                title: 'Team meeting prep',
                description: 'Prepare agenda for Monday team meeting',
                deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
                completed: false
            }
        ];

        for (const taskData of sampleTasks) {
            await this.create(taskData);
        }
    }

    /**
     * Private helper methods
     */

    private applyFilters(tasks: ITask[], options: ITaskQueryOptions): ITask[] {
        return tasks.filter(task => {
            // Filter by list ID
            if (options.listId && task.listId !== options.listId) {
                return false;
            }

            // Filter by completion status
            if (options.completed !== undefined && task.completed !== options.completed) {
                return false;
            }

            // Filter by includeCompleted
            if (options.includeCompleted === false && task.completed) {
                return false;
            }

            // Filter by deadline range
            if (options.deadlineRange && task.deadline) {
                const deadlineTime = task.deadline.getTime();
                const startTime = options.deadlineRange.start.getTime();
                const endTime = options.deadlineRange.end.getTime();

                if (deadlineTime < startTime || deadlineTime > endTime) {
                    return false;
                }
            } else if (options.deadlineRange && !task.deadline) {
                // Exclude tasks without deadlines when filtering by deadline range
                return false;
            }

            // Filter by created date range
            if (options.createdRange) {
                const createdTime = task.createdAt.getTime();
                const startTime = options.createdRange.start.getTime();
                const endTime = options.createdRange.end.getTime();

                if (createdTime < startTime || createdTime > endTime) {
                    return false;
                }
            }

            return true;
        });
    }

    private applySorting(tasks: ITask[], options: ITaskQueryOptions): ITask[] {
        if (!options.sortBy) {
            return tasks;
        }

        const sortOrder = options.sortOrder || 'asc';
        const multiplier = sortOrder === 'asc' ? 1 : -1;

        return tasks.sort((a, b) => {
            let comparison = 0;

            switch (options.sortBy) {
                case TaskSortBy.TITLE:
                    comparison = a.title.localeCompare(b.title);
                    break;
                case TaskSortBy.CREATED_AT:
                    comparison = a.createdAt.getTime() - b.createdAt.getTime();
                    break;
                case TaskSortBy.UPDATED_AT:
                    comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
                    break;
                case TaskSortBy.DEADLINE:
                    // Handle tasks without deadlines (put them at the end)
                    if (!a.deadline && !b.deadline) comparison = 0;
                    else if (!a.deadline) comparison = 1;
                    else if (!b.deadline) comparison = -1;
                    else comparison = a.deadline.getTime() - b.deadline.getTime();
                    break;
                case TaskSortBy.COMPLETED:
                    comparison = (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
                    break;
                default:
                    comparison = 0;
            }

            return comparison * multiplier;
        });
    }

    private applyPagination(tasks: ITask[], options: ITaskQueryOptions): ITask[] {
        if (options.limit === undefined && options.offset === undefined) {
            return tasks;
        }

        const offset = options.offset || 0;
        const limit = options.limit;

        if (limit === undefined) {
            return tasks.slice(offset);
        }

        return tasks.slice(offset, offset + limit);
    }

    private getCurrentWeekRange(): { start: Date; end: Date } {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Calculate days to get to Monday

        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        return { start: monday, end: sunday };
    }
}
