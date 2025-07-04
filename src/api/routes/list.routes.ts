/**
 * List API Routes
 * 
 * This module defines all routes for list-related operations including:
 * - GET /lists - Get all lists
 * - POST /lists - Create a new list
 * - GET /lists/:id - Get a specific list by ID
 * - PUT /lists/:id - Update a specific list
 * - DELETE /lists/:id - Delete a specific list
 * 
 * All routes include proper parameter validation and error handling.
 */

import { Router } from 'express';
import Joi from 'joi';
import { MemoryListRepository } from '../../repositories/memory/memory-list.repository';
import { MemoryTaskRepository } from '../../repositories/memory/memory-task.repository';
import { ListService } from '../../services/list.service';
import { ValidationService } from '../../services/validation.service';
import { ListController } from '../controllers/list.controller';
import { validateBody, validateQuery, validateUuidParam } from '../middleware/validation.middleware';

/**
 * Create and configure list routes with dependency injection
 * @returns Configured Express router for list operations
 */
export function createListRoutes(): Router {
    const router = Router();

    // Initialize dependencies
    const listRepository = new MemoryListRepository();
    const taskRepository = new MemoryTaskRepository();
    const listService = new ListService(listRepository, taskRepository);
    const listController = new ListController(listService);

    // Query validation schemas
    const listQuerySchema = Joi.object({
        includeTaskCount: Joi.boolean().default(true)
    });

    // Single list query schema
    const singleListQuerySchema = Joi.object({
        includeTaskCount: Joi.boolean().default(true)
    });

    /**
     * @swagger
     * /api/lists:
     *   get:
     *     summary: Get all lists
     *     tags: [Lists]
     *     parameters:
     *       - in: query
     *         name: includeTaskCount
     *         schema:
     *           type: boolean
     *           default: true
     *         description: Whether to include task counts for each list
     *     responses:
     *       200:
     *         description: List of all lists retrieved successfully
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
     *                     $ref: '#/components/schemas/List'
     *                 meta:
     *                   type: object
     *                   properties:
     *                     total:
     *                       type: number
     *                       example: 3
     */
    router.get('/',
        validateQuery(listQuerySchema),
        (req, res, next) => {
            listController.getAllLists(req, res).catch(next);
        }
    );

    /**
     * @swagger
     * /api/lists:
     *   post:
     *     summary: Create a new list
     *     tags: [Lists]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateListRequest'
     *     responses:
     *       201:
     *         description: List created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/List'
     *       400:
     *         description: Bad request - validation error or duplicate name
     *       422:
     *         description: Unprocessable entity - validation errors
     */
    router.post('/',
        validateBody(ValidationService.createListSchema),
        (req, res, next) => {
            listController.createList(req, res).catch(next);
        }
    );

    /**
     * @swagger
     * /api/lists/{id}:
     *   get:
     *     summary: Get a specific list by ID
     *     tags: [Lists]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: The list ID
     *       - in: query
     *         name: includeTaskCount
     *         schema:
     *           type: boolean
     *           default: true
     *         description: Whether to include task count for the list
     *     responses:
     *       200:
     *         description: List retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/List'
     *       400:
     *         description: Bad request - invalid UUID format
     *       404:
     *         description: List not found
     */
    router.get('/:id',
        validateUuidParam('id'),
        validateQuery(singleListQuerySchema),
        (req, res, next) => {
            listController.getListById(req, res).catch(next);
        }
    );

    /**
     * @swagger
     * /api/lists/{id}:
     *   put:
     *     summary: Update a specific list
     *     tags: [Lists]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: The list ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateListRequest'
     *     responses:
     *       200:
     *         description: List updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/List'
     *       400:
     *         description: Bad request - validation error or duplicate name
     *       404:
     *         description: List not found
     *       422:
     *         description: Unprocessable entity - validation errors
     */
    router.put('/:id',
        validateUuidParam('id'),
        validateBody(ValidationService.updateListSchema),
        (req, res, next) => {
            listController.updateList(req, res).catch(next);
        }
    );

    /**
     * @swagger
     * /api/lists/{id}:
     *   delete:
     *     summary: Delete a specific list
     *     tags: [Lists]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: The list ID
     *     responses:
     *       204:
     *         description: List deleted successfully
     *       400:
     *         description: Bad request - invalid UUID format
     *       404:
     *         description: List not found
     */
    router.delete('/:id',
        validateUuidParam('id'),
        (req, res, next) => {
            listController.deleteList(req, res).catch(next);
        }
    );

    return router;
}

export { createListRoutes as listRoutes };
