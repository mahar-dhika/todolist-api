/**
 * Validation Middleware
 * 
 * Provides middleware functions for validating route parameters, query parameters,
 * and request bodies using Joi schemas from the ValidationService.
 */

import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { IApiResponse } from '../../models/interfaces/api.interface';

/**
 * Middleware to validate UUID parameters (like :id in routes)
 */
export function validateUuidParam(paramName: string = 'id') {
    return (req: Request, res: Response, next: NextFunction): void => {
        const paramValue = req.params[paramName];

        if (!paramValue) {
            const response: IApiResponse<null> = {
                success: false,
                error: {
                    message: `Parameter '${paramName}' is required`,
                    code: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                    path: req.path
                },
                data: null
            };
            res.status(400).json(response);
            return;
        }

        const schema = Joi.string().uuid({ version: 'uuidv4' }).required();
        const { error } = schema.validate(paramValue);

        if (error) {
            const response: IApiResponse<null> = {
                success: false,
                error: {
                    message: `Invalid ${paramName}: ${error.details[0].message}`,
                    code: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                    path: req.path
                },
                data: null
            };
            res.status(400).json(response);
            return;
        }

        next();
    };
}

/**
 * Middleware to validate request body using a Joi schema
 */
export function validateBody(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const response: IApiResponse<null> = {
                success: false,
                error: {
                    message: 'Request validation failed',
                    code: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                    details: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                },
                data: null
            };
            res.status(400).json(response);
            return;
        }

        // Replace req.body with validated and sanitized data
        req.body = value;
        next();
    };
}

/**
 * Middleware to validate query parameters using a Joi schema
 */
export function validateQuery(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
            convert: true // Convert string query params to appropriate types
        });

        if (error) {
            const response: IApiResponse<null> = {
                success: false,
                error: {
                    message: 'Query parameter validation failed',
                    code: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                    details: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                },
                data: null
            };
            res.status(400).json(response);
            return;
        }

        // Replace req.query with validated and sanitized data
        req.query = value;
        next();
    };
}

/**
 * Middleware to validate route parameters using a custom schema
 */
export function validateParams(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false
        });

        if (error) {
            const response: IApiResponse<null> = {
                success: false,
                error: {
                    message: 'Route parameter validation failed',
                    code: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                    details: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                },
                data: null
            };
            res.status(400).json(response);
            return;
        }

        next();
    };
}
