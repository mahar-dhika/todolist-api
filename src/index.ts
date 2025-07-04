/**
 * To-Do List API - Main Application Entry Point
 * 
 * This is the main entry point for the To-Do List API application.
 * It configures and starts the Express server with all necessary middleware,
 * routes, and error handling.
 */

import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';
import {
    configureBodyParsingMiddleware,
    configureCompressionMiddleware,
    configureErrorHandlingMiddleware,
    configureLoggingMiddleware,
    configureRateLimitingMiddleware,
    configureSecurityMiddleware,
    express
} from './api/middleware';
import { createApiRoutes } from './api/routes/api.routes';
import { createHealthRoutes } from './api/routes/health.routes';
import { config, swaggerConfig, validateConfig } from './config';

/**
 * Create and configure the Express application
 */
function createApp() {
    const app = express();

    // Validate configuration
    validateConfig();

    // Configure security middleware
    configureSecurityMiddleware(app);

    // Configure request logging (before other middleware)
    configureLoggingMiddleware(app);

    // Configure body parsing middleware
    configureBodyParsingMiddleware(app);

    // Configure compression middleware
    configureCompressionMiddleware(app);

    // Configure rate limiting middleware
    configureRateLimitingMiddleware(app);

    // Health check routes (before API prefix)
    app.use(createHealthRoutes());

    // Swagger documentation routes
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig.spec, swaggerConfig.uiOptions));

    // Alternative documentation endpoint for JSON specification
    app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerConfig.spec);
    });

    // API routes with prefix
    app.use(config.server.apiPrefix, createApiRoutes());

    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            success: true,
            data: {
                message: 'Welcome to To-Do List API',
                version: '1.0.0',
                environment: config.server.env,
                documentation: `${req.protocol}://${req.get('host')}/docs`,
                endpoints: {
                    health: `${req.protocol}://${req.get('host')}/health`,
                    api: `${req.protocol}://${req.get('host')}${config.server.apiPrefix}`,
                    lists: `${req.protocol}://${req.get('host')}${config.server.apiPrefix}/lists`,
                    tasks: `${req.protocol}://${req.get('host')}${config.server.apiPrefix}/tasks`
                }
            }
        });
    });

    // Configure error handling middleware (must be last)
    configureErrorHandlingMiddleware(app);

    return app;
}

/**
 * Start the server
 */
function startServer() {
    try {
        const app = createApp();

        const server = app.listen(config.server.port, config.server.host, () => {
            console.log(`
🚀 To-Do List API Server Started Successfully!

📋 Server Information:
   • Environment: ${config.server.env}
   • Host: ${config.server.host}
   • Port: ${config.server.port}
   • API Base URL: http://${config.server.host}:${config.server.port}${config.server.apiPrefix}

🔗 Available Endpoints:
   • Health Check: http://${config.server.host}:${config.server.port}/health
   • API Documentation: http://${config.server.host}:${config.server.port}/docs
   • OpenAPI Spec (JSON): http://${config.server.host}:${config.server.port}/docs.json
   • Lists API: http://${config.server.host}:${config.server.port}${config.server.apiPrefix}/lists
   • Tasks API: http://${config.server.host}:${config.server.port}${config.server.apiPrefix}/tasks

📊 Configuration:
   • CORS Origin: ${config.cors.origin}
   • Rate Limit: ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs / 60000} minutes
   • Body Size Limit: ${config.request.bodyLimit}

🛠️  Development Mode: ${config.server.env === 'development' ? 'Enabled' : 'Disabled'}
      `);
        });

        // Graceful shutdown handling
        const gracefulShutdown = (signal: string) => {
            console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);

            server.close((err) => {
                if (err) {
                    console.error('❌ Error during server shutdown:', err);
                    process.exit(1);
                }

                console.log('✅ Server closed successfully');
                console.log('👋 To-Do List API has been shut down gracefully');
                process.exit(0);
            });
        };

        // Listen for termination signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            process.exit(1);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });

        return server;

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    startServer();
}

// Export for testing and Vite development
export { createApp, startServer };

// Named export for Vite plugin
export const app = createApp();
