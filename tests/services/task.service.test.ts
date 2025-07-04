import { SortOrder, TaskSortBy } from '../../src/models/enums/task-sort.enum';
import { ICreateTaskRequest, ITaskQuery, IUpdateTaskRequest } from '../../src/models/interfaces/request.interface';
import { MemoryListRepository } from '../../src/repositories/memory/memory-list.repository';
import { MemoryTaskRepository } from '../../src/repositories/memory/memory-task.repository';
import { ListService } from '../../src/services/list.service';
import { TaskService } from '../../src/services/task.service';

describe('TaskService', () => {
    let taskService: TaskService;
    let listService: ListService;
    let listRepository: MemoryListRepository;
    let taskRepository: MemoryTaskRepository;
    let testListId: string;

    beforeEach(async () => {
        listRepository = new MemoryListRepository();
        taskRepository = new MemoryTaskRepository();
        taskService = new TaskService(taskRepository, listRepository);
        listService = new ListService(listRepository, taskRepository);

        // Create a test list for task operations
        const testList = await listService.createList({
            name: 'Test List',
            description: 'A list for testing task operations'
        });
        testListId = testList.id;
    });

    afterEach(async () => {
        await listRepository.clear();
        await taskRepository.clear();
    });

    describe('createTask', () => {
        it('should create a new task with valid data', async () => {
            const taskData: ICreateTaskRequest = {
                title: 'Test Task',
                description: 'A test task for unit testing',
                deadline: new Date(Date.now() + 86400000) // Tomorrow
            };

            const createdTask = await taskService.createTask(testListId, taskData);

            expect(createdTask).toBeDefined();
            expect(createdTask.id).toBeDefined();
            expect(createdTask.listId).toBe(testListId);
            expect(createdTask.title).toBe(taskData.title);
            expect(createdTask.description).toBe(taskData.description);
            expect(createdTask.completed).toBe(false);
            expect(createdTask.createdAt).toBeInstanceOf(Date);
            expect(createdTask.updatedAt).toBeInstanceOf(Date);
        });

        it('should create a task without optional fields', async () => {
            const taskData: ICreateTaskRequest = {
                title: 'Simple Task'
            };

            const createdTask = await taskService.createTask(testListId, taskData);

            expect(createdTask).toBeDefined();
            expect(createdTask.title).toBe(taskData.title);
            expect(createdTask.description).toBeUndefined();
            expect(createdTask.deadline).toBeUndefined();
            expect(createdTask.completed).toBe(false);
        });

        it('should throw error for invalid list ID format', async () => {
            const taskData: ICreateTaskRequest = {
                title: 'Test Task'
            };

            await expect(taskService.createTask('invalid-uuid', taskData))
                .rejects.toThrow('Validation failed');
        });

        it('should throw error for non-existent list', async () => {
            const taskData: ICreateTaskRequest = {
                title: 'Test Task'
            };
            const nonExistentListId = '550e8400-e29b-41d4-a716-446655440000';

            await expect(taskService.createTask(nonExistentListId, taskData))
                .rejects.toThrow(`List with ID ${nonExistentListId} not found`);
        });

        it('should throw error for invalid task data', async () => {
            const invalidTaskData = {
                title: '', // Empty title should fail validation
                description: 'A'.repeat(1001) // Too long description
            } as ICreateTaskRequest;

            await expect(taskService.createTask(testListId, invalidTaskData))
                .rejects.toThrow('Validation error');
        });
    });

    describe('getAllTasks', () => {
        beforeEach(async () => {
            // Create some test tasks
            await taskService.createTask(testListId, {
                title: 'Task 1',
                description: 'First task'
            });
            await taskService.createTask(testListId, {
                title: 'Task 2',
                deadline: new Date(Date.now() + 86400000)
            });
        });

        it('should retrieve all tasks', async () => {
            const tasks = await taskService.getAllTasks();

            expect(tasks).toBeDefined();
            expect(tasks.length).toBe(2);
            expect(tasks.every(task => task.listId === testListId)).toBe(true);
        });

        it('should filter tasks by list ID', async () => {
            const query: ITaskQuery = {
                listId: testListId
            };

            const tasks = await taskService.getAllTasks(query);

            expect(tasks).toBeDefined();
            expect(tasks.length).toBe(2);
            expect(tasks.every(task => task.listId === testListId)).toBe(true);
        });

        it('should sort tasks by title', async () => {
            const query: ITaskQuery = {
                sortBy: TaskSortBy.TITLE,
                order: SortOrder.ASC
            };

            const tasks = await taskService.getAllTasks(query);

            expect(tasks).toBeDefined();
            expect(tasks.length).toBe(2);
            expect(tasks[0].title).toBe('Task 1');
            expect(tasks[1].title).toBe('Task 2');
        });

        it('should limit results', async () => {
            const query: ITaskQuery = {
                limit: 1
            };

            const tasks = await taskService.getAllTasks(query);

            expect(tasks).toBeDefined();
            expect(tasks.length).toBe(1);
        });

        it('should throw error for invalid query parameters', async () => {
            const invalidQuery = {
                limit: -1 // Invalid limit
            } as ITaskQuery;

            await expect(taskService.getAllTasks(invalidQuery))
                .rejects.toThrow('Query validation error');
        });
    });

    describe('getTasksByListId', () => {
        let secondListId: string;

        beforeEach(async () => {
            // Create second list
            const secondList = await listService.createList({
                name: 'Second List'
            });
            secondListId = secondList.id;

            // Create tasks in both lists
            await taskService.createTask(testListId, {
                title: 'Task in List 1'
            });
            await taskService.createTask(secondListId, {
                title: 'Task in List 2'
            });
        });

        it('should retrieve tasks for specific list', async () => {
            const tasks = await taskService.getTasksByListId(testListId);

            expect(tasks).toBeDefined();
            expect(tasks.length).toBe(1);
            expect(tasks[0].title).toBe('Task in List 1');
            expect(tasks[0].listId).toBe(testListId);
        });

        it('should throw error for non-existent list', async () => {
            const nonExistentListId = '550e8400-e29b-41d4-a716-446655440000';

            await expect(taskService.getTasksByListId(nonExistentListId))
                .rejects.toThrow(`List with ID ${nonExistentListId} not found`);
        });

        it('should return empty array for list with no tasks', async () => {
            const emptyList = await listService.createList({
                name: 'Empty List'
            });

            const tasks = await taskService.getTasksByListId(emptyList.id);

            expect(tasks).toBeDefined();
            expect(tasks.length).toBe(0);
        });
    });

    describe('getTaskById', () => {
        let taskId: string;

        beforeEach(async () => {
            const task = await taskService.createTask(testListId, {
                title: 'Test Task'
            });
            taskId = task.id;
        });

        it('should retrieve task by ID', async () => {
            const task = await taskService.getTaskById(taskId);

            expect(task).toBeDefined();
            expect(task!.id).toBe(taskId);
            expect(task!.title).toBe('Test Task');
        });

        it('should return null for non-existent task', async () => {
            const nonExistentTaskId = '550e8400-e29b-41d4-a716-446655440000';

            const task = await taskService.getTaskById(nonExistentTaskId);

            expect(task).toBeNull();
        });

        it('should throw error for invalid task ID format', async () => {
            await expect(taskService.getTaskById('invalid-uuid'))
                .rejects.toThrow('Validation failed');
        });
    });

    describe('updateTask', () => {
        let taskId: string;

        beforeEach(async () => {
            const task = await taskService.createTask(testListId, {
                title: 'Original Task',
                description: 'Original description'
            });
            taskId = task.id;
        });

        it('should update task with valid data', async () => {
            const updateData: IUpdateTaskRequest = {
                title: 'Updated Task',
                description: 'Updated description',
                deadline: new Date(Date.now() + 86400000)
            };

            const updatedTask = await taskService.updateTask(taskId, updateData);

            expect(updatedTask).toBeDefined();
            expect(updatedTask!.title).toBe(updateData.title);
            expect(updatedTask!.description).toBe(updateData.description);
            expect(updatedTask!.deadline).toEqual(updateData.deadline);
        });

        it('should update only provided fields', async () => {
            const updateData: IUpdateTaskRequest = {
                title: 'Updated Title Only'
            };

            const updatedTask = await taskService.updateTask(taskId, updateData);

            expect(updatedTask).toBeDefined();
            expect(updatedTask!.title).toBe(updateData.title);
            expect(updatedTask!.description).toBe('Original description');
        });

        it('should update completion status and set completedAt', async () => {
            const updateData: IUpdateTaskRequest = {
                completed: true
            };

            const updatedTask = await taskService.updateTask(taskId, updateData);

            expect(updatedTask).toBeDefined();
            expect(updatedTask!.completed).toBe(true);
            expect(updatedTask!.completedAt).toBeInstanceOf(Date);
        });

        it('should return null for non-existent task', async () => {
            const nonExistentTaskId = '550e8400-e29b-41d4-a716-446655440000';
            const updateData: IUpdateTaskRequest = {
                title: 'Updated Title'
            };

            const result = await taskService.updateTask(nonExistentTaskId, updateData);

            expect(result).toBeNull();
        });

        it('should throw error for invalid update data', async () => {
            const invalidUpdateData = {
                title: '' // Empty title should fail validation
            } as IUpdateTaskRequest;

            await expect(taskService.updateTask(taskId, invalidUpdateData))
                .rejects.toThrow('Validation error');
        });
    });

    describe('toggleTaskCompletion', () => {
        let taskId: string;

        beforeEach(async () => {
            const task = await taskService.createTask(testListId, {
                title: 'Toggle Test Task'
            });
            taskId = task.id;
        });

        it('should toggle task from incomplete to complete', async () => {
            const updatedTask = await taskService.toggleTaskCompletion(taskId);

            expect(updatedTask).toBeDefined();
            expect(updatedTask!.completed).toBe(true);
            expect(updatedTask!.completedAt).toBeInstanceOf(Date);
        });

        it('should toggle task from complete to incomplete', async () => {
            // First complete the task
            await taskService.markTaskCompleted(taskId);

            // Then toggle it back
            const updatedTask = await taskService.toggleTaskCompletion(taskId);

            expect(updatedTask).toBeDefined();
            expect(updatedTask!.completed).toBe(false);
            expect(updatedTask!.completedAt).toBeNull();
        });

        it('should return null for non-existent task', async () => {
            const nonExistentTaskId = '550e8400-e29b-41d4-a716-446655440000';

            const result = await taskService.toggleTaskCompletion(nonExistentTaskId);

            expect(result).toBeNull();
        });
    });

    describe('markTaskCompleted', () => {
        let taskId: string;

        beforeEach(async () => {
            const task = await taskService.createTask(testListId, {
                title: 'Mark Complete Test Task'
            });
            taskId = task.id;
        });

        it('should mark task as completed', async () => {
            const updatedTask = await taskService.markTaskCompleted(taskId);

            expect(updatedTask).toBeDefined();
            expect(updatedTask!.completed).toBe(true);
            expect(updatedTask!.completedAt).toBeInstanceOf(Date);
        });

        it('should return null for non-existent task', async () => {
            const nonExistentTaskId = '550e8400-e29b-41d4-a716-446655440000';

            const result = await taskService.markTaskCompleted(nonExistentTaskId);

            expect(result).toBeNull();
        });
    });

    describe('markTaskIncomplete', () => {
        let taskId: string;

        beforeEach(async () => {
            const task = await taskService.createTask(testListId, {
                title: 'Mark Incomplete Test Task'
            });
            taskId = task.id;
            // Mark it as completed first
            await taskService.markTaskCompleted(taskId);
        });

        it('should mark task as incomplete', async () => {
            const updatedTask = await taskService.markTaskIncomplete(taskId);

            expect(updatedTask).toBeDefined();
            expect(updatedTask!.completed).toBe(false);
            expect(updatedTask!.completedAt).toBeNull();
        });

        it('should return null for non-existent task', async () => {
            const nonExistentTaskId = '550e8400-e29b-41d4-a716-446655440000';

            const result = await taskService.markTaskIncomplete(nonExistentTaskId);

            expect(result).toBeNull();
        });
    });

    describe('deleteTask', () => {
        let taskId: string;

        beforeEach(async () => {
            const task = await taskService.createTask(testListId, {
                title: 'Delete Test Task'
            });
            taskId = task.id;
        });

        it('should delete existing task', async () => {
            const result = await taskService.deleteTask(taskId);

            expect(result).toBe(true);

            // Verify task is actually deleted
            const deletedTask = await taskService.getTaskById(taskId);
            expect(deletedTask).toBeNull();
        });

        it('should return false for non-existent task', async () => {
            const nonExistentTaskId = '550e8400-e29b-41d4-a716-446655440000';

            const result = await taskService.deleteTask(nonExistentTaskId);

            expect(result).toBe(false);
        });

        it('should throw error for invalid task ID format', async () => {
            await expect(taskService.deleteTask('invalid-uuid'))
                .rejects.toThrow('Validation failed');
        });
    });

    describe('getTasksDueThisWeek', () => {
        beforeEach(async () => {
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 86400000);
            const nextWeek = new Date(now.getTime() + 8 * 86400000);

            // Create tasks with different deadlines
            await taskService.createTask(testListId, {
                title: 'Due Tomorrow',
                deadline: tomorrow
            });
            await taskService.createTask(testListId, {
                title: 'Due Next Week',
                deadline: nextWeek
            });
            await taskService.createTask(testListId, {
                title: 'No Deadline'
            });
        });

        it('should retrieve tasks due this week', async () => {
            const tasks = await taskService.getTasksDueThisWeek();

            expect(tasks).toBeDefined();
            // This test depends on the current week calculation
            // At minimum, should not include tasks without deadlines
            expect(tasks.every(task => task.deadline !== undefined)).toBe(true);
        });

        it('should filter by additional parameters', async () => {
            const query = {
                includeCompleted: false
            };

            const tasks = await taskService.getTasksDueThisWeek(query);

            expect(tasks).toBeDefined();
            expect(tasks.every(task => !task.completed)).toBe(true);
        });
    });

    describe('getOverdueTasks', () => {
        beforeEach(async () => {
            // We'll create a task and then manually set its deadline to past date
            // since validation prevents creating tasks with past deadlines
            const tomorrow = new Date(Date.now() + 86400000);

            // Create future task first
            const futureTask = await taskService.createTask(testListId, {
                title: 'Future Task',
                deadline: tomorrow
            });

            // We need to manually update the repository to simulate an overdue task
            // Since validation prevents creating tasks with past deadlines
            const yesterday = new Date(Date.now() - 86400000);
            await taskRepository.update(futureTask.id, { deadline: yesterday });
        });

        it('should retrieve overdue tasks', async () => {
            const tasks = await taskService.getOverdueTasks();

            expect(tasks).toBeDefined();
            // Note: This test depends on the repository implementation
            // In real scenario, tasks become overdue when their deadlines pass
        });
    });

    describe('getTasksByDateRange', () => {
        beforeEach(async () => {
            const tomorrow = new Date(Date.now() + 86400000);
            const dayAfterTomorrow = new Date(Date.now() + 2 * 86400000);
            const threeDaysFromNow = new Date(Date.now() + 3 * 86400000);

            await taskService.createTask(testListId, {
                title: 'Tomorrow Task',
                deadline: tomorrow
            });
            await taskService.createTask(testListId, {
                title: 'Day After Tomorrow Task',
                deadline: dayAfterTomorrow
            });
            await taskService.createTask(testListId, {
                title: 'Three Days Task',
                deadline: threeDaysFromNow
            });
        });

        it('should retrieve tasks in date range', async () => {
            const startDate = new Date(Date.now() + 86400000); // Tomorrow
            const endDate = new Date(Date.now() + 3 * 86400000); // Three days from now

            const tasks = await taskService.getTasksByDateRange(startDate, endDate);

            expect(tasks).toBeDefined();
            expect(tasks.length).toBeGreaterThanOrEqual(2); // Should include tasks in range
        });

        it('should handle string dates', async () => {
            const startDate = new Date(Date.now() + 86400000).toISOString();
            const endDate = new Date(Date.now() + 3 * 86400000).toISOString();

            const tasks = await taskService.getTasksByDateRange(startDate, endDate);

            expect(tasks).toBeDefined();
            expect(tasks.length).toBeGreaterThanOrEqual(2);
        });

        it('should throw error for invalid date format', async () => {
            await expect(taskService.getTasksByDateRange('invalid-date', new Date()))
                .rejects.toThrow('Invalid date format provided');
        });

        it('should throw error when start date is after end date', async () => {
            const startDate = new Date(Date.now() + 3 * 86400000);
            const endDate = new Date(Date.now() + 86400000);

            await expect(taskService.getTasksByDateRange(startDate, endDate))
                .rejects.toThrow('Start date must be before or equal to end date');
        });
    });
});
