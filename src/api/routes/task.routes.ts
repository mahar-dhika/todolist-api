/**
 * Task API Routes
 * 
 * This module defines all routes for task-related operations including:
 * - POST /tasks - Create a new task
 * - GET /tasks - Get all tasks with filters
 * - GET /tasks/due-this-week - Get tasks due this week
 * - GET /lists/:listId/tasks - Get tasks for a specific list
 * - PUT /tasks/:id - Update a specific task
 * - DELETE /tasks/:id - Delete a specific task
 * - PATCH /tasks/:id/toggle - Toggle task completion status
 * 
 * All routes include proper parameter validation and error handling.
 */

import { Router } from 'express';
import Joi from 'joi';
import { MemoryListRepository } from '../../repositories/memory/memory-list.repository';
import { MemoryTaskRepository } from '../../repositories/memory/memory-task.repository';
import { TaskService } from '../../services/task.service';
import { ValidationService } from '../../services/validation.service';
import { TaskController } from '../controllers/task.controller';
import { validateBody, validateQuery, validateUuidParam } from '../middleware/validation.middleware';

/**
 * Create and configure task routes with dependency injection
 * @returns Configured Express router for task operations
 */
export function createTaskRoutes(): Router {
    const router = Router();

    // Initialize dependencies
    const taskRepository = new MemoryTaskRepository();
    const listRepository = new MemoryListRepository();
    const taskService = new TaskService(taskRepository, listRepository);
    const taskController = new TaskController(taskService);

    // Query validation schemas
    const taskQuerySchema = Joi.object({
        listId: Joi.string().uuid({ version: 'uuidv4' }).optional(),
        status: Joi.string().valid('pending', 'completed').optional(),
        sortBy: Joi.string().valid('createdAt', 'title', 'deadline', 'priority').optional(),
        sortOrder: Joi.string().valid('asc', 'desc').optional(),
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional()
    });

    const dueThisWeekQuerySchema = Joi.object({
        sortBy: Joi.string().valid('deadline', 'title', 'priority').optional(),
        sortOrder: Joi.string().valid('asc', 'desc').optional()
    });

    const listTasksQuerySchema = Joi.object({
        status: Joi.string().valid('pending', 'completed').optional(),
        sortBy: Joi.string().valid('createdAt', 'title', 'deadline', 'priority').optional(),
        sortOrder: Joi.string().valid('asc', 'desc').optional()
    });

    /**
     * @swagger
     * /api/tasks:
     *   post:
     *     summary: Create a new task
     *     tags: [Tasks]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateTaskRequest'
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
     *         description: Bad request - validation error
     *       404:
     *         description: List not found
     *       422:
     *         description: Unprocessable entity - validation errors
     */
    router.post('/',
        validateBody(ValidationService.createTaskSchema),
        (req, res, next) => {
            taskController.createTask(req, res).catch(next);
        }
    );

    /**
     * @swagger
     * /api/tasks:
     *   get:
     *     summary: Get all tasks with optional filters
     *     tags: [Tasks]
     *     parameters:
     *       - in: query
     *         name: listId
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Filter tasks by list ID
     *       - in: query
     *         name: completed
     *         schema:
     *           type: boolean
     *         description: Filter tasks by completion status
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
     *           enum: [title, createdAt, updatedAt, deadline]
     *           default: createdAt
     *         description: Field to sort by
     *       - in: query
     *         name: order
     *         schema:
     *           type: string
     *           enum: [asc, desc]
     *           default: desc
     *         description: Sort order
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 10
     *         description: Number of tasks to return
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *           minimum: 0
     *           default: 0
     *         description: Number of tasks to skip
     *       - in: query
     *         name: deadlineFrom
     *         schema:
     *           type: string
     *           format: date
     *         description: Filter tasks with deadline from this date
     *       - in: query
     *         name: deadlineTo
     *         schema:
     *           type: string
     *           format: date
     *         description: Filter tasks with deadline until this date
     *     responses:
     *       200:
     *         description: Tasks retrieved successfully
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
     *                 meta:
     *                   type: object
     *                   properties:
     *                     total:
     *                       type: number
     *                       example: 5
     *                     limit:
     *                       type: number
     *                       example: 10
     *                     offset:
     *                       type: number
     *                       example: 0
     *       400:
     *         description: Bad request - invalid query parameters
     */
    router.get('/',
        validateQuery(taskQuerySchema),
        (req, res, next) => {
            taskController.getAllTasks(req, res).catch(next);
        }
    );

    /**
     * @swagger
     * /api/tasks/due-this-week:
     *   get:
     *     summary: Get tasks due this week
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
     *     responses:
     *       200:
     *         description: Tasks due this week retrieved successfully
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
     *                 meta:
     *                   type: object
     *                   properties:
     *                     total:
     *                       type: number
     *                       example: 3
     *       400:
     *         description: Bad request - invalid query parameters
     */
    router.get('/due-this-week',
        validateQuery(dueThisWeekQuerySchema),
        (req, res, next) => {
            taskController.getTasksDueThisWeek(req, res).catch(next);
        }
    );

    /**
     * @swagger
     * /api/lists/{listId}/tasks:
     *   get:
     *     summary: Get tasks for a specific list
     *     tags: [Tasks]
     *     parameters:
     *       - in: path
     *         name: listId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: The list ID
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
     *           enum: [title, createdAt, updatedAt, deadline]
     *           default: createdAt
     *         description: Field to sort by
     *       - in: query
     *         name: order
     *         schema:
     *           type: string
     *           enum: [asc, desc]
     *           default: desc
     *         description: Sort order
     *     responses:
     *       200:
     *         description: Tasks retrieved successfully
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
     *                 meta:
     *                   type: object
     *                   properties:
     *                     total:
     *                       type: number
     *                       example: 5
     *       400:
     *         description: Bad request - invalid UUID format
     *       404:
     *         description: List not found
     */
    router.get('/lists/:listId/tasks',
        validateUuidParam('listId'),
        validateQuery(listTasksQuerySchema),
        (req, res, next) => {
            taskController.getTasksByListId(req, res).catch(next);
        }
    );

    /**
     * @swagger
     * /api/tasks/lists/{listId}/tasks:
     *   post:
     *     summary: Create a new task in a specific list
     *     description: Creates a new task within the specified list (alternative to POST /tasks with listId in body)
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
     *       400:
     *         description: Bad request - validation error
     *       404:
     *         description: List not found
     */
    router.post('/lists/:listId/tasks',
        validateUuidParam('listId'),
        validateBody(ValidationService.createTaskSchema),
        (req, res, next) => {
            taskController.createTask(req, res).catch(next);
        }
    );

    /**
     * @swagger
     * /api/tasks/{id}:
     *   put:
     *     summary: Update a specific task
     *     tags: [Tasks]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: The task ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateTaskRequest'
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
     *         description: Bad request - validation error
     *       404:
     *         description: Task not found
     *       422:
     *         description: Unprocessable entity - validation errors
     */
    router.put('/:id',
        validateUuidParam('id'),
        validateBody(ValidationService.updateTaskSchema),
        (req, res, next) => {
            taskController.updateTask(req, res).catch(next);
        }
    );

    /**
     * @swagger
     * /api/tasks/{id}:
     *   delete:
     *     summary: Delete a specific task
     *     tags: [Tasks]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: The task ID
     *     responses:
     *       204:
     *         description: Task deleted successfully
     *       400:
     *         description: Bad request - invalid UUID format
     *       404:
     *         description: Task not found
     */
    router.delete('/:id',
        validateUuidParam('id'),
        (req, res, next) => {
            taskController.deleteTask(req, res).catch(next);
        }
    );

    /**
     * @swagger
     * /api/tasks/{id}/toggle:
     *   patch:
     *     summary: Toggle task completion status
     *     tags: [Tasks]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: The task ID
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
     *       400:
     *         description: Bad request - invalid UUID format
     *       404:
     *         description: Task not found
     */
    router.patch('/:id/toggle',
        validateUuidParam('id'),
        (req, res, next) => {
            taskController.toggleTaskCompletion(req, res).catch(next);
        }
    );

    return router;
}

export { createTaskRoutes as taskRoutes };

