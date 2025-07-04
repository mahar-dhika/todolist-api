import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

/**
 * UUID generation and validation utilities
 */
export class UuidUtil {
    /**
     * Generate a new UUID v4
     * @returns A new UUID string
     */
    static generate(): string {
        return uuidv4();
    }

    /**
     * Validate if a string is a valid UUID
     * @param uuid - The string to validate
     * @returns True if valid UUID, false otherwise
     */
    static isValid(uuid: string): boolean {
        if (!uuid || typeof uuid !== 'string') {
            return false;
        }
        return uuidValidate(uuid);
    }

    /**
     * Validate UUID and throw error if invalid
     * @param uuid - The UUID to validate
     * @param fieldName - Name of the field for error message
     * @throws Error if UUID is invalid
     */
    static validateOrThrow(uuid: string, fieldName: string = 'UUID'): void {
        if (!this.isValid(uuid)) {
            throw new Error(`Invalid ${fieldName}: ${uuid}`);
        }
    }

    /**
     * Normalize UUID to lowercase
     * @param uuid - The UUID to normalize
     * @returns Lowercase UUID string
     */
    static normalize(uuid: string): string {
        this.validateOrThrow(uuid);
        return uuid.toLowerCase();
    }

    /**
     * Generate multiple UUIDs
     * @param count - Number of UUIDs to generate
     * @returns Array of UUID strings
     */
    static generateMultiple(count: number): string[] {
        if (count <= 0) {
            return [];
        }
        return Array.from({ length: count }, () => this.generate());
    }
}

/**
 * Convenience functions for common UUID operations
 */

/**
 * Generate a new UUID v4
 * @returns A new UUID string
 */
export const generateUuid = (): string => UuidUtil.generate();

/**
 * Validate if a string is a valid UUID
 * @param uuid - The string to validate
 * @returns True if valid UUID, false otherwise
 */
export const isValidUuid = (uuid: string): boolean => UuidUtil.isValid(uuid);

/**
 * Validate UUID and throw error if invalid
 * @param uuid - The UUID to validate
 * @param fieldName - Name of the field for error message
 * @throws Error if UUID is invalid
 */
export const validateUuid = (uuid: string, fieldName?: string): void =>
    UuidUtil.validateOrThrow(uuid, fieldName);
