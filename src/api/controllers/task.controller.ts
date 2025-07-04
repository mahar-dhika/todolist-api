import { Request, Response } from 'express';
import { IApiResponse } from '../../models/interfaces/api.interface';
import { ITaskQuery, IUpdateTaskRequest } from '../../models/interfaces/request.interface';
import { ITask } from '../../models/interfaces/task.interface';
import { TaskService } from '../../services/task.service';

/**
 * Task Controller
 * 
 * Handles all HTTP requests related to task operations including:
 * - Creating new tasks within lists
 * - Retrieving tasks with filtering and sorting options
 * - Updating existing tasks
 * - Deleting tasks
 * - Toggling task completion status
 * - Querying tasks due this week
 * - Proper HTTP status codes and error handling
 */
export class TaskController {
    private readonly taskService: TaskService;

    /**
     * Constructor with dependency injection
     * @param taskService - Service for task business logic operations
     */
    constructor(taskService: TaskService) {
        this.taskService = taskService;
    }

    /**
     * @swagger
     * /api/lists/{listId}/tasks:
     *   post:
     *     summary: Create a new task in a list
     *     description: Creates a new task within the specified list
     *     tags: [Tasks]
     *     parameters:
     *       - in: path
     *         name: listId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID of the list to add the task to
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *             properties:
     *               title:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 200
     *                 description: Title of the task
     *               description:
     *                 type: string
     *                 maxLength: 1000
     *                 description: Optional description of the task
     *               deadline:
     *                 type: string
     *                 format: date-time
     *                 description: Optional deadline for the task (future date)
     *     responses:
     *       201:
     *         description: Task created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Task'
     *       400:
     *         description: Invalid request data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     *       404:
     *         description: List not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     */
    async createTask(req: Request, res: Response): Promise<void> {
        try {
            // Get listId from params (for /lists/:listId/tasks route) or from body (for /tasks route)
            const listId = req.params.listId || (req.body as any).listId;
            if (!listId) {
                const response: IApiResponse<null> = {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'List ID is required either in URL params or request body',
                        timestamp: new Date().toISOString()
                    }
                };
                res.status(400).json(response);
                return;
            }

            // Remove listId from task data if it exists since service expects it separately
            const { listId: bodyListId, ...taskData } = req.body as any;

            const newTask = await this.taskService.createTask(listId, taskData);

            const response: IApiResponse<ITask> = {
                success: true,
                data: newTask
            };

            res.status(201).json(response);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * @swagger
     * /api/lists/{listId}/tasks:
     *   get:
     *     summary: Get all tasks for a specific list
     *     description: Retrieves all tasks belonging to the specified list with optional filtering and sorting
     *     tags: [Tasks]
     *     parameters:
     *       - in: path
     *         name: listId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID of the list to get tasks from
     *       - in: query
     *         name: includeCompleted
     *         schema:
     *           type: boolean
     *           default: true
     *         description: Whether to include completed tasks
     *       - in: query
     *         name: sortBy
     *         schema:
     *           type: string
     *           enum: [title, deadline, createdAt, updatedAt]
     *           default: createdAt
     *         description: Field to sort tasks by
     *       - in: query
     *         name: sortOrder
     *         schema:
     *           type: string
     *           enum: [asc, desc]
     *           default: desc
     *         description: Sort order direction
     *     responses:
     *       200:
     *         description: Successfully retrieved tasks
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Task'
     *       400:
     *         description: Invalid query parameters
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     *       404:
     *         description: List not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     */
    async getTasksByListId(req: Request, res: Response): Promise<void> {
        try {
            const { listId } = req.params;
            const query: Omit<ITaskQuery, 'listId'> = {
                includeCompleted: req.query.includeCompleted === 'false' ? false : true,
                sortBy: req.query.sortBy as any,
                order: req.query.sortOrder as any
            };

            const tasks = await this.taskService.getTasksByListId(listId, query);

            const response: IApiResponse<ITask[]> = {
                success: true,
                data: tasks
            };

            res.status(200).json(response);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * @swagger
     * /api/tasks:
     *   get:
     *     summary: Get all tasks
     *     description: Retrieves all tasks with optional filtering and sorting
     *     tags: [Tasks]
     *     parameters:
     *       - in: query
     *         name: listId
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Filter tasks by list ID
     *       - in: query
     *         name: includeCompleted
     *         schema:
     *           type: boolean
     *           default: true
     *         description: Whether to include completed tasks
     *       - in: query
     *         name: sortBy
     *         schema:
     *           type: string
     *           enum: [title, deadline, createdAt, updatedAt]
     *           default: createdAt
     *         description: Field to sort tasks by
     *       - in: query
     *         name: sortOrder
     *         schema:
     *           type: string
     *           enum: [asc, desc]
     *           default: desc
     *         description: Sort order direction
     *     responses:
     *       200:
     *         description: Successfully retrieved all tasks
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Task'
     *       400:
     *         description: Invalid query parameters
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     */
    async getAllTasks(req: Request, res: Response): Promise<void> {
        try {
            const query: ITaskQuery = {
                listId: req.query.listId as string,
                includeCompleted: req.query.includeCompleted === 'false' ? false : true,
                sortBy: req.query.sortBy as any,
                order: req.query.sortOrder as any
            };

            const tasks = await this.taskService.getAllTasks(query);

            const response: IApiResponse<ITask[]> = {
                success: true,
                data: tasks
            };

            res.status(200).json(response);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * @swagger
     * /api/tasks/{taskId}:
     *   put:
     *     summary: Update a task
     *     description: Updates an existing task with new data
     *     tags: [Tasks]
     *     parameters:
     *       - in: path
     *         name: taskId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID of the task to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 200
     *                 description: Updated title of the task
     *               description:
     *                 type: string
     *                 maxLength: 1000
     *                 description: Updated description of the task
     *               deadline:
     *                 type: string
     *                 format: date-time
     *                 description: Updated deadline for the task
     *               completed:
     *                 type: boolean
     *                 description: Updated completion status
     *     responses:
     *       200:
     *         description: Task updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Task'
     *       400:
     *         description: Invalid request data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     *       404:
     *         description: Task not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     */
    async updateTask(req: Request, res: Response): Promise<void> {
        try {
            const { taskId } = req.params;
            const updateData: IUpdateTaskRequest = req.body;

            const updatedTask = await this.taskService.updateTask(taskId, updateData);

            if (!updatedTask) {
                const response: IApiResponse<null> = {
                    success: false,
                    error: {
                        message: 'Task not found',
                        code: 'TASK_NOT_FOUND',
                        timestamp: new Date().toISOString()
                    }
                };
                res.status(404).json(response);
                return;
            }

            const response: IApiResponse<ITask> = {
                success: true,
                data: updatedTask
            };

            res.status(200).json(response);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * @swagger
     * /api/tasks/{taskId}:
     *   delete:
     *     summary: Delete a task
     *     description: Deletes an existing task
     *     tags: [Tasks]
     *     parameters:
     *       - in: path
     *         name: taskId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID of the task to delete
     *     responses:
     *       204:
     *         description: Task deleted successfully
     *       404:
     *         description: Task not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     */
    async deleteTask(req: Request, res: Response): Promise<void> {
        try {
            const { taskId } = req.params;

            const deleted = await this.taskService.deleteTask(taskId);

            if (!deleted) {
                const response: IApiResponse<null> = {
                    success: false,
                    error: {
                        message: 'Task not found',
                        code: 'TASK_NOT_FOUND',
                        timestamp: new Date().toISOString()
                    }
                };
                res.status(404).json(response);
                return;
            }

            res.status(204).send();
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * @swagger
     * /api/tasks/{taskId}/toggle-completion:
     *   patch:
     *     summary: Toggle task completion status
     *     description: Toggles the completion status of a task (completed <-> incomplete)
     *     tags: [Tasks]
     *     parameters:
     *       - in: path
     *         name: taskId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID of the task to toggle
     *     responses:
     *       200:
     *         description: Task completion status toggled successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Task'
     *       404:
     *         description: Task not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     */
    async toggleTaskCompletion(req: Request, res: Response): Promise<void> {
        try {
            const { taskId } = req.params;

            const updatedTask = await this.taskService.toggleTaskCompletion(taskId);

            if (!updatedTask) {
                const response: IApiResponse<null> = {
                    success: false,
                    error: {
                        message: 'Task not found',
                        code: 'TASK_NOT_FOUND',
                        timestamp: new Date().toISOString()
                    }
                };
                res.status(404).json(response);
                return;
            }

            const response: IApiResponse<ITask> = {
                success: true,
                data: updatedTask
            };

            res.status(200).json(response);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * @swagger
     * /api/tasks/due-this-week:
     *   get:
     *     summary: Get tasks due this week
     *     description: Retrieves all tasks that have deadlines within the current week (Monday to Sunday)
     *     tags: [Tasks]
     *     parameters:
     *       - in: query
     *         name: listId
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Filter tasks by list ID
     *       - in: query
     *         name: includeCompleted
     *         schema:
     *           type: boolean
     *           default: false
     *         description: Whether to include completed tasks
     *       - in: query
     *         name: sortBy
     *         schema:
     *           type: string
     *           enum: [title, deadline, createdAt, updatedAt]
     *           default: deadline
     *         description: Field to sort tasks by
     *       - in: query
     *         name: sortOrder
     *         schema:
     *           type: string
     *           enum: [asc, desc]
     *           default: asc
     *         description: Sort order direction
     *     responses:
     *       200:
     *         description: Successfully retrieved tasks due this week
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Task'
     *       400:
     *         description: Invalid query parameters
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     */
    async getTasksDueThisWeek(req: Request, res: Response): Promise<void> {
        try {
            const query: Omit<ITaskQuery, 'deadlineFrom' | 'deadlineTo'> = {
                listId: req.query.listId as string,
                includeCompleted: req.query.includeCompleted === 'true' ? true : false,
                sortBy: req.query.sortBy as any || 'deadline',
                order: req.query.sortOrder as any || 'asc'
            };

            const tasks = await this.taskService.getTasksDueThisWeek(query);

            const response: IApiResponse<ITask[]> = {
                success: true,
                data: tasks
            };

            res.status(200).json(response);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * Handles errors and sends appropriate HTTP responses
     * @param res - Express response object
     * @param error - Error that occurred
     */
    private handleError(res: Response, error: any): void {
        console.error('TaskController Error:', error);

        if (error.message?.includes('Validation error')) {
            const response: IApiResponse<null> = {
                success: false,
                error: {
                    message: error.message,
                    code: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString()
                }
            };
            res.status(400).json(response);
            return;
        }

        if (error.message?.includes('List not found') || error.message?.includes('does not exist') || error.message?.includes('not found')) {
            const response: IApiResponse<null> = {
                success: false,
                error: {
                    message: 'List not found',
                    code: 'LIST_NOT_FOUND',
                    timestamp: new Date().toISOString()
                }
            };
            res.status(404).json(response);
            return;
        }

        if (error.message?.includes('Task not found')) {
            const response: IApiResponse<null> = {
                success: false,
                error: {
                    message: 'Task not found',
                    code: 'TASK_NOT_FOUND',
                    timestamp: new Date().toISOString()
                }
            };
            res.status(404).json(response);
            return;
        }

        // Generic server error
        const response: IApiResponse<null> = {
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString()
            }
        };
        res.status(500).json(response);
    }
}
