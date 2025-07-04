import { IList } from '../../src/models/interfaces/list.interface';
import { ICreateListRequest, IUpdateListRequest } from '../../src/models/interfaces/request.interface';
import { ITask } from '../../src/models/interfaces/task.interface';
import { MemoryListRepository } from '../../src/repositories/memory/memory-list.repository';
import { MemoryTaskRepository } from '../../src/repositories/memory/memory-task.repository';
import { ListService } from '../../src/services/list.service';

describe('ListService', () => {
    let listService: ListService;
    let listRepository: MemoryListRepository;
    let taskRepository: MemoryTaskRepository;

    beforeEach(() => {
        listRepository = new MemoryListRepository();
        taskRepository = new MemoryTaskRepository();
        listService = new ListService(listRepository, taskRepository);
    });

    afterEach(async () => {
        await listRepository.clear();
        await taskRepository.clear();
    });

    describe('createList', () => {
        it('should create a new list with valid data', async () => {
            const listData: ICreateListRequest = {
                name: 'Test List',
                description: 'A test list for unit testing'
            };

            const result = await listService.createList(listData);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.name).toBe(listData.name);
            expect(result.description).toBe(listData.description);
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.updatedAt).toBeInstanceOf(Date);
            expect(result.taskCount).toBe(0);
        });

        it('should create a list without description', async () => {
            const listData: ICreateListRequest = {
                name: 'Test List'
            };

            const result = await listService.createList(listData);

            expect(result.name).toBe(listData.name);
            expect(result.description).toBeUndefined();
        });

        it('should throw error for duplicate list name', async () => {
            const listData: ICreateListRequest = {
                name: 'Duplicate List'
            };

            await listService.createList(listData);

            await expect(listService.createList(listData))
                .rejects
                .toThrow('List creation failed: List with name \'Duplicate List\' already exists');
        });

        it('should throw validation error for empty name', async () => {
            const listData: ICreateListRequest = {
                name: ''
            };

            await expect(listService.createList(listData))
                .rejects
                .toThrow('Validation error: "name" is not allowed to be empty');
        });

        it('should throw validation error for name too long', async () => {
            const listData: ICreateListRequest = {
                name: 'a'.repeat(101) // 101 characters
            };

            await expect(listService.createList(listData))
                .rejects
                .toThrow('Validation error: List name cannot exceed 100 characters');
        });

        it('should throw validation error for description too long', async () => {
            const listData: ICreateListRequest = {
                name: 'Valid Name',
                description: 'a'.repeat(501) // 501 characters
            };

            await expect(listService.createList(listData))
                .rejects
                .toThrow('Validation error: Description cannot exceed 500 characters');
        });
    });

    describe('getAllLists', () => {
        it('should return empty array when no lists exist', async () => {
            const result = await listService.getAllLists();
            expect(result).toEqual([]);
        });

        it('should return all lists with task counts by default', async () => {
            await listService.createList({ name: 'List 1' });
            await listService.createList({ name: 'List 2' });

            const result = await listService.getAllLists();

            expect(result).toHaveLength(2);
            expect(result[0].taskCount).toBeDefined();
            expect(result[1].taskCount).toBeDefined();
        });

        it('should return lists with task counts even when includeTaskCount=false (memory repo behavior)', async () => {
            await listService.createList({ name: 'Test List' });

            const result = await listService.getAllLists(false);

            expect(result).toHaveLength(1);
            // Note: Memory repository always includes taskCount=0, this is expected behavior
            expect(result[0].taskCount).toBe(0);
        });
    });

    describe('getListById', () => {
        it('should return list by valid ID', async () => {
            const created = await listService.createList({ name: 'Test List' });

            const result = await listService.getListById(created.id);

            expect(result).toBeDefined();
            expect(result!.id).toBe(created.id);
            expect(result!.name).toBe(created.name);
        });

        it('should return null for non-existent ID', async () => {
            const result = await listService.getListById('12345678-1234-4000-8000-123456789012');
            expect(result).toBeNull();
        });

        it('should throw error for invalid UUID format', async () => {
            await expect(listService.getListById('invalid-uuid'))
                .rejects
                .toThrow('Invalid list ID:');
        });

        it('should include task count by default', async () => {
            const created = await listService.createList({ name: 'Test List' });

            const result = await listService.getListById(created.id);

            expect(result!.taskCount).toBeDefined();
        });

        it('should still include task count when includeTaskCount=false (memory repo behavior)', async () => {
            const created = await listService.createList({ name: 'Test List' });

            const result = await listService.getListById(created.id, false);

            // Memory repository always includes taskCount, real DB implementation might not
            expect(result!.taskCount).toBe(0);
        });
    });

    describe('updateList', () => {
        let existingList: IList;

        beforeEach(async () => {
            existingList = await listService.createList({
                name: 'Original Name',
                description: 'Original description'
            });
        });

        it('should update list name', async () => {
            const updateData: IUpdateListRequest = {
                name: 'Updated Name'
            };

            const result = await listService.updateList(existingList.id, updateData);

            expect(result).toBeDefined();
            expect(result!.name).toBe(updateData.name);
            expect(result!.description).toBe(existingList.description);
            expect(result!.updatedAt).not.toEqual(existingList.updatedAt);
        });

        it('should update list description', async () => {
            const updateData: IUpdateListRequest = {
                description: 'Updated description'
            };

            const result = await listService.updateList(existingList.id, updateData);

            expect(result!.description).toBe(updateData.description);
            expect(result!.name).toBe(existingList.name);
        });

        it('should update both name and description', async () => {
            const updateData: IUpdateListRequest = {
                name: 'New Name',
                description: 'New description'
            };

            const result = await listService.updateList(existingList.id, updateData);

            expect(result!.name).toBe(updateData.name);
            expect(result!.description).toBe(updateData.description);
        });

        it('should return null for non-existent list', async () => {
            const result = await listService.updateList(
                '12345678-1234-4000-8000-123456789012',
                { name: 'New Name' }
            );
            expect(result).toBeNull();
        });

        it('should throw error for duplicate name', async () => {
            await listService.createList({ name: 'Another List' });

            await expect(listService.updateList(existingList.id, { name: 'Another List' }))
                .rejects
                .toThrow('List with name \'Another List\' already exists');
        });

        it('should allow updating to same name', async () => {
            const result = await listService.updateList(existingList.id, { name: existingList.name });
            expect(result).toBeDefined();
            expect(result!.name).toBe(existingList.name);
        });

        it('should throw error for invalid UUID', async () => {
            await expect(listService.updateList('invalid-uuid', { name: 'New Name' }))
                .rejects
                .toThrow('Invalid list ID:');
        });

        it('should throw validation error for empty update data', async () => {
            await expect(listService.updateList(existingList.id, {}))
                .rejects
                .toThrow('Validation error: At least one field must be provided for update');
        });

        it('should throw validation error for invalid name', async () => {
            await expect(listService.updateList(existingList.id, { name: '' }))
                .rejects
                .toThrow('Validation error: "name" is not allowed to be empty');
        });
    });

    describe('deleteList', () => {
        let existingList: IList;

        beforeEach(async () => {
            existingList = await listService.createList({ name: 'Test List' });
        });

        it('should delete an existing list', async () => {
            const result = await listService.deleteList(existingList.id);

            expect(result).toBe(true);

            const deletedList = await listService.getListById(existingList.id);
            expect(deletedList).toBeNull();
        });

        it('should return false for non-existent list', async () => {
            const result = await listService.deleteList('12345678-1234-4000-8000-123456789012');
            expect(result).toBe(false);
        });

        it('should cascade delete associated tasks', async () => {
            // Create a task in the list
            const task: Omit<ITask, 'id' | 'createdAt' | 'updatedAt'> = {
                listId: existingList.id,
                title: 'Test Task',
                completed: false
            };
            const createdTask = await taskRepository.create(task);

            // Verify task exists
            const tasksBeforeDelete = await taskRepository.findByListId(existingList.id);
            expect(tasksBeforeDelete).toHaveLength(1);

            // Delete the list
            const result = await listService.deleteList(existingList.id);
            expect(result).toBe(true);

            // Verify tasks are also deleted
            const tasksAfterDelete = await taskRepository.findByListId(existingList.id);
            expect(tasksAfterDelete).toHaveLength(0);

            // Verify the specific task is deleted
            const deletedTask = await taskRepository.findById(createdTask.id);
            expect(deletedTask).toBeNull();
        });

        it('should throw error for invalid UUID', async () => {
            await expect(listService.deleteList('invalid-uuid'))
                .rejects
                .toThrow('Invalid list ID:');
        });
    });

    describe('listExists', () => {
        it('should return true for existing list', async () => {
            const list = await listService.createList({ name: 'Test List' });

            const result = await listService.listExists(list.id);
            expect(result).toBe(true);
        });

        it('should return false for non-existent list', async () => {
            const result = await listService.listExists('12345678-1234-4000-8000-123456789012');
            expect(result).toBe(false);
        });

        it('should throw error for invalid UUID', async () => {
            await expect(listService.listExists('invalid-uuid'))
                .rejects
                .toThrow('Invalid list ID:');
        });
    });

    describe('isListNameAvailable', () => {
        beforeEach(async () => {
            await listService.createList({ name: 'Existing List' });
        });

        it('should return false for existing name', async () => {
            const result = await listService.isListNameAvailable('Existing List');
            expect(result).toBe(false);
        });

        it('should return true for available name', async () => {
            const result = await listService.isListNameAvailable('New List');
            expect(result).toBe(true);
        });

        it('should exclude specified ID from check', async () => {
            const list = await listService.createList({ name: 'Another List' });

            const result = await listService.isListNameAvailable('Another List', list.id);
            expect(result).toBe(true);
        });

        it('should throw error for invalid name', async () => {
            await expect(listService.isListNameAvailable(''))
                .rejects
                .toThrow('Invalid list name:');
        });

        it('should throw error for invalid exclude ID', async () => {
            await expect(listService.isListNameAvailable('Valid Name', 'invalid-uuid'))
                .rejects
                .toThrow('Invalid exclude ID:');
        });
    });

    describe('getListTaskCount', () => {
        let existingList: IList;

        beforeEach(async () => {
            existingList = await listService.createList({ name: 'Test List' });
        });

        it('should return 0 for list with no tasks', async () => {
            const result = await listService.getListTaskCount(existingList.id);
            expect(result).toBe(0);
        });

        it('should return correct task count after manually updating counts', async () => {
            // Add some tasks
            await taskRepository.create({
                listId: existingList.id,
                title: 'Task 1',
                completed: false
            });
            await taskRepository.create({
                listId: existingList.id,
                title: 'Task 2',
                completed: false
            });

            // Manually update the task count in list repository (this would be handled by TaskService in real usage)
            await listRepository.updateTaskCount(existingList.id, 2);

            const result = await listService.getListTaskCount(existingList.id);
            expect(result).toBe(2);
        });

        it('should throw error for non-existent list', async () => {
            await expect(listService.getListTaskCount('12345678-1234-4000-8000-123456789012'))
                .rejects
                .toThrow('List with ID \'12345678-1234-4000-8000-123456789012\' not found');
        });

        it('should throw error for invalid UUID', async () => {
            await expect(listService.getListTaskCount('invalid-uuid'))
                .rejects
                .toThrow('Invalid list ID:');
        });
    });

    describe('getAllListsWithTaskCounts', () => {
        it('should return empty array when no lists exist', async () => {
            const result = await listService.getAllListsWithTaskCounts();
            expect(result).toEqual([]);
        });

        it('should return all lists with task counts', async () => {
            const list1 = await listService.createList({ name: 'List 1' });
            const list2 = await listService.createList({ name: 'List 2' });

            // Add tasks to first list and manually update count
            await taskRepository.create({
                listId: list1.id,
                title: 'Task 1',
                completed: false
            });
            await listRepository.updateTaskCount(list1.id, 1);

            const result = await listService.getAllListsWithTaskCounts();

            expect(result).toHaveLength(2);
            expect(result.find(l => l.id === list1.id)?.taskCount).toBe(1);
            expect(result.find(l => l.id === list2.id)?.taskCount).toBe(0);
        });
    });

    describe('getListCount', () => {
        it('should return 0 when no lists exist', async () => {
            const result = await listService.getListCount();
            expect(result).toBe(0);
        });

        it('should return correct count of lists', async () => {
            await listService.createList({ name: 'List 1' });
            await listService.createList({ name: 'List 2' });
            await listService.createList({ name: 'List 3' });

            const result = await listService.getListCount();
            expect(result).toBe(3);
        });
    });

    describe('error handling', () => {
        it('should handle repository errors gracefully', async () => {
            // Mock repository to throw error
            const errorRepository = {
                ...listRepository,
                findAll: jest.fn().mockRejectedValue(new Error('Database connection failed'))
            } as any;

            const errorService = new ListService(errorRepository, taskRepository);

            await expect(errorService.getAllLists())
                .rejects
                .toThrow('Failed to retrieve lists: Database connection failed');
        });

        it('should handle unknown repository errors', async () => {
            const errorRepository = {
                ...listRepository,
                create: jest.fn().mockRejectedValue('Unknown error type')
            } as any;

            const errorService = new ListService(errorRepository, taskRepository);

            await expect(errorService.createList({ name: 'Test' }))
                .rejects
                .toThrow('Failed to create list: Unknown error');
        });
    });
});
