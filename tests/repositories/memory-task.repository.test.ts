import { TaskSortBy } from '../../src/models/enums/task-sort.enum';
import { MemoryTaskRepository } from '../../src/repositories/memory/memory-task.repository';

describe('MemoryTaskRepository', () => {
    let repository: MemoryTaskRepository;

    beforeEach(() => {
        repository = new MemoryTaskRepository();
    });

    describe('create', () => {
        it('should create a new task with generated ID and timestamps', async () => {
            const taskData = {
                listId: 'list-1',
                title: 'Test Task',
                description: 'Test Description',
                deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
                completed: false
            };

            const result = await repository.create(taskData);

            expect(result.id).toBeDefined();
            expect(result.listId).toBe(taskData.listId);
            expect(result.title).toBe(taskData.title);
            expect(result.description).toBe(taskData.description);
            expect(result.deadline).toEqual(taskData.deadline);
            expect(result.completed).toBe(false);
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.updatedAt).toBeInstanceOf(Date);
            expect(result.completedAt).toBeUndefined();
        });

        it('should create task with minimal data', async () => {
            const taskData = {
                listId: 'list-1',
                title: 'Simple Task',
                completed: false
            };

            const result = await repository.create(taskData);

            expect(result.title).toBe(taskData.title);
            expect(result.description).toBeUndefined();
            expect(result.deadline).toBeUndefined();
            expect(result.completed).toBe(false);
        });

        it('should create completed task with completedAt timestamp', async () => {
            const now = new Date();
            const taskData = {
                listId: 'list-1',
                title: 'Completed Task',
                completed: true,
                completedAt: now
            };

            const result = await repository.create(taskData);

            expect(result.completed).toBe(true);
            expect(result.completedAt).toEqual(now);
        });
    });

    describe('findAll', () => {
        beforeEach(async () => {
            // Create sample tasks with slight delays to ensure different timestamps
            await repository.create({
                listId: 'list-1',
                title: 'Task 1',
                completed: false,
                deadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });
            await new Promise(resolve => setTimeout(resolve, 1));
            await repository.create({
                listId: 'list-1',
                title: 'Task 2',
                completed: true
            });
            await new Promise(resolve => setTimeout(resolve, 1));
            await repository.create({
                listId: 'list-2',
                title: 'Task 3',
                completed: false
            });
        });

        it('should return all tasks without filters', async () => {
            const result = await repository.findAll();
            expect(result).toHaveLength(3);
        });

        it('should filter by listId', async () => {
            const result = await repository.findAll({ listId: 'list-1' });
            expect(result).toHaveLength(2);
            expect(result.every(task => task.listId === 'list-1')).toBe(true);
        });

        it('should filter by completed status', async () => {
            const result = await repository.findAll({ completed: true });
            expect(result).toHaveLength(1);
            expect(result[0].completed).toBe(true);
        });

        it('should exclude completed tasks when includeCompleted is false', async () => {
            const result = await repository.findAll({ includeCompleted: false });
            expect(result).toHaveLength(2);
            expect(result.every(task => !task.completed)).toBe(true);
        });

        it('should sort by title ascending', async () => {
            const result = await repository.findAll({
                sortBy: TaskSortBy.TITLE,
                sortOrder: 'asc'
            });
            expect(result[0].title).toBe('Task 1');
            expect(result[1].title).toBe('Task 2');
            expect(result[2].title).toBe('Task 3');
        });

        it('should sort by created date descending', async () => {
            const result = await repository.findAll({
                sortBy: TaskSortBy.CREATED_AT,
                sortOrder: 'desc'
            });
            // Tasks are created in order: Task 1, Task 2, Task 3
            // In descending order by created date, most recent should be first
            expect(result[0].title).toBe('Task 3');
            expect(result[1].title).toBe('Task 2');
            expect(result[2].title).toBe('Task 1');
        });

        it('should apply pagination', async () => {
            const result = await repository.findAll({
                offset: 1,
                limit: 1
            });
            expect(result).toHaveLength(1);
        });
    });

    describe('findById', () => {
        it('should return null for non-existent task', async () => {
            const result = await repository.findById('non-existent-id');
            expect(result).toBeNull();
        });

        it('should return task by ID', async () => {
            const created = await repository.create({
                listId: 'list-1',
                title: 'Test Task',
                completed: false
            });

            const result = await repository.findById(created.id);
            expect(result).not.toBeNull();
            expect(result!.id).toBe(created.id);
            expect(result!.title).toBe('Test Task');
        });
    });

    describe('findByListId', () => {
        it('should return tasks for specific list', async () => {
            await repository.create({ listId: 'list-1', title: 'Task 1', completed: false });
            await repository.create({ listId: 'list-1', title: 'Task 2', completed: false });
            await repository.create({ listId: 'list-2', title: 'Task 3', completed: false });

            const result = await repository.findByListId('list-1');
            expect(result).toHaveLength(2);
            expect(result.every(task => task.listId === 'list-1')).toBe(true);
        });
    });

    describe('findByDateRange', () => {
        it('should return tasks with deadlines in range', async () => {
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            await repository.create({
                listId: 'list-1',
                title: 'Due Tomorrow',
                deadline: tomorrow,
                completed: false
            });
            await repository.create({
                listId: 'list-1',
                title: 'Due Next Week',
                deadline: nextWeek,
                completed: false
            });
            await repository.create({
                listId: 'list-1',
                title: 'No Deadline',
                completed: false
            });

            const result = await repository.findByDateRange(
                new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 hours from now
                new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
            );

            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('Due Tomorrow');
        });
    });

    describe('findDueThisWeek', () => {
        it('should return tasks due this week', async () => {
            const now = new Date();
            const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
            const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            await repository.create({
                listId: 'list-1',
                title: 'Due This Week',
                deadline: inTwoDays,
                completed: false
            });
            await repository.create({
                listId: 'list-1',
                title: 'Due Next Month',
                deadline: nextMonth,
                completed: false
            });

            const result = await repository.findDueThisWeek();

            // Should include task due this week
            expect(result.some(task => task.title === 'Due This Week')).toBe(true);
        });
    });

    describe('findOverdue', () => {
        it('should return overdue incomplete tasks', async () => {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await repository.create({
                listId: 'list-1',
                title: 'Overdue Task',
                deadline: yesterday,
                completed: false
            });
            await repository.create({
                listId: 'list-1',
                title: 'Overdue but Completed',
                deadline: yesterday,
                completed: true
            });
            await repository.create({
                listId: 'list-1',
                title: 'Future Task',
                deadline: tomorrow,
                completed: false
            });

            const result = await repository.findOverdue();
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('Overdue Task');
        });
    });

    describe('update', () => {
        it('should return null for non-existent task', async () => {
            const result = await repository.update('non-existent-id', { title: 'New Title' });
            expect(result).toBeNull();
        });

        it('should update task properties', async () => {
            const created = await repository.create({
                listId: 'list-1',
                title: 'Original Title',
                completed: false
            });

            // Add a small delay to ensure updatedAt is different
            await new Promise(resolve => setTimeout(resolve, 1));

            const result = await repository.update(created.id, {
                title: 'Updated Title',
                description: 'New Description'
            });

            expect(result).not.toBeNull();
            expect(result!.title).toBe('Updated Title');
            expect(result!.description).toBe('New Description');
            expect(result!.updatedAt.getTime()).toBeGreaterThan(result!.createdAt.getTime());
        });

        it('should set completedAt when marking as completed', async () => {
            const created = await repository.create({
                listId: 'list-1',
                title: 'Test Task',
                completed: false
            });

            const result = await repository.update(created.id, { completed: true });

            expect(result!.completed).toBe(true);
            expect(result!.completedAt).toBeInstanceOf(Date);
        });

        it('should remove completedAt when marking as incomplete', async () => {
            const created = await repository.create({
                listId: 'list-1',
                title: 'Test Task',
                completed: true,
                completedAt: new Date()
            });

            const result = await repository.update(created.id, { completed: false });

            expect(result!.completed).toBe(false);
            expect(result!.completedAt).toBeNull();
        });
    });

    describe('completion methods', () => {
        let taskId: string;

        beforeEach(async () => {
            const created = await repository.create({
                listId: 'list-1',
                title: 'Test Task',
                completed: false
            });
            taskId = created.id;
        });

        it('should toggle completion status', async () => {
            let result = await repository.toggleCompletion(taskId);
            expect(result!.completed).toBe(true);

            result = await repository.toggleCompletion(taskId);
            expect(result!.completed).toBe(false);
        });

        it('should mark task as completed', async () => {
            const result = await repository.markCompleted(taskId);
            expect(result!.completed).toBe(true);
            expect(result!.completedAt).toBeInstanceOf(Date);
        });

        it('should mark task as incomplete', async () => {
            await repository.markCompleted(taskId);
            const result = await repository.markIncomplete(taskId);
            expect(result!.completed).toBe(false);
            expect(result!.completedAt).toBeNull();
        });
    });

    describe('delete operations', () => {
        it('should delete existing task', async () => {
            const created = await repository.create({
                listId: 'list-1',
                title: 'Test Task',
                completed: false
            });

            const result = await repository.delete(created.id);
            expect(result).toBe(true);

            const found = await repository.findById(created.id);
            expect(found).toBeNull();
        });

        it('should return false for non-existent task', async () => {
            const result = await repository.delete('non-existent-id');
            expect(result).toBe(false);
        });

        it('should delete all tasks by list ID', async () => {
            await repository.create({ listId: 'list-1', title: 'Task 1', completed: false });
            await repository.create({ listId: 'list-1', title: 'Task 2', completed: false });
            await repository.create({ listId: 'list-2', title: 'Task 3', completed: false });

            const deletedCount = await repository.deleteByListId('list-1');
            expect(deletedCount).toBe(2);

            const remaining = await repository.findByListId('list-1');
            expect(remaining).toHaveLength(0);

            const list2Tasks = await repository.findByListId('list-2');
            expect(list2Tasks).toHaveLength(1);
        });
    });

    describe('count operations', () => {
        beforeEach(async () => {
            await repository.create({ listId: 'list-1', title: 'Task 1', completed: false });
            await repository.create({ listId: 'list-1', title: 'Task 2', completed: true });
            await repository.create({ listId: 'list-2', title: 'Task 3', completed: false });
        });

        it('should count tasks by list ID', async () => {
            const count = await repository.countByListId('list-1');
            expect(count).toBe(2);
        });

        it('should count completed tasks by list ID', async () => {
            const count = await repository.countCompletedByListId('list-1');
            expect(count).toBe(1);
        });

        it('should count pending tasks by list ID', async () => {
            const count = await repository.countPendingByListId('list-1');
            expect(count).toBe(1);
        });

        it('should count total tasks', async () => {
            const count = await repository.count();
            expect(count).toBe(3);
        });

        it('should count only incomplete tasks when specified', async () => {
            const count = await repository.count(false);
            expect(count).toBe(2);
        });
    });

    describe('bulk operations', () => {
        let taskIds: string[];

        beforeEach(async () => {
            const task1 = await repository.create({ listId: 'list-1', title: 'Task 1', completed: false });
            const task2 = await repository.create({ listId: 'list-1', title: 'Task 2', completed: false });
            taskIds = [task1.id, task2.id];
        });

        it('should bulk update tasks', async () => {
            const updates = [
                { id: taskIds[0], data: { title: 'Updated Task 1' } },
                { id: taskIds[1], data: { completed: true } }
            ];

            const result = await repository.bulkUpdate(updates);
            expect(result).toHaveLength(2);
            expect(result[0].title).toBe('Updated Task 1');
            expect(result[1].completed).toBe(true);
        });

        it('should bulk delete tasks', async () => {
            const deletedCount = await repository.bulkDelete(taskIds);
            expect(deletedCount).toBe(2);

            for (const id of taskIds) {
                const found = await repository.findById(id);
                expect(found).toBeNull();
            }
        });
    });

    describe('utility methods', () => {
        it('should clear all tasks', async () => {
            await repository.create({ listId: 'list-1', title: 'Task 1', completed: false });
            await repository.create({ listId: 'list-1', title: 'Task 2', completed: false });

            await repository.clear();

            const count = await repository.count();
            expect(count).toBe(0);
        });

        it('should seed sample data', async () => {
            const listIds = ['list-1', 'list-2'];
            await repository.seedData(listIds);

            const tasks = await repository.findAll();
            expect(tasks.length).toBeGreaterThan(0);
            expect(tasks.some(task => task.title === 'Buy groceries')).toBe(true);
        });

        it('should handle empty list IDs in seed data', async () => {
            await repository.seedData([]);
            const count = await repository.count();
            expect(count).toBe(0);
        });
    });
});
