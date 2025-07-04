import { IApiError, IApiResponse } from '../models/interfaces/api.interface';

/**
 * Error response builders and utilities
 */
export class ErrorUtil {
    /**
     * Common error codes used throughout the application
     */
    static readonly ERROR_CODES = {
        // Client errors (4xx)
        BAD_REQUEST: 'BAD_REQUEST',
        UNAUTHORIZED: 'UNAUTHORIZED',
        FORBIDDEN: 'FORBIDDEN',
        NOT_FOUND: 'RESOURCE_NOT_FOUND',
        CONFLICT: 'RESOURCE_CONFLICT',
        VALIDATION_ERROR: 'VALIDATION_ERROR',
        UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',

        // Server errors (5xx)
        INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
        SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
        DATABASE_ERROR: 'DATABASE_ERROR'
    } as const;

    /**
     * Create a formatted error object
     * @param code - Error code
     * @param message - Error message
     * @param details - Optional error details
     * @param path - Optional request path
     * @returns Formatted error object
     */
    static createError(
        code: string,
        message: string,
        details?: any,
        path?: string
    ): IApiError {
        const error: IApiError = {
            code,
            message,
            timestamp: new Date().toISOString()
        };

        if (details !== undefined) {
            error.details = details;
        }

        if (path) {
            error.path = path;
        }

        return error;
    }

    /**
     * Create an error response
     * @param code - Error code
     * @param message - Error message
     * @param details - Optional error details
     * @param path - Optional request path
     * @returns Formatted error response
     */
    static createErrorResponse(
        code: string,
        message: string,
        details?: any,
        path?: string
    ): IApiResponse {
        return {
            success: false,
            error: this.createError(code, message, details, path)
        };
    }

    /**
     * Extract error message from various error types
     * @param error - Error object (Error, string, or any)
     * @returns Error message string
     */
    static extractErrorMessage(error: any): string {
        if (typeof error === 'string') {
            return error;
        }

        if (error instanceof Error) {
            return error.message;
        }

        if (error && typeof error === 'object') {
            // Try common error message properties
            if (error.message) {
                return error.message;
            }
            if (error.msg) {
                return error.msg;
            }
            if (error.error) {
                return this.extractErrorMessage(error.error);
            }
        }

        return 'Unknown error occurred';
    }

    /**
     * Check if an error is a validation error
     * @param error - Error to check
     * @returns True if it's a validation error
     */
    static isValidationError(error: any): boolean {
        if (!error) return false;

        // Check for Joi validation errors
        if (error.isJoi || error.name === 'ValidationError') {
            return true;
        }

        // Check for custom validation errors
        if (error.code === this.ERROR_CODES.VALIDATION_ERROR) {
            return true;
        }

        return false;
    }

    /**
     * Format Joi validation error into a readable format
     * @param joiError - Joi validation error
     * @returns Formatted validation error details
     */
    static formatJoiError(joiError: any): any {
        if (!joiError || !joiError.details) {
            return null;
        }

        return joiError.details.map((detail: any) => ({
            field: detail.path?.join('.') || 'unknown',
            message: detail.message,
            value: detail.context?.value,
            rule: detail.type
        }));
    }

    /**
     * Create a validation error response from Joi error
     * @param joiError - Joi validation error
     * @param path - Optional request path
     * @returns Formatted validation error response
     */
    static fromJoiError(joiError: any, path?: string): IApiResponse {
        const details = this.formatJoiError(joiError);
        const message = 'Validation failed';

        return this.createErrorResponse(
            this.ERROR_CODES.VALIDATION_ERROR,
            message,
            details,
            path
        );
    }

    /**
     * Create a not found error response
     * @param resource - Resource name
     * @param id - Optional resource ID
     * @param path - Optional request path
     * @returns Not found error response
     */
    static notFound(resource: string, id?: string, path?: string): IApiResponse {
        const message = id
            ? `${resource} with ID '${id}' not found`
            : `${resource} not found`;

        return this.createErrorResponse(
            this.ERROR_CODES.NOT_FOUND,
            message,
            undefined,
            path
        );
    }

    /**
     * Create a conflict error response
     * @param message - Error message
     * @param details - Optional conflict details
     * @param path - Optional request path
     * @returns Conflict error response
     */
    static conflict(message: string, details?: any, path?: string): IApiResponse {
        return this.createErrorResponse(
            this.ERROR_CODES.CONFLICT,
            message,
            details,
            path
        );
    }

    /**
     * Create a bad request error response
     * @param message - Error message
     * @param details - Optional error details
     * @param path - Optional request path
     * @returns Bad request error response
     */
    static badRequest(message: string, details?: any, path?: string): IApiResponse {
        return this.createErrorResponse(
            this.ERROR_CODES.BAD_REQUEST,
            message,
            details,
            path
        );
    }

    /**
     * Create an internal server error response
     * @param message - Error message (optional)
     * @param details - Optional error details (should not contain sensitive info)
     * @param path - Optional request path
     * @returns Server error response
     */
    static serverError(message?: string, details?: any, path?: string): IApiResponse {
        const errorMessage = message || 'An internal server error occurred';
        return this.createErrorResponse(
            this.ERROR_CODES.INTERNAL_SERVER_ERROR,
            errorMessage,
            details,
            path
        );
    }

    /**
     * Sanitize error details to remove sensitive information
     * @param details - Error details to sanitize
     * @returns Sanitized error details
     */
    static sanitizeErrorDetails(details: any): any {
        if (!details || typeof details !== 'object') {
            return details;
        }

        // Create a copy to avoid modifying the original
        const sanitized = JSON.parse(JSON.stringify(details));

        // Remove sensitive fields
        const sensitiveFields = [
            'password', 'secret', 'token', 'key', 'auth',
            'credentials', 'connectionString',
            'apiKey', 'accessToken', 'refreshToken', 'sessionId',
            'dbPassword'
        ];

        const removeSensitiveData = (obj: any): void => {
            if (!obj || typeof obj !== 'object') return;

            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const keyLower = key.toLowerCase();
                    if (sensitiveFields.some(field =>
                        keyLower.includes(field.toLowerCase())
                    )) {
                        obj[key] = '[REDACTED]';
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        removeSensitiveData(obj[key]);
                    }
                }
            }
        };

        removeSensitiveData(sanitized);
        return sanitized;
    }

    /**
     * Log error for debugging purposes (without sensitive data)
     * @param error - Error to log
     * @param context - Optional context information
     */
    static logError(error: any, context?: string): void {
        const errorMessage = this.extractErrorMessage(error);
        const sanitizedDetails = this.sanitizeErrorDetails(error);

        console.error(`[ERROR]${context ? ` ${context}:` : ''} ${errorMessage}`, {
            error: sanitizedDetails,
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * Convenience functions for common error operations
 */

/**
 * Create a validation error response from Joi error
 * @param joiError - Joi validation error
 * @param path - Optional request path
 * @returns Formatted validation error response
 */
export const fromJoiError = (joiError: any, path?: string): IApiResponse =>
    ErrorUtil.fromJoiError(joiError, path);

/**
 * Create a not found error response
 * @param resource - Resource name
 * @param id - Optional resource ID
 * @returns Not found error response
 */
export const notFoundError = (resource: string, id?: string): IApiResponse =>
    ErrorUtil.notFound(resource, id);

/**
 * Extract error message from various error types
 * @param error - Error object
 * @returns Error message string
 */
export const getErrorMessage = (error: any): string =>
    ErrorUtil.extractErrorMessage(error);

/**
 * Log error safely without sensitive data
 * @param error - Error to log
 * @param context - Optional context
 */
export const logError = (error: any, context?: string): void =>
    ErrorUtil.logError(error, context);
