import { Request, Response } from 'express';
import { IApiResponse } from '../../models/interfaces/api.interface';
import { IList } from '../../models/interfaces/list.interface';
import { ICreateListRequest, IUpdateListRequest } from '../../models/interfaces/request.interface';
import { ListService } from '../../services/list.service';

/**
 * List Controller
 * 
 * Handles all HTTP requests related to list operations including:
 * - Creating new lists
 * - Retrieving all lists or specific lists by ID
 * - Updating existing lists
 * - Deleting lists with cascade task deletion
 * - Proper HTTP status codes and error handling
 */
export class ListController {
    private readonly listService: ListService;

    /**
     * Constructor with dependency injection
     * @param listService - Service for list business logic operations
     */
    constructor(listService: ListService) {
        this.listService = listService;
    }

    /**
     * @swagger
     * /api/lists:
     *   get:
     *     summary: Get all lists
     *     description: Retrieves all lists with optional task counts
     *     tags: [Lists]
     *     parameters:
     *       - in: query
     *         name: includeTaskCount
     *         schema:
     *           type: boolean
     *           default: true
     *         description: Whether to include task count in response
     *     responses:
     *       200:
     *         description: Successfully retrieved all lists
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
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     */
    async getAllLists(req: Request, res: Response): Promise<void> {
        try {
            const includeTaskCount = req.query.includeTaskCount !== 'false';
            const lists = await this.listService.getAllLists(includeTaskCount);

            const response: IApiResponse<IList[]> = {
                success: true,
                data: lists,
                meta: {
                    count: lists.length
                }
            };

            res.status(200).json(response);
        } catch (error) {
            this.handleError(res, error, 'LISTS_FETCH_FAILED', 'Failed to retrieve lists');
        }
    }

    /**
     * @swagger
     * /api/lists:
     *   post:
     *     summary: Create a new list
     *     description: Creates a new list with the provided data
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
     *         description: Validation error or duplicate list name
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiError'
     *       422:
     *         description: Validation error
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
    async createList(req: Request, res: Response): Promise<void> {
        try {
            const listData: ICreateListRequest = req.body;
            const createdList = await this.listService.createList(listData);

            const response: IApiResponse<IList> = {
                success: true,
                data: createdList
            };

            res.status(201).json(response);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Validation error')) {
                    this.handleError(res, error, 'VALIDATION_ERROR', error.message, 422);
                } else if (error.message.includes('already exists')) {
                    this.handleError(res, error, 'DUPLICATE_LIST_NAME', error.message, 400);
                } else {
                    this.handleError(res, error, 'LIST_CREATION_FAILED', 'Failed to create list');
                }
            } else {
                this.handleError(res, error, 'LIST_CREATION_FAILED', 'Failed to create list');
            }
        }
    }

    /**
     * @swagger
     * /api/lists/{id}:
     *   get:
     *     summary: Get a list by ID
     *     description: Retrieves a specific list by its unique identifier
     *     tags: [Lists]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: The unique identifier of the list
     *       - in: query
     *         name: includeTaskCount
     *         schema:
     *           type: boolean
     *           default: true
     *         description: Whether to include task count in response
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
     *         description: Invalid list ID format
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
    async getListById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const includeTaskCount = req.query.includeTaskCount !== 'false';

            const list = await this.listService.getListById(id, includeTaskCount);

            if (!list) {
                const response: IApiResponse = {
                    success: false,
                    error: {
                        code: 'LIST_NOT_FOUND',
                        message: `List with ID '${id}' not found`,
                        timestamp: new Date().toISOString()
                    }
                };
                res.status(404).json(response);
                return;
            }

            const response: IApiResponse<IList> = {
                success: true,
                data: list
            };

            res.status(200).json(response);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid list ID')) {
                this.handleError(res, error, 'INVALID_LIST_ID', error.message, 400);
            } else {
                this.handleError(res, error, 'LIST_FETCH_FAILED', 'Failed to retrieve list');
            }
        }
    }

    /**
     * @swagger
     * /api/lists/{id}:
     *   put:
     *     summary: Update a list
     *     description: Updates an existing list with the provided data
     *     tags: [Lists]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: The unique identifier of the list to update
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
     *         description: Invalid list ID format or duplicate list name
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
     *       422:
     *         description: Validation error
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
    async updateList(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData: IUpdateListRequest = req.body;

            const updatedList = await this.listService.updateList(id, updateData);

            if (!updatedList) {
                const response: IApiResponse = {
                    success: false,
                    error: {
                        code: 'LIST_NOT_FOUND',
                        message: `List with ID '${id}' not found`,
                        timestamp: new Date().toISOString()
                    }
                };
                res.status(404).json(response);
                return;
            }

            const response: IApiResponse<IList> = {
                success: true,
                data: updatedList
            };

            res.status(200).json(response);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Invalid list ID')) {
                    this.handleError(res, error, 'INVALID_LIST_ID', error.message, 400);
                } else if (error.message.includes('Validation error')) {
                    this.handleError(res, error, 'VALIDATION_ERROR', error.message, 422);
                } else if (error.message.includes('already exists')) {
                    this.handleError(res, error, 'DUPLICATE_LIST_NAME', error.message, 400);
                } else {
                    this.handleError(res, error, 'LIST_UPDATE_FAILED', 'Failed to update list');
                }
            } else {
                this.handleError(res, error, 'LIST_UPDATE_FAILED', 'Failed to update list');
            }
        }
    }

    /**
     * @swagger
     * /api/lists/{id}:
     *   delete:
     *     summary: Delete a list
     *     description: Deletes a list and all its associated tasks (cascade delete)
     *     tags: [Lists]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: The unique identifier of the list to delete
     *     responses:
     *       204:
     *         description: List deleted successfully (no content)
     *       400:
     *         description: Invalid list ID format
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
    async deleteList(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await this.listService.deleteList(id);

            if (!deleted) {
                const response: IApiResponse = {
                    success: false,
                    error: {
                        code: 'LIST_NOT_FOUND',
                        message: `List with ID '${id}' not found`,
                        timestamp: new Date().toISOString()
                    }
                };
                res.status(404).json(response);
                return;
            }

            // Return 204 No Content for successful deletion
            res.status(204).send();
        } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid list ID')) {
                this.handleError(res, error, 'INVALID_LIST_ID', error.message, 400);
            } else {
                this.handleError(res, error, 'LIST_DELETE_FAILED', 'Failed to delete list');
            }
        }
    }

    /**
     * Private helper method for consistent error handling
     * @param res - Express response object
     * @param error - The error that occurred
     * @param code - Error code for the response
     * @param message - Default error message
     * @param statusCode - HTTP status code (default: 500)
     */
    private handleError(
        res: Response,
        error: any,
        code: string,
        message: string,
        statusCode: number = 500
    ): void {
        const errorResponse: IApiResponse = {
            success: false,
            error: {
                code,
                message: error instanceof Error ? error.message : message,
                timestamp: new Date().toISOString(),
                ...(error instanceof Error && error.stack && process.env.NODE_ENV === 'development' && {
                    details: { stack: error.stack }
                })
            }
        };

        res.status(statusCode).json(errorResponse);
    }
}
