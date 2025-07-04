import { IApiError, IApiMeta, IApiResponse } from '../models/interfaces/api.interface';

/**
 * Response formatting utilities for consistent API responses
 */
export class ResponseUtil {
    /**
     * Create a successful response
     * @param data - Response data
     * @param meta - Optional metadata
     * @returns Formatted API response
     */
    static success<T>(data?: T, meta?: IApiMeta): IApiResponse<T> {
        const response: IApiResponse<T> = {
            success: true
        };

        if (data !== undefined) {
            response.data = data;
        }

        if (meta) {
            response.meta = meta;
        }

        return response;
    }

    /**
     * Create an error response
     * @param code - Error code
     * @param message - Error message
     * @param details - Optional error details
     * @returns Formatted API error response
     */
    static error(code: string, message: string, details?: any): IApiResponse {
        const error: IApiError = {
            code,
            message,
            timestamp: new Date().toISOString()
        };

        if (details !== undefined) {
            error.details = details;
        }

        return {
            success: false,
            error
        };
    }

    /**
     * Create a validation error response
     * @param message - Error message
     * @param validationDetails - Validation error details
     * @returns Formatted validation error response
     */
    static validationError(message: string, validationDetails?: any): IApiResponse {
        return this.error('VALIDATION_ERROR', message, validationDetails);
    }

    /**
     * Create a not found error response
     * @param resource - Name of the resource that was not found
     * @param id - Optional ID of the resource
     * @returns Formatted not found error response
     */
    static notFound(resource: string, id?: string): IApiResponse {
        const message = id
            ? `${resource} with ID '${id}' not found`
            : `${resource} not found`;

        return this.error('RESOURCE_NOT_FOUND', message);
    }

    /**
     * Create a conflict error response
     * @param message - Error message
     * @param details - Optional conflict details
     * @returns Formatted conflict error response
     */
    static conflict(message: string, details?: any): IApiResponse {
        return this.error('RESOURCE_CONFLICT', message, details);
    }

    /**
     * Create an internal server error response
     * @param message - Error message (optional, uses default if not provided)
     * @param details - Optional error details (should not include sensitive info)
     * @returns Formatted server error response
     */
    static serverError(message?: string, details?: any): IApiResponse {
        const errorMessage = message || 'An internal server error occurred';
        return this.error('INTERNAL_SERVER_ERROR', errorMessage, details);
    }

    /**
     * Create a bad request error response
     * @param message - Error message
     * @param details - Optional error details
     * @returns Formatted bad request error response
     */
    static badRequest(message: string, details?: any): IApiResponse {
        return this.error('BAD_REQUEST', message, details);
    }

    /**
     * Create an unauthorized error response
     * @param message - Error message (optional)
     * @returns Formatted unauthorized error response
     */
    static unauthorized(message?: string): IApiResponse {
        const errorMessage = message || 'Unauthorized access';
        return this.error('UNAUTHORIZED', errorMessage);
    }

    /**
     * Create a forbidden error response
     * @param message - Error message (optional)
     * @returns Formatted forbidden error response
     */
    static forbidden(message?: string): IApiResponse {
        const errorMessage = message || 'Access forbidden';
        return this.error('FORBIDDEN', errorMessage);
    }

    /**
     * Create a response with pagination metadata
     * @param data - Response data
     * @param totalCount - Total number of items
     * @param page - Current page number
     * @param pageSize - Number of items per page
     * @returns Formatted response with pagination metadata
     */
    static paginated<T>(
        data: T[],
        totalCount: number,
        page: number,
        pageSize: number
    ): IApiResponse<T[]> {
        const totalPages = Math.ceil(totalCount / pageSize);

        const meta: IApiMeta = {
            total: totalCount,
            count: data.length,
            page,
            totalPages,
            limit: pageSize
        };

        return this.success(data, meta);
    }

    /**
     * Create a response for created resources
     * @param data - Created resource data
     * @param resourceId - ID of the created resource (optional)
     * @returns Formatted created response
     */
    static created<T>(data: T, resourceId?: string): IApiResponse<T> {
        // For created responses, we can include basic metadata
        const meta: IApiMeta = {
            version: '1.0'
        };

        return this.success(data, meta);
    }

    /**
     * Create a response for updated resources
     * @param data - Updated resource data
     * @param resourceId - ID of the updated resource (optional)
     * @returns Formatted updated response
     */
    static updated<T>(data: T, resourceId?: string): IApiResponse<T> {
        // For updated responses, we can include basic metadata
        const meta: IApiMeta = {
            version: '1.0'
        };

        return this.success(data, meta);
    }

    /**
     * Create a response for deleted resources
     * @param resourceId - ID of the deleted resource (optional)
     * @returns Formatted deleted response
     */
    static deleted(resourceId?: string): IApiResponse {
        // For deleted responses, we can include basic metadata
        const meta: IApiMeta = {
            version: '1.0'
        };

        return this.success(undefined, meta);
    }
}

/**
 * Convenience functions for common response patterns
 */

/**
 * Create a successful response
 * @param data - Response data
 * @param meta - Optional metadata
 * @returns Formatted API response
 */
export const successResponse = <T>(data?: T, meta?: IApiMeta): IApiResponse<T> =>
    ResponseUtil.success(data, meta);

/**
 * Create an error response
 * @param code - Error code
 * @param message - Error message
 * @param details - Optional error details
 * @returns Formatted API error response
 */
export const errorResponse = (code: string, message: string, details?: any): IApiResponse =>
    ResponseUtil.error(code, message, details);

/**
 * Create a not found error response
 * @param resource - Name of the resource that was not found
 * @param id - Optional ID of the resource
 * @returns Formatted not found error response
 */
export const notFoundResponse = (resource: string, id?: string): IApiResponse =>
    ResponseUtil.notFound(resource, id);

/**
 * Create a validation error response
 * @param message - Error message
 * @param validationDetails - Validation error details
 * @returns Formatted validation error response
 */
export const validationErrorResponse = (message: string, validationDetails?: any): IApiResponse =>
    ResponseUtil.validationError(message, validationDetails);
