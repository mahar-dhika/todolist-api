/**
 * Standard API response wrapper
 * All API endpoints should return this format
 */
export interface IApiResponse<T = any> {
    /**
     * Indicates if the request was successful
     */
    success: boolean;

    /**
     * Response data (only present on successful requests)
     */
    data?: T;

    /**
     * Error information (only present on failed requests)
     */
    error?: IApiError;

    /**
     * Optional metadata about the response
     */
    meta?: IApiMeta;
}

/**
 * API error structure for failed requests
 */
export interface IApiError {
    /**
     * Error code for programmatic handling
     */
    code: string;

    /**
     * Human-readable error message
     */
    message: string;

    /**
     * Additional error details (validation errors, etc.)
     */
    details?: any;

    /**
     * Request timestamp when error occurred
     */
    timestamp: string;

    /**
     * Request path where error occurred
     */
    path?: string;
}

/**
 * Metadata for API responses
 * Used for pagination, timing, etc.
 */
export interface IApiMeta {
    /**
     * Total number of items (for paginated responses)
     */
    total?: number;

    /**
     * Number of items in current page
     */
    count?: number;

    /**
     * Current page number (1-based)
     */
    page?: number;

    /**
     * Total number of pages
     */
    totalPages?: number;

    /**
     * Items per page limit
     */
    limit?: number;

    /**
     * Response processing time in milliseconds
     */
    processingTime?: number;

    /**
     * API version
     */
    version?: string;
}

/**
 * Validation error details
 * Used when request validation fails
 */
export interface IValidationError {
    /**
     * Field name that failed validation
     */
    field: string;

    /**
     * Validation error message
     */
    message: string;

    /**
     * Value that was provided
     */
    value?: any;

    /**
     * Validation rule that was violated
     */
    rule?: string;
}

/**
 * Health check response
 */
export interface IHealthCheckResponse {
    /**
     * Service status
     */
    status: 'healthy' | 'unhealthy' | 'degraded';

    /**
     * Timestamp of the health check
     */
    timestamp: string;

    /**
     * API version
     */
    version: string;

    /**
     * Uptime in seconds
     */
    uptime: number;

    /**
     * Individual component health statuses
     */
    components: {
        database: 'healthy' | 'unhealthy';
        memory: 'healthy' | 'unhealthy';
        [key: string]: 'healthy' | 'unhealthy';
    };
}
