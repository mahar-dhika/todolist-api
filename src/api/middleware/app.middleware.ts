/**
 * Application Middleware Configuration
 * 
 * This module configures and exports all middleware functions used
 * throughout the To-Do List API application.
 */

import compression from 'compression';
import cors from 'cors';
import { Application, NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from '../../config';

/**
 * Configure security middleware
 */
export function configureSecurityMiddleware(app: Application): void {
    // Trust proxy if configured
    if (config.security.trustProxy) {
        app.set('trust proxy', 1);
    }

    // Helmet for security headers
    app.use(helmet({
        contentSecurityPolicy: config.security.contentSecurityPolicy,
        crossOriginEmbedderPolicy: false // Allow swagger UI to work
    }));

    // CORS configuration
    app.use(cors(config.cors));
}

/**
 * Configure body parsing middleware
 */
export function configureBodyParsingMiddleware(app: Application): void {
    // JSON body parser with size limit
    app.use(express.json({
        limit: config.request.bodyLimit
    }));

    // URL-encoded body parser
    app.use(express.urlencoded(config.request.urlEncoded));
}

/**
 * Configure compression middleware
 */
export function configureCompressionMiddleware(app: Application): void {
    app.use(compression({
        // Only compress responses that are larger than this threshold
        threshold: 1024,
        // Compression filter function
        filter: (req: Request, res: Response) => {
            // Don't compress responses with 'x-no-compression' header
            if (req.headers['x-no-compression']) {
                return false;
            }
            // Use compression filter function
            return compression.filter(req, res);
        }
    }));
}

/**
 * Configure rate limiting middleware
 */
export function configureRateLimitingMiddleware(app: Application): void {
    const limiter = rateLimit({
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.maxRequests,
        message: config.rateLimit.message,
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        // Skip successful requests
        skipSuccessfulRequests: false,
        // Skip failed requests
        skipFailedRequests: false,
        // Custom key generator (optional)
        keyGenerator: (req: Request): string => {
            return req.ip || 'unknown';
        }
    });

    app.use(limiter);
}

/**
 * Configure request logging middleware
 */
export function configureLoggingMiddleware(app: Application): void {
    // Simple request logger for development
    if (config.server.env === 'development') {
        app.use((req: Request, res: Response, next: NextFunction) => {
            const timestamp = new Date().toISOString();
            const method = req.method;
            const url = req.url;
            const ip = req.ip || req.connection.remoteAddress;

            console.log(`[${timestamp}] ${method} ${url} - ${ip}`);
            next();
        });
    }
}

/**
 * Global error handler middleware
 */
export function configureErrorHandlingMiddleware(app: Application): void {
    // 404 handler - must be added before the global error handler
    app.use('*', (req: Request, res: Response) => {
        res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: `Route ${req.method} ${req.originalUrl} not found`,
                details: {
                    method: req.method,
                    path: req.originalUrl,
                    timestamp: new Date().toISOString()
                }
            }
        });
    });

    // Global error handler
    app.use((error: any, req: Request, res: Response, next: NextFunction) => {
        // Log error details
        console.error('Error occurred:', {
            message: error.message,
            stack: error.stack,
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString()
        });

        // Determine error status code
        const statusCode = error.statusCode || error.status || 500;

        // Determine error code
        let errorCode = 'INTERNAL_SERVER_ERROR';
        if (statusCode === 400) errorCode = 'BAD_REQUEST';
        else if (statusCode === 401) errorCode = 'UNAUTHORIZED';
        else if (statusCode === 403) errorCode = 'FORBIDDEN';
        else if (statusCode === 404) errorCode = 'NOT_FOUND';
        else if (statusCode === 422) errorCode = 'VALIDATION_ERROR';
        else if (statusCode === 429) errorCode = 'TOO_MANY_REQUESTS';

        // Don't expose sensitive error details in production
        const errorMessage = config.server.env === 'production' && statusCode === 500
            ? 'Internal server error occurred'
            : error.message || 'An unexpected error occurred';

        // Send error response
        res.status(statusCode).json({
            success: false,
            error: {
                code: errorCode,
                message: errorMessage,
                ...(config.server.env === 'development' && {
                    details: {
                        stack: error.stack,
                        timestamp: new Date().toISOString()
                    }
                })
            }
        });
    });
}

// Re-export express for convenience
import express from 'express';
export { express };
