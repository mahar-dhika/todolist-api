/**
 * Route Mapping Tests
 * 
 * Tests to verify that all routes are properly configured with correct
 * HTTP methods, paths, validation middleware, and controller handlers.
 */

import express from 'express';
import request from 'supertest';
import { createApiRoutes } from '../../src/api/routes/api.routes';
import { createListRoutes } from '../../src/api/routes/list.routes';
import { createTaskRoutes } from '../../src/api/routes/task.routes';

describe('Route Mappings', () => {
    let app: express.Application;
    let globalApp: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Create a global app with all routes for cross-route tests
        globalApp = express();
        globalApp.use(express.json());
        globalApp.use('/api/lists', createListRoutes());
        globalApp.use('/api/tasks', createTaskRoutes());
    });

    describe('List Routes', () => {
        beforeEach(() => {
            app.use('/api/lists', createListRoutes());
        });

        describe('GET /api/lists', () => {
            it('should accept valid requests', async () => {
                const response = await request(app)
                    .get('/api/lists')
                    .expect(200);

                expect(response.body.success).toBe(true);
            });

            it('should accept includeTaskCount query parameter', async () => {
                const response = await request(app)
                    .get('/api/lists?includeTaskCount=false')
                    .expect(200);

                expect(response.body.success).toBe(true);
            });

            it('should reject invalid query parameters', async () => {
                const response = await request(app)
                    .get('/api/lists?includeTaskCount=invalid')
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('VALIDATION_ERROR');
            });
        });

        describe('POST /api/lists', () => {
            it('should accept valid list creation requests', async () => {
                const response = await request(app)
                    .post('/api/lists')
                    .send({ name: 'Test List' })
                    .expect(201);

                expect(response.body.success).toBe(true);
                expect(response.body.data.name).toBe('Test List');
            });

            it('should reject requests without name', async () => {
                const response = await request(app)
                    .post('/api/lists')
                    .send({})
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('VALIDATION_ERROR');
            });

            it('should reject requests with empty name', async () => {
                const response = await request(app)
                    .post('/api/lists')
                    .send({ name: '' })
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('VALIDATION_ERROR');
            });

            it('should reject requests with name too long', async () => {
                const response = await request(app)
                    .post('/api/lists')
                    .send({ name: 'x'.repeat(101) })
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('VALIDATION_ERROR');
            });
        });

        describe('GET /api/lists/:id', () => {
            it('should reject invalid UUID format', async () => {
                const response = await request(app)
                    .get('/api/lists/invalid-uuid')
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('VALIDATION_ERROR');
            });

            it('should accept valid UUID format', async () => {
                const response = await request(app)
                    .get('/api/lists/550e8400-e29b-41d4-a716-446655440000')
                    .expect(404); // List doesn't exist, but UUID validation passes

                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('LIST_NOT_FOUND');
            });
        });

        describe('PUT /api/lists/:id', () => {
            it('should reject invalid UUID format', async () => {
                const response = await request(app)
                    .put('/api/lists/invalid-uuid')
                    .send({ name: 'Updated List' })
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('VALIDATION_ERROR');
            });

            it('should reject invalid body data', async () => {
                const response = await request(app)
                    .put('/api/lists/550e8400-e29b-41d4-a716-446655440000')
                    .send({ name: '' })
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('VALIDATION_ERROR');
            });
        });

        describe('DELETE /api/lists/:id', () => {
            it('should reject invalid UUID format', async () => {
                const response = await request(app)
                    .delete('/api/lists/invalid-uuid')
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('VALIDATION_ERROR');
            });
        });
    });

    describe('Task Routes', () => {
        beforeEach(() => {
            app.use('/api/tasks', createTaskRoutes());
        });

        describe('POST /api/tasks', () => {
            it('should accept valid task creation requests', async () => {
                // Generate a valid UUID for the test - using crypto.randomUUID for a real UUID
                const { randomUUID } = require('crypto');
                const validUuid = randomUUID();

                const response = await request(app)
                    .post('/api/tasks')
                    .send({
                        title: 'Test Task',
                        listId: validUuid
                    });

                // The request should be well-formed and reach the controller
                // It may return 404 (list not found) which is fine for route mapping tests
                expect([201, 404]).toContain(response.status);
                if (response.status === 404) {
                    expect(response.body.success).toBe(false);
                    expect(response.body.error.code).toBe('LIST_NOT_FOUND');
                } else {
                    expect(response.body.success).toBe(true);
                    expect(response.body.data.title).toBe('Test Task');
                }
            });

            it('should reject requests without required fields', async () => {
                const response = await request(app)
                    .post('/api/tasks')
                    .send({})
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('VALIDATION_ERROR');
            });
        });

        describe('GET /api/tasks', () => {
            it('should accept valid query parameters', async () => {
                const response = await request(app)
                    .get('/api/tasks?status=pending&sortBy=title&sortOrder=asc')
                    .expect(200);

                expect(response.body.success).toBe(true);
            });

            it('should reject invalid status values', async () => {
                const response = await request(app)
                    .get('/api/tasks?status=invalid')
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('VALIDATION_ERROR');
            });
        });

        describe('GET /api/tasks/due-this-week', () => {
            it('should accept valid requests', async () => {
                const response = await request(app)
                    .get('/api/tasks/due-this-week')
                    .expect(200);

                expect(response.body.success).toBe(true);
            });

            it('should accept valid query parameters', async () => {
                const response = await request(app)
                    .get('/api/tasks/due-this-week?sortBy=deadline&sortOrder=asc');

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                // Should return empty array since no tasks exist
                expect(Array.isArray(response.body.data)).toBe(true);
            });
        });

        describe('GET /api/tasks/lists/:listId/tasks', () => {
            it('should reject invalid UUID format', async () => {
                const response = await request(app)
                    .get('/api/tasks/lists/invalid-uuid/tasks')
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('VALIDATION_ERROR');
            });
        });

        describe('PUT /api/tasks/:id', () => {
            it('should reject invalid UUID format', async () => {
                const response = await request(app)
                    .put('/api/tasks/invalid-uuid')
                    .send({ title: 'Updated Task' })
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('VALIDATION_ERROR');
            });
        });

        describe('DELETE /api/tasks/:id', () => {
            it('should reject invalid UUID format', async () => {
                const response = await request(app)
                    .delete('/api/tasks/invalid-uuid')
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('VALIDATION_ERROR');
            });
        });

        describe('PATCH /api/tasks/:id/toggle', () => {
            it('should reject invalid UUID format', async () => {
                const response = await request(app)
                    .patch('/api/tasks/invalid-uuid/toggle')
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('VALIDATION_ERROR');
            });
        });
    });

    describe('API Routes Integration', () => {
        beforeEach(() => {
            app.use('/api', createApiRoutes());
        });

        it('should mount list routes correctly', async () => {
            const response = await request(app)
                .get('/api/lists')
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        it('should mount task routes correctly', async () => {
            const response = await request(app)
                .get('/api/tasks')
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        it('should handle 404 for unknown routes', async () => {
            const response = await request(app)
                .get('/api/unknown')
                .expect(404);
        });
    });
});
