import { Request, Response } from 'express';
import { ListController } from '../../src/api/controllers/list.controller';
import { ICreateListRequest, IUpdateListRequest } from '../../src/models/interfaces/request.interface';
import { MemoryListRepository } from '../../src/repositories/memory/memory-list.repository';
import { MemoryTaskRepository } from '../../src/repositories/memory/memory-task.repository';
import { ListService } from '../../src/services/list.service';

// Mock Express Request and Response objects
const mockRequest = (body?: any, params?: any, query?: any): Partial<Request> => ({
    body: body || {},
    params: params || {},
    query: query || {}
});

const mockResponse = (): Partial<Response> => {
    const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis()
    };
    return res;
};

describe('ListController Integration Tests', () => {
    let listController: ListController;
    let listService: ListService;
    let listRepository: MemoryListRepository;
    let taskRepository: MemoryTaskRepository;

    beforeEach(() => {
        // Create fresh repositories for each test
        listRepository = new MemoryListRepository();
        taskRepository = new MemoryTaskRepository();

        // Create service with repositories
        listService = new ListService(listRepository, taskRepository);

        // Create controller with service
        listController = new ListController(listService);
    });

    describe('getAllLists', () => {
        it('should return all lists successfully', async () => {
            // Arrange
            const req = mockRequest(undefined, undefined, {}) as Request;
            const res = mockResponse() as Response;

            // Create some test data
            await listRepository.create({ name: 'Test List 1', description: 'Description 1' });
            await listRepository.create({ name: 'Test List 2', description: 'Description 2' });

            // Act
            await listController.getAllLists(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.arrayContaining([
                        expect.objectContaining({ name: 'Test List 1' }),
                        expect.objectContaining({ name: 'Test List 2' })
                    ]),
                    meta: expect.objectContaining({
                        count: 2
                    })
                })
            );
        });
    });

    describe('createList', () => {
        it('should create a new list successfully', async () => {
            // Arrange
            const createListData: ICreateListRequest = {
                name: 'New Test List',
                description: 'Test Description'
            };
            const req = mockRequest(createListData) as Request;
            const res = mockResponse() as Response;

            // Act
            await listController.createList(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        name: 'New Test List',
                        description: 'Test Description',
                        id: expect.any(String)
                    })
                })
            );
        });

        it('should return 422 for validation errors', async () => {
            // Arrange
            const invalidData = {
                name: '', // Invalid: empty name
                description: 'Valid description'
            };
            const req = mockRequest(invalidData) as Request;
            const res = mockResponse() as Response;

            // Act
            await listController.createList(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'VALIDATION_ERROR'
                    })
                })
            );
        });

        it('should return 400 for duplicate list names', async () => {
            // Arrange
            const listData: ICreateListRequest = {
                name: 'Duplicate List',
                description: 'First list'
            };

            // Create first list
            await listRepository.create(listData);

            // Try to create second list with same name
            const req = mockRequest(listData) as Request;
            const res = mockResponse() as Response;

            // Act
            await listController.createList(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'DUPLICATE_LIST_NAME'
                    })
                })
            );
        });
    });

    describe('getListById', () => {
        it('should return a list by ID successfully', async () => {
            // Arrange
            const createdList = await listRepository.create({
                name: 'Test List',
                description: 'Test Description'
            });

            const req = mockRequest(undefined, { id: createdList.id }) as Request;
            const res = mockResponse() as Response;

            // Act
            await listController.getListById(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        id: createdList.id,
                        name: 'Test List'
                    })
                })
            );
        });

        it('should return 404 for non-existent list', async () => {
            // Arrange
            const nonExistentId = '1f3936eb-6fc9-4e05-bf75-7ced254ab6e9'; // Valid UUID format  
            const req = mockRequest(undefined, { id: nonExistentId }) as Request;
            const res = mockResponse() as Response;

            // Act
            await listController.getListById(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'LIST_NOT_FOUND'
                    })
                })
            );
        });

        it('should return 400 for invalid UUID format', async () => {
            // Arrange
            const invalidId = 'invalid-uuid';
            const req = mockRequest(undefined, { id: invalidId }) as Request;
            const res = mockResponse() as Response;

            // Act
            await listController.getListById(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'INVALID_LIST_ID'
                    })
                })
            );
        });
    });

    describe('updateList', () => {
        it('should update a list successfully', async () => {
            // Arrange
            const createdList = await listRepository.create({
                name: 'Original Name',
                description: 'Original Description'
            });

            const updateData: IUpdateListRequest = {
                name: 'Updated Name',
                description: 'Updated Description'
            };

            const req = mockRequest(updateData, { id: createdList.id }) as Request;
            const res = mockResponse() as Response;

            // Act
            await listController.updateList(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        id: createdList.id,
                        name: 'Updated Name',
                        description: 'Updated Description'
                    })
                })
            );
        });

        it('should return 404 for non-existent list', async () => {
            // Arrange
            const nonExistentId = '2f3936eb-6fc9-4e05-bf75-7ced254ab6e9'; // Valid UUID format
            const updateData: IUpdateListRequest = { name: 'Updated Name' };
            const req = mockRequest(updateData, { id: nonExistentId }) as Request;
            const res = mockResponse() as Response;

            // Act
            await listController.updateList(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'LIST_NOT_FOUND'
                    })
                })
            );
        });
    });

    describe('deleteList', () => {
        it('should delete a list successfully', async () => {
            // Arrange
            const createdList = await listRepository.create({
                name: 'List to Delete',
                description: 'Will be deleted'
            });

            const req = mockRequest(undefined, { id: createdList.id }) as Request;
            const res = mockResponse() as Response;

            // Act
            await listController.deleteList(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('should return 404 for non-existent list', async () => {
            // Arrange
            const nonExistentId = '3f3936eb-6fc9-4e05-bf75-7ced254ab6e9'; // Valid UUID format
            const req = mockRequest(undefined, { id: nonExistentId }) as Request;
            const res = mockResponse() as Response;

            // Act
            await listController.deleteList(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'LIST_NOT_FOUND'
                    })
                })
            );
        });
    });
});
