import { IApiMeta } from '../../src/models/interfaces/api.interface';
import {
    errorResponse,
    notFoundResponse,
    ResponseUtil,
    successResponse,
    validationErrorResponse
} from '../../src/utils/response.util';

describe('ResponseUtil', () => {
    describe('success', () => {
        it('should create successful response without data', () => {
            const response = ResponseUtil.success();
            expect(response.success).toBe(true);
            expect(response.data).toBeUndefined();
            expect(response.error).toBeUndefined();
        });

        it('should create successful response with data', () => {
            const data = { id: '1', name: 'Test' };
            const response = ResponseUtil.success(data);
            expect(response.success).toBe(true);
            expect(response.data).toEqual(data);
            expect(response.error).toBeUndefined();
        });

        it('should create successful response with meta', () => {
            const data = { id: '1' };
            const meta: IApiMeta = { version: '1.0' };
            const response = ResponseUtil.success(data, meta);
            expect(response.success).toBe(true);
            expect(response.data).toEqual(data);
            expect(response.meta).toEqual(meta);
        });
    });

    describe('error', () => {
        it('should create error response', () => {
            const response = ResponseUtil.error('TEST_ERROR', 'Test error message');
            expect(response.success).toBe(false);
            expect(response.data).toBeUndefined();
            expect(response.error).toBeDefined();
            expect(response.error!.code).toBe('TEST_ERROR');
            expect(response.error!.message).toBe('Test error message');
            expect(response.error!.timestamp).toBeDefined();
        });

        it('should create error response with details', () => {
            const details = { field: 'name', value: 'invalid' };
            const response = ResponseUtil.error('VALIDATION_ERROR', 'Validation failed', details);
            expect(response.error!.details).toEqual(details);
        });
    });

    describe('validationError', () => {
        it('should create validation error response', () => {
            const details = [{ field: 'name', message: 'Required' }];
            const response = ResponseUtil.validationError('Validation failed', details);
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('VALIDATION_ERROR');
            expect(response.error!.message).toBe('Validation failed');
            expect(response.error!.details).toEqual(details);
        });
    });

    describe('notFound', () => {
        it('should create not found response without ID', () => {
            const response = ResponseUtil.notFound('User');
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('RESOURCE_NOT_FOUND');
            expect(response.error!.message).toBe('User not found');
        });

        it('should create not found response with ID', () => {
            const response = ResponseUtil.notFound('User', '123');
            expect(response.error!.message).toBe("User with ID '123' not found");
        });
    });

    describe('conflict', () => {
        it('should create conflict response', () => {
            const response = ResponseUtil.conflict('Resource already exists');
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('RESOURCE_CONFLICT');
            expect(response.error!.message).toBe('Resource already exists');
        });

        it('should create conflict response with details', () => {
            const details = { existingId: '123' };
            const response = ResponseUtil.conflict('Name already exists', details);
            expect(response.error!.details).toEqual(details);
        });
    });

    describe('serverError', () => {
        it('should create server error response with default message', () => {
            const response = ResponseUtil.serverError();
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('INTERNAL_SERVER_ERROR');
            expect(response.error!.message).toBe('An internal server error occurred');
        });

        it('should create server error response with custom message', () => {
            const response = ResponseUtil.serverError('Database connection failed');
            expect(response.error!.message).toBe('Database connection failed');
        });
    });

    describe('badRequest', () => {
        it('should create bad request response', () => {
            const response = ResponseUtil.badRequest('Invalid input');
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('BAD_REQUEST');
            expect(response.error!.message).toBe('Invalid input');
        });
    });

    describe('unauthorized', () => {
        it('should create unauthorized response with default message', () => {
            const response = ResponseUtil.unauthorized();
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('UNAUTHORIZED');
            expect(response.error!.message).toBe('Unauthorized access');
        });

        it('should create unauthorized response with custom message', () => {
            const response = ResponseUtil.unauthorized('Invalid token');
            expect(response.error!.message).toBe('Invalid token');
        });
    });

    describe('forbidden', () => {
        it('should create forbidden response', () => {
            const response = ResponseUtil.forbidden();
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('FORBIDDEN');
            expect(response.error!.message).toBe('Access forbidden');
        });
    });

    describe('paginated', () => {
        it('should create paginated response', () => {
            const data = [{ id: '1' }, { id: '2' }];
            const response = ResponseUtil.paginated(data, 10, 1, 5);

            expect(response.success).toBe(true);
            expect(response.data).toEqual(data);
            expect(response.meta).toBeDefined();
            expect(response.meta!.total).toBe(10);
            expect(response.meta!.count).toBe(2);
            expect(response.meta!.page).toBe(1);
            expect(response.meta!.totalPages).toBe(2);
            expect(response.meta!.limit).toBe(5);
        });

        it('should calculate pagination correctly', () => {
            const data: any[] = [];
            const response = ResponseUtil.paginated(data, 7, 2, 3);

            expect(response.meta!.totalPages).toBe(3); // Math.ceil(7/3)
            expect(response.meta!.page).toBe(2);
            expect(response.meta!.limit).toBe(3);
        });
    });

    describe('created', () => {
        it('should create created response', () => {
            const data = { id: '1', name: 'Test' };
            const response = ResponseUtil.created(data, '1');

            expect(response.success).toBe(true);
            expect(response.data).toEqual(data);
            expect(response.meta).toBeDefined();
            expect(response.meta!.version).toBe('1.0');
        });
    });

    describe('updated', () => {
        it('should create updated response', () => {
            const data = { id: '1', name: 'Updated' };
            const response = ResponseUtil.updated(data, '1');

            expect(response.success).toBe(true);
            expect(response.data).toEqual(data);
            expect(response.meta!.version).toBe('1.0');
        });
    });

    describe('deleted', () => {
        it('should create deleted response', () => {
            const response = ResponseUtil.deleted('1');

            expect(response.success).toBe(true);
            expect(response.data).toBeUndefined();
            expect(response.meta!.version).toBe('1.0');
        });
    });
});

describe('Response convenience functions', () => {
    describe('successResponse', () => {
        it('should create successful response', () => {
            const data = { test: true };
            const response = successResponse(data);
            expect(response.success).toBe(true);
            expect(response.data).toEqual(data);
        });
    });

    describe('errorResponse', () => {
        it('should create error response', () => {
            const response = errorResponse('TEST_ERROR', 'Test message');
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('TEST_ERROR');
        });
    });

    describe('notFoundResponse', () => {
        it('should create not found response', () => {
            const response = notFoundResponse('User', '123');
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('RESOURCE_NOT_FOUND');
        });
    });

    describe('validationErrorResponse', () => {
        it('should create validation error response', () => {
            const response = validationErrorResponse('Invalid data');
            expect(response.success).toBe(false);
            expect(response.error!.code).toBe('VALIDATION_ERROR');
        });
    });
});
