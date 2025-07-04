import express from 'express';
import request from 'supertest';
import { createTaskRoutes } from './dist/src/api/routes/task.routes.js';

async function debugTest() {
    const app = express();
    app.use(express.json());
    app.use('/api/tasks', createTaskRoutes());

    const validUuid = '123e4567-e89b-12d3-a456-426614174000';

    try {
        const response = await request(app)
            .post('/api/tasks')
            .send({
                title: 'Test Task',
                listId: validUuid
            });

        console.log('Status:', response.status);
        console.log('Body:', JSON.stringify(response.body, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugTest();
