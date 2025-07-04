import { SortOrder, TaskSortBy } from '../../src/models/enums/task-sort.enum';
import { ValidationError, ValidationService } from '../../src/services/validation.service';

describe('ValidationService', () => {

    describe('UUID Validation', () => {
        test('should validate valid UUID v4', async () => {
            const validUuid = '550e8400-e29b-41d4-a716-446655440000';
            const result = await ValidationService.validateUuid(validUuid);
            expect(result).toBe(validUuid);
        });

        test('should reject invalid UUID', async () => {
            const invalidUuid = 'invalid-uuid';
            await expect(ValidationService.validateUuid(invalidUuid))
                .rejects.toThrow(ValidationError);
        });

        test('should reject empty UUID', async () => {
            await expect(ValidationService.validateUuid(''))
                .rejects.toThrow(ValidationError);
        });

        test('should reject UUID v1', async () => {
            const uuidV1 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
            await expect(ValidationService.validateUuid(uuidV1))
                .rejects.toThrow(ValidationError);
        });
    });

    describe('List Validation', () => {
        describe('Create List', () => {
            test('should validate valid list creation data', async () => {
                const validData = {
                    name: 'My Todo List',
                    description: 'A list for my daily tasks'
                };

                const result = await ValidationService.validateCreateList(validData);
                expect(result).toEqual(validData);
            });

            test('should validate list without description', async () => {
                const validData = {
                    name: 'My Todo List'
                };

                const result = await ValidationService.validateCreateList(validData);
                expect(result).toEqual(validData);
            });

            test('should trim whitespace from name and description', async () => {
                const dataWithWhitespace = {
                    name: '  My Todo List  ',
                    description: '  A description with spaces  '
                };

                const result = await ValidationService.validateCreateList(dataWithWhitespace);
                expect(result.name).toBe('My Todo List');
                expect(result.description).toBe('A description with spaces');
            });

            test('should reject empty name', async () => {
                const invalidData = {
                    name: '',
                    description: 'Valid description'
                };

                await expect(ValidationService.validateCreateList(invalidData))
                    .rejects.toThrow(ValidationError);
            });

            test('should reject name longer than 100 characters', async () => {
                const invalidData = {
                    name: 'a'.repeat(101),
                    description: 'Valid description'
                };

                await expect(ValidationService.validateCreateList(invalidData))
                    .rejects.toThrow(ValidationError);
            });

            test('should reject description longer than 500 characters', async () => {
                const invalidData = {
                    name: 'Valid name',
                    description: 'a'.repeat(501)
                };

                await expect(ValidationService.validateCreateList(invalidData))
                    .rejects.toThrow(ValidationError);
            });

            test('should reject missing name', async () => {
                const invalidData = {
                    description: 'Valid description'
                };

                await expect(ValidationService.validateCreateList(invalidData))
                    .rejects.toThrow(ValidationError);
            });

            test('should strip unknown fields', async () => {
                const dataWithExtra = {
                    name: 'Valid name',
                    description: 'Valid description',
                    extraField: 'should be removed'
                };

                const result = await ValidationService.validateCreateList(dataWithExtra);
                expect(result).not.toHaveProperty('extraField');
            });
        });

        describe('Update List', () => {
            test('should validate valid list update data', async () => {
                const validData = {
                    name: 'Updated List Name',
                    description: 'Updated description'
                };

                const result = await ValidationService.validateUpdateList(validData);
                expect(result).toEqual(validData);
            });

            test('should validate update with only name', async () => {
                const validData = {
                    name: 'Updated Name'
                };

                const result = await ValidationService.validateUpdateList(validData);
                expect(result).toEqual(validData);
            });

            test('should validate update with only description', async () => {
                const validData = {
                    description: 'Updated description'
                };

                const result = await ValidationService.validateUpdateList(validData);
                expect(result).toEqual(validData);
            });

            test('should reject empty update object', async () => {
                await expect(ValidationService.validateUpdateList({}))
                    .rejects.toThrow(ValidationError);
            });

            test('should reject update with empty name', async () => {
                const invalidData = {
                    name: ''
                };

                await expect(ValidationService.validateUpdateList(invalidData))
                    .rejects.toThrow(ValidationError);
            });
        });
    });

    describe('Task Validation', () => {
        describe('Create Task', () => {
            test('should validate valid task creation data', async () => {
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 7);

                const validData = {
                    title: 'Complete project',
                    description: 'Finish the todo list API',
                    deadline: futureDate
                };

                const result = await ValidationService.validateCreateTask(validData);
                expect(result.title).toBe(validData.title);
                expect(result.description).toBe(validData.description);
                expect(result.deadline).toEqual(futureDate);
            });

            test('should validate task without optional fields', async () => {
                const validData = {
                    title: 'Simple task'
                };

                const result = await ValidationService.validateCreateTask(validData);
                expect(result).toEqual(validData);
            });

            test('should validate task with ISO date string deadline', async () => {
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 7);

                const validData = {
                    title: 'Task with string deadline',
                    deadline: futureDate.toISOString()
                };

                const result = await ValidationService.validateCreateTask(validData);
                expect(result.title).toBe(validData.title);
                expect(result.deadline).toEqual(futureDate);
            });

            test('should reject empty title', async () => {
                const invalidData = {
                    title: '',
                    description: 'Valid description'
                };

                await expect(ValidationService.validateCreateTask(invalidData))
                    .rejects.toThrow(ValidationError);
            });

            test('should reject title longer than 200 characters', async () => {
                const invalidData = {
                    title: 'a'.repeat(201)
                };

                await expect(ValidationService.validateCreateTask(invalidData))
                    .rejects.toThrow(ValidationError);
            });

            test('should reject description longer than 1000 characters', async () => {
                const invalidData = {
                    title: 'Valid title',
                    description: 'a'.repeat(1001)
                };

                await expect(ValidationService.validateCreateTask(invalidData))
                    .rejects.toThrow(ValidationError);
            });

            test('should reject past deadline date', async () => {
                const pastDate = new Date();
                pastDate.setDate(pastDate.getDate() - 1);

                const invalidData = {
                    title: 'Valid title',
                    deadline: pastDate
                };

                await expect(ValidationService.validateCreateTask(invalidData))
                    .rejects.toThrow(ValidationError);
            });

            test('should reject past deadline ISO string', async () => {
                const pastDate = new Date();
                pastDate.setDate(pastDate.getDate() - 1);

                const invalidData = {
                    title: 'Valid title',
                    deadline: pastDate.toISOString()
                };

                await expect(ValidationService.validateCreateTask(invalidData))
                    .rejects.toThrow(ValidationError);
            });

            test('should reject missing title', async () => {
                const invalidData = {
                    description: 'Valid description'
                };

                await expect(ValidationService.validateCreateTask(invalidData))
                    .rejects.toThrow(ValidationError);
            });
        });

        describe('Update Task', () => {
            test('should validate valid task update data', async () => {
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 7);

                const validData = {
                    title: 'Updated task',
                    description: 'Updated description',
                    deadline: futureDate,
                    completed: true
                };

                const result = await ValidationService.validateUpdateTask(validData);
                expect(result).toEqual(validData);
            });

            test('should validate update with only title', async () => {
                const validData = {
                    title: 'Updated title'
                };

                const result = await ValidationService.validateUpdateTask(validData);
                expect(result).toEqual(validData);
            });

            test('should validate update with only completed status', async () => {
                const validData = {
                    completed: true
                };

                const result = await ValidationService.validateUpdateTask(validData);
                expect(result).toEqual(validData);
            });

            test('should reject empty update object', async () => {
                await expect(ValidationService.validateUpdateTask({}))
                    .rejects.toThrow(ValidationError);
            });

            test('should reject invalid completed value', async () => {
                const invalidData = {
                    completed: 'not-a-boolean'
                };

                await expect(ValidationService.validateUpdateTask(invalidData))
                    .rejects.toThrow(ValidationError);
            });
        });
    });

    describe('Task Query Validation', () => {
        test('should validate valid query parameters', async () => {
            const validQuery = {
                listId: '550e8400-e29b-41d4-a716-446655440000',
                includeCompleted: true,
                sortBy: TaskSortBy.DEADLINE,
                order: SortOrder.ASC,
                limit: 50,
                offset: 10
            };

            const result = await ValidationService.validateTaskQuery(validQuery);
            expect(result).toEqual(validQuery);
        });

        test('should apply default values', async () => {
            const emptyQuery = {};

            const result = await ValidationService.validateTaskQuery(emptyQuery);
            expect(result.includeCompleted).toBe(true);
            expect(result.sortBy).toBe(TaskSortBy.CREATED_AT);
            expect(result.order).toBe(SortOrder.DESC);
            expect(result.limit).toBe(100);
            expect(result.offset).toBe(0);
        });

        test('should validate date range parameters', async () => {
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const validQuery = {
                deadlineFrom: today.toISOString(),
                deadlineTo: tomorrow.toISOString()
            };

            const result = await ValidationService.validateTaskQuery(validQuery);
            expect(result.deadlineFrom).toEqual(today);
            expect(result.deadlineTo).toEqual(tomorrow);
        });

        test('should reject invalid listId UUID', async () => {
            const invalidQuery = {
                listId: 'invalid-uuid'
            };

            await expect(ValidationService.validateTaskQuery(invalidQuery))
                .rejects.toThrow(ValidationError);
        });

        test('should reject invalid sortBy value', async () => {
            const invalidQuery = {
                sortBy: 'invalid-sort-field'
            };

            await expect(ValidationService.validateTaskQuery(invalidQuery))
                .rejects.toThrow(ValidationError);
        });

        test('should reject invalid order value', async () => {
            const invalidQuery = {
                order: 'invalid-order'
            };

            await expect(ValidationService.validateTaskQuery(invalidQuery))
                .rejects.toThrow(ValidationError);
        });

        test('should reject limit exceeding maximum', async () => {
            const invalidQuery = {
                limit: 1001
            };

            await expect(ValidationService.validateTaskQuery(invalidQuery))
                .rejects.toThrow(ValidationError);
        });

        test('should reject negative offset', async () => {
            const invalidQuery = {
                offset: -1
            };

            await expect(ValidationService.validateTaskQuery(invalidQuery))
                .rejects.toThrow(ValidationError);
        });

        test('should reject when deadlineFrom is after deadlineTo', async () => {
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const invalidQuery = {
                deadlineFrom: today.toISOString(),
                deadlineTo: yesterday.toISOString()
            };

            await expect(ValidationService.validateTaskQuery(invalidQuery))
                .rejects.toThrow(ValidationError);
        });

        test('should reject invalid date format', async () => {
            const invalidQuery = {
                deadlineFrom: 'not-a-date'
            };

            await expect(ValidationService.validateTaskQuery(invalidQuery))
                .rejects.toThrow(ValidationError);
        });
    });

    describe('ValidationError', () => {
        test('should create ValidationError with message and details', () => {
            const errors = [
                { field: 'name', message: 'Name is required' },
                { field: 'email', message: 'Invalid email format' }
            ];

            const error = new ValidationError('Validation failed', errors);

            expect(error.name).toBe('ValidationError');
            expect(error.message).toBe('Validation failed');
            expect(error.isValidationError).toBe(true);
            expect(error.errors).toEqual(errors);
        });

        test('should create ValidationError with empty errors array', () => {
            const error = new ValidationError('Simple validation error');

            expect(error.errors).toEqual([]);
        });
    });

    describe('Error Handling', () => {
        test('should provide detailed error information', async () => {
            const invalidData = {
                name: '', // too short
                description: 'a'.repeat(501) // too long
            };

            try {
                await ValidationService.validateCreateList(invalidData);
                fail('Should have thrown ValidationError');
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                const validationError = error as ValidationError;
                expect(validationError.errors).toHaveLength(2);
                expect(validationError.errors.some(e => e.field === 'name')).toBe(true);
                expect(validationError.errors.some(e => e.field === 'description')).toBe(true);
            }
        });

        test('should not abort early and return all validation errors', async () => {
            const invalidData = {
                name: 'a'.repeat(101), // too long
                description: 'a'.repeat(501) // too long
            };

            try {
                await ValidationService.validateCreateList(invalidData);
                fail('Should have thrown ValidationError');
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                const validationError = error as ValidationError;
                expect(validationError.errors.length).toBeGreaterThan(1);
            }
        });
    });
});
