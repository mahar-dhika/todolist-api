import {
    ErrorUtil,
    fromJoiError,
    getErrorMessage,
    logError,
    notFoundError
} from '../../src/utils/error.util';

describe('ErrorUtil', () => {
    describe('ERROR_CODES', () => {
        it('should have all required error codes', () => {
            expect(ErrorUtil.ERROR_CODES.BAD_REQUEST).toBe('BAD_REQUEST');
            expect(ErrorUtil.ERROR_CODES.NOT_FOUND).toBe('RESOURCE_NOT_FOUND');
            expect(ErrorUtil.ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
            expect(ErrorUtil.ERROR_CODES.INTERNAL_SERVER_ERROR).toBe('INTERNAL_SERVER_ERROR');
        });
    });

    describe('createError', () => {
        it('should create error object', () => {
            const error = ErrorUtil.createError('TEST_ERROR', 'Test message');
            expect(error.code).toBe('TEST_ERROR');
            expect(error.message).toBe('Test message');
            expect(error.timestamp).toBeDefined();
            expect(new Date(error.timestamp)).toBeInstanceOf(Date);
        });

        it('should create error with details and path', () => {
            const details = { field: 'name' };
            const error = ErrorUtil.createError('TEST_ERROR', 'Test message', details, '/api/test');
            expect(error.details).toEqual(details);
            expect(error.path).toBe('/api/test');
        });
    });

    describe('createErrorResponse', () => {
        it('should create error response', () => {
            const response = ErrorUtil.createErrorResponse('TEST_ERROR', 'Test message');
            expect(response.success).toBe(false);
            expect(response.error).toBeDefined();
            expect(response.error!.code).toBe('TEST_ERROR');
            expect(response.error!.message).toBe('Test message');
        });
    });

    describe('extractErrorMessage', () => {
        it('should extract message from string', () => {
            const message = ErrorUtil.extractErrorMessage('Test error');
            expect(message).toBe('Test error');
        });

        it('should extract message from Error object', () => {
            const error = new Error('Test error message');
            const message = ErrorUtil.extractErrorMessage(error);
            expect(message).toBe('Test error message');
        });

        it('should extract message from object with message property', () => {
            const error = { message: 'Object error message' };
            const message = ErrorUtil.extractErrorMessage(error);
            expect(message).toBe('Object error message');
        });

        it('should extract message from object with msg property', () => {
            const error = { msg: 'Object msg property' };
            const message = ErrorUtil.extractErrorMessage(error);
            expect(message).toBe('Object msg property');
        });

        it('should handle nested error objects', () => {
            const error = { error: { message: 'Nested error message' } };
            const message = ErrorUtil.extractErrorMessage(error);
            expect(message).toBe('Nested error message');
        });

        it('should return default message for unknown error types', () => {
            const message = ErrorUtil.extractErrorMessage(null);
            expect(message).toBe('Unknown error occurred');
        });
    });

    describe('isValidationError', () => {
        it('should detect Joi validation errors', () => {
            const joiError = { isJoi: true, details: [] };
            expect(ErrorUtil.isValidationError(joiError)).toBe(true);
        });

        it('should detect validation errors by name', () => {
            const validationError = { name: 'ValidationError' };
            expect(ErrorUtil.isValidationError(validationError)).toBe(true);
        });

        it('should detect custom validation errors', () => {
            const customError = { code: 'VALIDATION_ERROR' };
            expect(ErrorUtil.isValidationError(customError)).toBe(true);
        });

        it('should return false for non-validation errors', () => {
            expect(ErrorUtil.isValidationError(null)).toBe(false);
            expect(ErrorUtil.isValidationError({})).toBe(false);
            expect(ErrorUtil.isValidationError(new Error('Regular error'))).toBe(false);
        });
    });

    describe('formatJoiError', () => {
        it('should format Joi error details', () => {
            const joiError = {
                details: [
                    {
                        path: ['name'],
                        message: '"name" is required',
                        context: { value: undefined },
                        type: 'any.required'
                    },
                    {
                        path: ['email', 'address'],
                        message: '"email.address" must be valid',
                        context: { value: 'invalid-email' },
                        type: 'string.email'
                    }
                ]
            };

            const formatted = ErrorUtil.formatJoiError(joiError);
            expect(formatted).toHaveLength(2);
            expect(formatted[0]).toEqual({
                field: 'name',
                message: '"name" is required',
                value: undefined,
                rule: 'any.required'
            });
            expect(formatted[1]).toEqual({
                field: 'email.address',
                message: '"email.address" must be valid',
                value: 'invalid-email',
                rule: 'string.email'
            });
        });

        it('should return null for invalid input', () => {
            expect(ErrorUtil.formatJoiError(null)).toBeNull();
            expect(ErrorUtil.formatJoiError({})).toBeNull();
            expect(ErrorUtil.formatJoiError({ details: null })).toBeNull();
        });
    });

    describe('fromJoiError', () => {
        it('should create validation error response from Joi error', () => {
            const joiError = {
                details: [
                    {
                        path: ['name'],
                        message: '"name" is required',
                        context: { value: undefined },
                        type: 'any.required'
                    }
                ]
            };

            const response = ErrorUtil.fromJoiError(joiError, '/api/test');
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('VALIDATION_ERROR');
            expect(response.error!.message).toBe('Validation failed');
            expect(response.error!.path).toBe('/api/test');
            expect(response.error!.details).toHaveLength(1);
        });
    });

    describe('notFound', () => {
        it('should create not found error response', () => {
            const response = ErrorUtil.notFound('User', '123', '/api/users/123');
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('RESOURCE_NOT_FOUND');
            expect(response.error!.message).toBe("User with ID '123' not found");
            expect(response.error!.path).toBe('/api/users/123');
        });

        it('should create not found error without ID', () => {
            const response = ErrorUtil.notFound('User');
            expect(response.error!.message).toBe('User not found');
        });
    });

    describe('conflict', () => {
        it('should create conflict error response', () => {
            const response = ErrorUtil.conflict('Resource already exists', { name: 'test' });
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('RESOURCE_CONFLICT');
            expect(response.error!.message).toBe('Resource already exists');
            expect(response.error!.details).toEqual({ name: 'test' });
        });
    });

    describe('badRequest', () => {
        it('should create bad request error response', () => {
            const response = ErrorUtil.badRequest('Invalid input');
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('BAD_REQUEST');
            expect(response.error!.message).toBe('Invalid input');
        });
    });

    describe('serverError', () => {
        it('should create server error response with default message', () => {
            const response = ErrorUtil.serverError();
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('INTERNAL_SERVER_ERROR');
            expect(response.error!.message).toBe('An internal server error occurred');
        });

        it('should create server error with custom message', () => {
            const response = ErrorUtil.serverError('Database connection failed');
            expect(response.error!.message).toBe('Database connection failed');
        });
    });

    describe('sanitizeErrorDetails', () => {
        it('should remove sensitive fields', () => {
            const details = {
                username: 'user123',
                password: 'secret123',
                apiKey: 'api-key-value',
                config: { dbPassword: 'db-secret' },
                safeField: 'safe-value'
            };

            const sanitized = ErrorUtil.sanitizeErrorDetails(details);
            expect(sanitized.username).toBe('user123');
            expect(sanitized.password).toBe('[REDACTED]');
            expect(sanitized.apiKey).toBe('[REDACTED]');
            expect(sanitized.config.dbPassword).toBe('[REDACTED]');
            expect(sanitized.safeField).toBe('safe-value');
        });

        it('should handle non-object input', () => {
            expect(ErrorUtil.sanitizeErrorDetails('string')).toBe('string');
            expect(ErrorUtil.sanitizeErrorDetails(123)).toBe(123);
            expect(ErrorUtil.sanitizeErrorDetails(null)).toBeNull();
        });
    });

    describe('logError', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should log error with context', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const error = new Error('Test error');
            ErrorUtil.logError(error, 'Test Context');

            expect(consoleSpy).toHaveBeenCalledWith(
                '[ERROR] Test Context: Test error',
                expect.objectContaining({
                    error: expect.any(Object),
                    timestamp: expect.any(String)
                })
            );

            consoleSpy.mockRestore();
        });

        it('should log error without context', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            ErrorUtil.logError('Simple error message');

            expect(consoleSpy).toHaveBeenCalledWith(
                '[ERROR] Simple error message',
                expect.any(Object)
            );

            consoleSpy.mockRestore();
        });
    });
});

describe('Error convenience functions', () => {
    describe('fromJoiError', () => {
        it('should create validation error from Joi error', () => {
            const joiError = { details: [{ path: ['test'], message: 'Test error' }] };
            const response = fromJoiError(joiError);
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('VALIDATION_ERROR');
        });
    });

    describe('notFoundError', () => {
        it('should create not found error', () => {
            const response = notFoundError('User', '123');
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('RESOURCE_NOT_FOUND');
        });
    });

    describe('getErrorMessage', () => {
        it('should extract error message', () => {
            const message = getErrorMessage(new Error('Test error'));
            expect(message).toBe('Test error');
        });
    });

    describe('logError', () => {
        it('should log error', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            logError('Test error', 'Context');
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
