/**
 * Health Check Routes
 * 
 * This module provides health check endpoints for monitoring
 * the application status and dependencies.
 */

import { Request, Response, Router } from 'express';

/**
 * Create health check routes
 */
export function createHealthRoutes(): Router {
    const router = Router();

    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Health check endpoint
     *     description: Returns the current health status of the API
     *     tags:
     *       - Health
     *     responses:
     *       200:
     *         description: Service is healthy
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     status:
     *                       type: string
     *                       example: "healthy"
     *                     timestamp:
     *                       type: string
     *                       format: date-time
     *                     uptime:
     *                       type: number
     *                       description: Server uptime in seconds
     *                     version:
     *                       type: string
     *                       example: "1.0.0"
     *                     environment:
     *                       type: string
     *                       example: "development"
     */
    router.get('/health', (req: Request, res: Response) => {
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            node_version: process.version,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
                external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100
            }
        };

        res.status(200).json({
            success: true,
            data: healthData
        });
    });

    /**
     * @swagger
     * /health/ready:
     *   get:
     *     summary: Readiness check endpoint
     *     description: Returns whether the service is ready to accept traffic
     *     tags:
     *       - Health
     *     responses:
     *       200:
     *         description: Service is ready
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     ready:
     *                       type: boolean
     *                       example: true
     *                     checks:
     *                       type: object
     *                       properties:
     *                         database:
     *                           type: string
     *                           example: "ok"
     *       503:
     *         description: Service is not ready
     */
    router.get('/health/ready', (req: Request, res: Response) => {
        // For now, since we're using memory storage, we'll always be ready
        // In the future, this could check database connections, etc.
        const checks = {
            database: 'ok', // Memory storage is always available
            // Add more checks as needed (Redis, external APIs, etc.)
        };

        const allChecksOk = Object.values(checks).every(status => status === 'ok');

        const statusCode = allChecksOk ? 200 : 503;

        res.status(statusCode).json({
            success: allChecksOk,
            data: {
                ready: allChecksOk,
                checks
            }
        });
    });

    /**
     * @swagger
     * /health/live:
     *   get:
     *     summary: Liveness check endpoint
     *     description: Returns whether the service is alive (for Kubernetes liveness probe)
     *     tags:
     *       - Health
     *     responses:
     *       200:
     *         description: Service is alive
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     alive:
     *                       type: boolean
     *                       example: true
     */
    router.get('/health/live', (req: Request, res: Response) => {
        // Simple liveness check - if we can respond, we're alive
        res.status(200).json({
            success: true,
            data: {
                alive: true,
                timestamp: new Date().toISOString()
            }
        });
    });

    return router;
}

export { createHealthRoutes as healthRoutes };
