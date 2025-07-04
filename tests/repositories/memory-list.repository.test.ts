import { MemoryListRepository } from '../../src/repositories/memory/memory-list.repository';

describe('MemoryListRepository', () => {
    let repository: MemoryListRepository;

    beforeEach(() => {
        repository = new MemoryListRepository();
    });

    describe('create', () => {
        it('should create a new list with generated ID and timestamps', async () => {
            const listData = {
                name: 'Test List',
                description: 'Test Description'
            };

            const result = await repository.create(listData);

            expect(result.id).toBeDefined();
            expect(result.name).toBe(listData.name);
            expect(result.description).toBe(listData.description);
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.updatedAt).toBeInstanceOf(Date);
            expect(result.taskCount).toBe(0);
        });

        it('should create a list without description', async () => {
            const listData = {
                name: 'Test List'
            };

            const result = await repository.create(listData);

            expect(result.name).toBe(listData.name);
            expect(result.description).toBeUndefined();
        });

        it('should throw error when creating list with duplicate name', async () => {
            const listData = {
                name: 'Duplicate List',
                description: 'First list'
            };

            await repository.create(listData);

            await expect(repository.create({
                name: 'Duplicate List',
                description: 'Second list'
            })).rejects.toThrow("List with name 'Duplicate List' already exists");
        });
    });

    describe('findAll', () => {
        it('should return empty array when no lists exist', async () => {
            const result = await repository.findAll();
            expect(result).toEqual([]);
        });

        it('should return all lists', async () => {
            await repository.create({ name: 'List 1' });
            await repository.create({ name: 'List 2' });

            const result = await repository.findAll();
            expect(result).toHaveLength(2);
        });

        it('should include task counts when requested', async () => {
            const list = await repository.create({ name: 'Test List' });
            await repository.updateTaskCount(list.id, 5);

            const result = await repository.findAll(true);
            expect(result[0].taskCount).toBe(5);
        });
    });

    describe('findById', () => {
        it('should return null for non-existent list', async () => {
            const result = await repository.findById('non-existent-id');
            expect(result).toBeNull();
        });

        it('should return list by ID', async () => {
            const created = await repository.create({ name: 'Test List' });
            const result = await repository.findById(created.id);

            expect(result).not.toBeNull();
            expect(result!.id).toBe(created.id);
            expect(result!.name).toBe('Test List');
        });

        it('should include task count when requested', async () => {
            const list = await repository.create({ name: 'Test List' });
            await repository.updateTaskCount(list.id, 3);

            const result = await repository.findById(list.id, true);
            expect(result!.taskCount).toBe(3);
        });
    });

    describe('findByName', () => {
        it('should return null for non-existent name', async () => {
            const result = await repository.findByName('Non-existent List');
            expect(result).toBeNull();
        });

        it('should return list by name', async () => {
            await repository.create({ name: 'Unique List Name' });
            const result = await repository.findByName('Unique List Name');

            expect(result).not.toBeNull();
            expect(result!.name).toBe('Unique List Name');
        });
    });

    describe('update', () => {
        it('should return null for non-existent list', async () => {
            const result = await repository.update('non-existent-id', { name: 'New Name' });
            expect(result).toBeNull();
        });

        it('should update list properties', async () => {
            const created = await repository.create({ name: 'Original Name' });

            // Add a small delay to ensure updatedAt is different
            await new Promise(resolve => setTimeout(resolve, 1));

            const updateData = {
                name: 'Updated Name',
                description: 'Updated Description'
            };

            const result = await repository.update(created.id, updateData);

            expect(result).not.toBeNull();
            expect(result!.name).toBe('Updated Name');
            expect(result!.description).toBe('Updated Description');
            expect(result!.updatedAt.getTime()).toBeGreaterThan(result!.createdAt.getTime());
        });

        it('should throw error when updating to duplicate name', async () => {
            await repository.create({ name: 'List 1' });
            const list2 = await repository.create({ name: 'List 2' });

            await expect(repository.update(list2.id, { name: 'List 1' }))
                .rejects.toThrow("List with name 'List 1' already exists");
        });

        it('should preserve ID and createdAt', async () => {
            const created = await repository.create({ name: 'Test List' });
            const originalCreatedAt = created.createdAt;

            const result = await repository.update(created.id, { name: 'Updated Name' });

            expect(result!.id).toBe(created.id);
            expect(result!.createdAt).toEqual(originalCreatedAt);
        });
    });

    describe('delete', () => {
        it('should return false for non-existent list', async () => {
            const result = await repository.delete('non-existent-id');
            expect(result).toBe(false);
        });

        it('should delete existing list', async () => {
            const created = await repository.create({ name: 'Test List' });
            const result = await repository.delete(created.id);

            expect(result).toBe(true);

            const found = await repository.findById(created.id);
            expect(found).toBeNull();
        });

        it('should throw error when deleting list with tasks', async () => {
            const created = await repository.create({ name: 'Test List' });
            await repository.updateTaskCount(created.id, 2);

            await expect(repository.delete(created.id))
                .rejects.toThrow('Cannot delete list that contains tasks. Delete tasks first.');
        });
    });

    describe('exists', () => {
        it('should return false for non-existent list', async () => {
            const result = await repository.exists('non-existent-id');
            expect(result).toBe(false);
        });

        it('should return true for existing list', async () => {
            const created = await repository.create({ name: 'Test List' });
            const result = await repository.exists(created.id);
            expect(result).toBe(true);
        });
    });

    describe('nameExists', () => {
        it('should return false for non-existent name', async () => {
            const result = await repository.nameExists('Non-existent List');
            expect(result).toBe(false);
        });

        it('should return true for existing name', async () => {
            await repository.create({ name: 'Existing List' });
            const result = await repository.nameExists('Existing List');
            expect(result).toBe(true);
        });

        it('should exclude specified ID when checking', async () => {
            const created = await repository.create({ name: 'Test List' });
            const result = await repository.nameExists('Test List', created.id);
            expect(result).toBe(false);
        });
    });

    describe('task count operations', () => {
        it('should get task count for list', async () => {
            const created = await repository.create({ name: 'Test List' });
            await repository.updateTaskCount(created.id, 5);

            const count = await repository.getTaskCount(created.id);
            expect(count).toBe(5);
        });

        it('should return 0 for list with no tasks', async () => {
            const created = await repository.create({ name: 'Test List' });
            const count = await repository.getTaskCount(created.id);
            expect(count).toBe(0);
        });

        it('should not allow negative task counts', async () => {
            const created = await repository.create({ name: 'Test List' });
            await repository.updateTaskCount(created.id, -5);

            const count = await repository.getTaskCount(created.id);
            expect(count).toBe(0);
        });
    });

    describe('utility methods', () => {
        it('should clear all lists', async () => {
            await repository.create({ name: 'List 1' });
            await repository.create({ name: 'List 2' });

            await repository.clear();

            const count = await repository.count();
            expect(count).toBe(0);
        });

        it('should count total lists', async () => {
            await repository.create({ name: 'List 1' });
            await repository.create({ name: 'List 2' });

            const count = await repository.count();
            expect(count).toBe(2);
        });

        it('should seed sample data', async () => {
            await repository.seedData();

            const lists = await repository.findAll();
            expect(lists.length).toBeGreaterThan(0);
            expect(lists.some(list => list.name === 'Personal Tasks')).toBe(true);
        });
    });
});
