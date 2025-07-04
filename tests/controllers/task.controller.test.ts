import { Request, Response } from 'express';
import { TaskController } from '../../src/api/controllers/task.controller';
import { IList } from '../../src/models/interfaces/list.interface';
import { ICreateTaskRequest, IUpdateTaskRequest } from '../../src/models/interfaces/request.interface';
import { ITask } from '../../src/models/interfaces/task.interface';
import { MemoryListRepository } from '../../src/repositories/memory/memory-list.repository';
import { MemoryTaskRepository } from '../../src/repositories/memory/memory-task.repository';
import { TaskService } from '../../src/services/task.service';

describe('TaskController', () => {
    let taskController: TaskController;
    let taskService: TaskService;
    let taskRepository: MemoryTaskRepository;
    let listRepository: MemoryListRepository;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseData: any;
    let statusCode: number;

    // Test data
    let testList: IList;
    let testTask: ITask;

    beforeEach(async () => {
        // Setup repositories and services
        taskRepository = new MemoryTaskRepository();
        listRepository = new MemoryListRepository();
        taskService = new TaskService(taskRepository, listRepository);
        taskController = new TaskController(taskService);

        // Reset repositories
        await taskRepository.clear();
        await listRepository.clear();

        // Create test list
        testList = await listRepository.create({
            name: 'Test List',
            description: 'A test list for tasks'
        });

        // Setup mock response
        responseData = null;
        statusCode = 0;
        mockResponse = {
            status: jest.fn().mockImplementation((code) => {
                statusCode = code;
                return mockResponse;
            }),
            json: jest.fn().mockImplementation((data) => {
                responseData = data;
                return mockResponse;
            }),
            send: jest.fn().mockImplementation(() => {
                return mockResponse;
            })
        };
    });

    describe('createTask', () => {
        it('should create a new task successfully', async () => {
            // Arrange
            const createTaskData: ICreateTaskRequest = {
                title: 'Test Task',
                description: 'A test task description',
                deadline: new Date(Date.now() + 86400000) // Tomorrow
            };

            mockRequest = {
                params: { listId: testList.id },
                body: createTaskData
            };

            // Act
            await taskController.createTask(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(201);
            expect(responseData).toEqual({
                success: true,
                data: expect.objectContaining({
                    id: expect.any(String),
                    listId: testList.id,
                    title: 'Test Task',
                    description: 'A test task description',
                    completed: false,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                })
            });
        });

        it('should return 404 if list does not exist', async () => {
            // Arrange
            const nonExistentListId = '550e8400-e29b-41d4-a716-446655440000';
            const createTaskData: ICreateTaskRequest = {
                title: 'Test Task'
            };

            mockRequest = {
                params: { listId: nonExistentListId },
                body: createTaskData
            };

            // Act
            await taskController.createTask(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(404);
            expect(responseData).toEqual({
                success: false,
                error: {
                    message: 'List not found',
                    code: 'LIST_NOT_FOUND',
                    timestamp: expect.any(String)
                }
            });
        });

        it('should return 400 for invalid task data', async () => {
            // Arrange
            const invalidTaskData = {
                title: '', // Invalid: empty title
                description: 'A test task description'
            };

            mockRequest = {
                params: { listId: testList.id },
                body: invalidTaskData
            };

            // Act
            await taskController.createTask(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(400);
            expect(responseData).toEqual({
                success: false,
                error: {
                    message: expect.stringContaining('Validation error'),
                    code: 'VALIDATION_ERROR',
                    timestamp: expect.any(String)
                }
            });
        });
    });

    describe('getTasksByListId', () => {
        beforeEach(async () => {
            // Create test tasks
            testTask = await taskRepository.create({
                listId: testList.id,
                title: 'Test Task 1',
                description: 'First test task',
                completed: false
            });

            await taskRepository.create({
                listId: testList.id,
                title: 'Test Task 2',
                description: 'Second test task',
                completed: false
            });
        });

        it('should return all tasks for a list', async () => {
            // Arrange
            mockRequest = {
                params: { listId: testList.id },
                query: {}
            };

            // Act
            await taskController.getTasksByListId(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(200);
            expect(responseData).toEqual({
                success: true,
                data: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        listId: testList.id,
                        title: expect.any(String)
                    })
                ])
            });
            expect(responseData.data).toHaveLength(2);
        });

        it('should filter out completed tasks when includeCompleted=false', async () => {
            // Arrange
            await taskService.toggleTaskCompletion(testTask.id); // Mark first task as completed

            mockRequest = {
                params: { listId: testList.id },
                query: { includeCompleted: 'false' }
            };

            // Act
            await taskController.getTasksByListId(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(200);
            expect(responseData.data).toHaveLength(1);
            expect(responseData.data[0].completed).toBe(false);
        });

        it('should return 404 for non-existent list', async () => {
            // Arrange
            const nonExistentListId = '550e8400-e29b-41d4-a716-446655440000';
            mockRequest = {
                params: { listId: nonExistentListId },
                query: {}
            };

            // Act
            await taskController.getTasksByListId(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(404);
            expect(responseData).toEqual({
                success: false,
                error: {
                    message: 'List not found',
                    code: 'LIST_NOT_FOUND',
                    timestamp: expect.any(String)
                }
            });
        });
    });

    describe('getAllTasks', () => {
        beforeEach(async () => {
            // Create test tasks
            await taskRepository.create({
                listId: testList.id,
                title: 'Test Task 1',
                description: 'First test task',
                completed: false
            });

            await taskRepository.create({
                listId: testList.id,
                title: 'Test Task 2',
                description: 'Second test task',
                completed: false
            });
        });

        it('should return all tasks', async () => {
            // Arrange
            mockRequest = {
                query: {}
            };

            // Act
            await taskController.getAllTasks(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(200);
            expect(responseData).toEqual({
                success: true,
                data: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        title: expect.any(String)
                    })
                ])
            });
            expect(responseData.data).toHaveLength(2);
        });

        it('should filter tasks by listId when provided', async () => {
            // Arrange
            const anotherList = await listRepository.create({
                name: 'Another List'
            });

            await taskRepository.create({
                listId: anotherList.id,
                title: 'Another Task',
                completed: false
            });

            mockRequest = {
                query: { listId: testList.id }
            };

            // Act
            await taskController.getAllTasks(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(200);
            expect(responseData.data).toHaveLength(2);
            expect(responseData.data.every((task: ITask) => task.listId === testList.id)).toBe(true);
        });
    });

    describe('updateTask', () => {
        beforeEach(async () => {
            testTask = await taskRepository.create({
                listId: testList.id,
                title: 'Original Task',
                description: 'Original description',
                completed: false
            });
        });

        it('should update task successfully', async () => {
            // Arrange
            const updateData: IUpdateTaskRequest = {
                title: 'Updated Task Title',
                description: 'Updated description'
            };

            mockRequest = {
                params: { taskId: testTask.id },
                body: updateData
            };

            // Act
            await taskController.updateTask(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(200);
            expect(responseData).toEqual({
                success: true,
                data: expect.objectContaining({
                    id: testTask.id,
                    title: 'Updated Task Title',
                    description: 'Updated description',
                    updatedAt: expect.any(Date)
                })
            });
        });

        it('should return 404 for non-existent task', async () => {
            // Arrange
            const nonExistentTaskId = '550e8400-e29b-41d4-a716-446655440000';
            const updateData: IUpdateTaskRequest = {
                title: 'Updated Title'
            };

            mockRequest = {
                params: { taskId: nonExistentTaskId },
                body: updateData
            };

            // Act
            await taskController.updateTask(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(404);
            expect(responseData).toEqual({
                success: false,
                error: {
                    message: 'Task not found',
                    code: 'TASK_NOT_FOUND',
                    timestamp: expect.any(String)
                }
            });
        });

        it('should return 400 for invalid update data', async () => {
            // Arrange
            const invalidUpdateData = {
                title: '', // Invalid: empty title
            };

            mockRequest = {
                params: { taskId: testTask.id },
                body: invalidUpdateData
            };

            // Act
            await taskController.updateTask(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(400);
            expect(responseData).toEqual({
                success: false,
                error: {
                    message: expect.stringContaining('Validation error'),
                    code: 'VALIDATION_ERROR',
                    timestamp: expect.any(String)
                }
            });
        });
    });

    describe('deleteTask', () => {
        beforeEach(async () => {
            testTask = await taskRepository.create({
                listId: testList.id,
                title: 'Task to Delete',
                completed: false
            });
        });

        it('should delete task successfully', async () => {
            // Arrange
            mockRequest = {
                params: { taskId: testTask.id }
            };

            // Act
            await taskController.deleteTask(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(204);
            expect(mockResponse.send).toHaveBeenCalled();
        });

        it('should return 404 for non-existent task', async () => {
            // Arrange
            const nonExistentTaskId = '550e8400-e29b-41d4-a716-446655440000';
            mockRequest = {
                params: { taskId: nonExistentTaskId }
            };

            // Act
            await taskController.deleteTask(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(404);
            expect(responseData).toEqual({
                success: false,
                error: {
                    message: 'Task not found',
                    code: 'TASK_NOT_FOUND',
                    timestamp: expect.any(String)
                }
            });
        });
    });

    describe('toggleTaskCompletion', () => {
        beforeEach(async () => {
            testTask = await taskRepository.create({
                listId: testList.id,
                title: 'Task to Toggle',
                completed: false
            });
        });

        it('should toggle task completion from false to true', async () => {
            // Arrange
            mockRequest = {
                params: { taskId: testTask.id }
            };

            // Act
            await taskController.toggleTaskCompletion(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(200);
            expect(responseData).toEqual({
                success: true,
                data: expect.objectContaining({
                    id: testTask.id,
                    completed: true,
                    completedAt: expect.any(Date)
                })
            });
        });

        it('should toggle task completion from true to false', async () => {
            // Arrange
            await taskService.toggleTaskCompletion(testTask.id); // Mark as completed first
            mockRequest = {
                params: { taskId: testTask.id }
            };

            // Act
            await taskController.toggleTaskCompletion(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(200);
            expect(responseData).toEqual({
                success: true,
                data: expect.objectContaining({
                    id: testTask.id,
                    completed: false
                })
            });
            expect(responseData.data.completedAt).toBeNull();
        });

        it('should return 404 for non-existent task', async () => {
            // Arrange
            const nonExistentTaskId = '550e8400-e29b-41d4-a716-446655440000';
            mockRequest = {
                params: { taskId: nonExistentTaskId }
            };

            // Act
            await taskController.toggleTaskCompletion(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(404);
            expect(responseData).toEqual({
                success: false,
                error: {
                    message: 'Task not found',
                    code: 'TASK_NOT_FOUND',
                    timestamp: expect.any(String)
                }
            });
        });
    });

    describe('getTasksDueThisWeek', () => {
        beforeEach(async () => {
            const today = new Date();
            const tomorrow = new Date(today.getTime() + 86400000);
            const nextWeek = new Date(today.getTime() + 8 * 86400000);

            // Create task due tomorrow (within this week)
            await taskRepository.create({
                listId: testList.id,
                title: 'Task Due Tomorrow',
                deadline: tomorrow,
                completed: false
            });

            // Create task due next week (outside this week)
            await taskRepository.create({
                listId: testList.id,
                title: 'Task Due Next Week',
                deadline: nextWeek,
                completed: false
            });

            // Create task without deadline
            await taskRepository.create({
                listId: testList.id,
                title: 'Task Without Deadline',
                completed: false
            });
        });

        it('should return only tasks due this week', async () => {
            // Arrange
            mockRequest = {
                query: {}
            };

            // Act
            await taskController.getTasksDueThisWeek(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(200);
            expect(responseData).toEqual({
                success: true,
                data: expect.arrayContaining([
                    expect.objectContaining({
                        title: 'Task Due Tomorrow',
                        deadline: expect.any(Date)
                    })
                ])
            });
            expect(responseData.data).toHaveLength(1);
        });

        it('should filter by listId when provided', async () => {
            // Arrange
            const anotherList = await listRepository.create({
                name: 'Another List'
            });

            const tomorrow = new Date(Date.now() + 86400000);
            await taskRepository.create({
                listId: anotherList.id,
                title: 'Another Task Due Tomorrow',
                deadline: tomorrow,
                completed: false
            });

            mockRequest = {
                query: { listId: testList.id }
            };

            // Act
            await taskController.getTasksDueThisWeek(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(200);
            expect(responseData.data).toHaveLength(1);
            expect(responseData.data[0].listId).toBe(testList.id);
        });

        it('should exclude completed tasks by default', async () => {
            // Arrange
            const tasksDueThisWeek = await taskService.getTasksDueThisWeek();
            if (tasksDueThisWeek.length > 0) {
                await taskService.toggleTaskCompletion(tasksDueThisWeek[0].id);
            }

            mockRequest = {
                query: {}
            };

            // Act
            await taskController.getTasksDueThisWeek(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(200);
            expect(responseData.data.every((task: ITask) => !task.completed)).toBe(true);
        });
    });

    describe('handleError', () => {
        it('should handle validation errors correctly', async () => {
            // Arrange
            const invalidTaskData = {
                title: '' // Invalid: empty title
            };

            mockRequest = {
                params: { listId: testList.id },
                body: invalidTaskData
            };

            // Act
            await taskController.createTask(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(400);
            expect(responseData.error.code).toBe('VALIDATION_ERROR');
        });

        it('should handle generic server errors', async () => {
            // Arrange
            jest.spyOn(taskService, 'createTask').mockRejectedValue(new Error('Database connection failed'));

            const validTaskData: ICreateTaskRequest = {
                title: 'Test Task'
            };

            mockRequest = {
                params: { listId: testList.id },
                body: validTaskData
            };

            // Act
            await taskController.createTask(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(statusCode).toBe(500);
            expect(responseData).toEqual({
                success: false,
                error: {
                    message: 'Internal server error',
                    code: 'INTERNAL_ERROR',
                    timestamp: expect.any(String)
                }
            });
        });
    });
});
