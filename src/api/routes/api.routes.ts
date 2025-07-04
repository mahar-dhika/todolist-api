/**
 * Main API Routes Configuration
 * 
 * This module creates and configures the main API router that combines
 * all route modules for the To-Do List API. It provides a centralized
 * way to configure routes and middleware.
 * 
 * Routes Structure:
 * - /api/lists - List management endpoints
 * - /api/tasks - Task management endpoints
 * - /api/lists/:listId/tasks - List-specific task endpoints
 */

import { Router } from 'express';
import { createListRoutes } from './list.routes';
import { createTaskRoutes } from './task.routes';

/**
 * Create and configure the main API router
 * @returns Configured Express router with all API routes
 */
export function createApiRoutes(): Router {
    const apiRouter = Router();

    // Configure list routes at /api/lists
    const listRoutes = createListRoutes();
    apiRouter.use('/lists', listRoutes);

    // Configure task routes at /api/tasks
    const taskRoutes = createTaskRoutes();
    apiRouter.use('/tasks', taskRoutes);

    // Note: List-specific task routes (/lists/:listId/tasks) are handled
    // within the task routes configuration for better organization

    return apiRouter;
}

/**
 * Export the API router factory function
 */
export { createApiRoutes as apiRoutes };
