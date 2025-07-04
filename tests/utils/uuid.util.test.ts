import { UuidUtil, generateUuid, isValidUuid, validateUuid } from '../../src/utils/uuid.util';

describe('UuidUtil', () => {
    describe('generate', () => {
        it('should generate a valid UUID v4', () => {
            const uuid = UuidUtil.generate();
            expect(typeof uuid).toBe('string');
            expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });

        it('should generate unique UUIDs', () => {
            const uuid1 = UuidUtil.generate();
            const uuid2 = UuidUtil.generate();
            expect(uuid1).not.toBe(uuid2);
        });
    });

    describe('isValid', () => {
        it('should return true for valid UUID', () => {
            const validUuid = '550e8400-e29b-41d4-a716-446655440000';
            expect(UuidUtil.isValid(validUuid)).toBe(true);
        });

        it('should return false for invalid UUID', () => {
            expect(UuidUtil.isValid('invalid-uuid')).toBe(false);
            expect(UuidUtil.isValid('')).toBe(false);
            expect(UuidUtil.isValid('123')).toBe(false);
        });

        it('should return false for non-string input', () => {
            expect(UuidUtil.isValid(null as any)).toBe(false);
            expect(UuidUtil.isValid(undefined as any)).toBe(false);
            expect(UuidUtil.isValid(123 as any)).toBe(false);
        });
    });

    describe('validateOrThrow', () => {
        it('should not throw for valid UUID', () => {
            const validUuid = '550e8400-e29b-41d4-a716-446655440000';
            expect(() => UuidUtil.validateOrThrow(validUuid)).not.toThrow();
        });

        it('should throw for invalid UUID', () => {
            expect(() => UuidUtil.validateOrThrow('invalid-uuid')).toThrow('Invalid UUID: invalid-uuid');
        });

        it('should throw with custom field name', () => {
            expect(() => UuidUtil.validateOrThrow('invalid', 'listId')).toThrow('Invalid listId: invalid');
        });
    });

    describe('normalize', () => {
        it('should convert UUID to lowercase', () => {
            const upperUuid = '550E8400-E29B-41D4-A716-446655440000';
            const result = UuidUtil.normalize(upperUuid);
            expect(result).toBe('550e8400-e29b-41d4-a716-446655440000');
        });

        it('should throw for invalid UUID', () => {
            expect(() => UuidUtil.normalize('invalid')).toThrow();
        });
    });

    describe('generateMultiple', () => {
        it('should generate multiple UUIDs', () => {
            const uuids = UuidUtil.generateMultiple(3);
            expect(uuids).toHaveLength(3);
            expect(new Set(uuids)).toHaveProperty('size', 3); // All unique
            uuids.forEach(uuid => {
                expect(UuidUtil.isValid(uuid)).toBe(true);
            });
        });

        it('should return empty array for zero or negative count', () => {
            expect(UuidUtil.generateMultiple(0)).toEqual([]);
            expect(UuidUtil.generateMultiple(-1)).toEqual([]);
        });
    });
});

describe('UUID convenience functions', () => {
    describe('generateUuid', () => {
        it('should generate a valid UUID', () => {
            const uuid = generateUuid();
            expect(isValidUuid(uuid)).toBe(true);
        });
    });

    describe('isValidUuid', () => {
        it('should validate UUID correctly', () => {
            const validUuid = generateUuid();
            expect(isValidUuid(validUuid)).toBe(true);
            expect(isValidUuid('invalid')).toBe(false);
        });
    });

    describe('validateUuid', () => {
        it('should validate without throwing for valid UUID', () => {
            const validUuid = generateUuid();
            expect(() => validateUuid(validUuid)).not.toThrow();
        });

        it('should throw for invalid UUID', () => {
            expect(() => validateUuid('invalid')).toThrow();
        });
    });
});
