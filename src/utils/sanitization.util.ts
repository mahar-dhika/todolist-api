/**
 * Input sanitization utilities for security and data validation
 */
export class SanitizationUtil {
    /**
     * Remove HTML tags from a string
     * @param input - Input string to sanitize
     * @returns String with HTML tags removed
     */
    static stripHtml(input: string): string {
        if (typeof input !== 'string') {
            return '';
        }
        return input.replace(/<[^>]*>/g, '');
    }

    /**
     * Sanitize string input by trimming and removing dangerous characters
     * @param input - Input string to sanitize
     * @param maxLength - Maximum allowed length (optional)
     * @returns Sanitized string
     */
    static sanitizeString(input: string, maxLength?: number): string {
        if (typeof input !== 'string') {
            return '';
        }

        let sanitized = input
            .trim()
            .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
            .replace(/[<>]/g, ''); // Remove potential HTML tags

        if (maxLength && sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }

        return sanitized;
    }

    /**
     * Sanitize object by cleaning all string properties
     * @param obj - Object to sanitize
     * @param maxStringLength - Maximum length for string properties
     * @returns Sanitized object
     */
    static sanitizeObject<T>(obj: T, maxStringLength: number = 1000): T {
        if (obj === null || obj === undefined) {
            return obj;
        }

        // Handle strings directly
        if (typeof obj === 'string') {
            return this.sanitizeString(obj, maxStringLength) as unknown as T;
        }

        // Handle non-objects
        if (typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item, maxStringLength)) as unknown as T;
        }

        const sanitized = {} as T;

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                (sanitized as any)[key] = this.sanitizeString(value, maxStringLength);
            } else if (typeof value === 'object' && value !== null) {
                (sanitized as any)[key] = this.sanitizeObject(value, maxStringLength);
            } else {
                (sanitized as any)[key] = value;
            }
        }

        return sanitized;
    }

    /**
     * Validate and sanitize email address
     * @param email - Email address to validate
     * @returns Sanitized email or null if invalid
     */
    static sanitizeEmail(email: string): string | null {
        if (typeof email !== 'string') {
            return null;
        }

        const sanitized = email.trim().toLowerCase();

        // Basic email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(sanitized)) {
            return null;
        }

        return sanitized;
    }

    /**
     * Sanitize and validate URL
     * @param url - URL to validate
     * @param allowedProtocols - Allowed protocols (default: http, https)
     * @returns Sanitized URL or null if invalid
     */
    static sanitizeUrl(
        url: string,
        allowedProtocols: string[] = ['http', 'https']
    ): string | null {
        if (typeof url !== 'string') {
            return null;
        }

        const sanitized = url.trim();

        try {
            const urlObj = new URL(sanitized);

            if (!allowedProtocols.includes(urlObj.protocol.slice(0, -1))) {
                return null;
            }

            return urlObj.toString();
        } catch {
            return null;
        }
    }

    /**
     * Sanitize filename by removing dangerous characters
     * @param filename - Filename to sanitize
     * @param maxLength - Maximum filename length
     * @returns Sanitized filename
     */
    static sanitizeFilename(filename: string, maxLength: number = 255): string {
        if (typeof filename !== 'string') {
            return '';
        }

        // Remove dangerous characters and paths
        let sanitized = filename
            .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Windows/Unix dangerous chars
            .replace(/^\.+/, '') // Remove leading dots
            .replace(/\.+$/, '') // Remove trailing dots
            .trim();

        // Prevent reserved Windows filenames
        const reservedNames = [
            'CON', 'PRN', 'AUX', 'NUL',
            'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
            'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
        ];

        // Check if the base name (without extension) is reserved
        const baseName = sanitized.split('.')[0].toUpperCase();
        if (reservedNames.includes(baseName)) {
            sanitized = `file_${sanitized}`;
        }

        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }

        return sanitized;
    }

    /**
     * Sanitize numeric input
     * @param input - Input to convert to number
     * @param min - Minimum allowed value
     * @param max - Maximum allowed value
     * @returns Sanitized number or null if invalid
     */
    static sanitizeNumber(
        input: any,
        min?: number,
        max?: number
    ): number | null {
        const num = Number(input);

        if (isNaN(num) || !isFinite(num)) {
            return null;
        }

        if (min !== undefined && num < min) {
            return null;
        }

        if (max !== undefined && num > max) {
            return null;
        }

        return num;
    }

    /**
     * Sanitize integer input
     * @param input - Input to convert to integer
     * @param min - Minimum allowed value
     * @param max - Maximum allowed value
     * @returns Sanitized integer or null if invalid
     */
    static sanitizeInteger(
        input: any,
        min?: number,
        max?: number
    ): number | null {
        const num = this.sanitizeNumber(input, min, max);

        if (num === null) {
            return null;
        }

        const int = Math.floor(num);

        if (min !== undefined && int < min) {
            return null;
        }

        if (max !== undefined && int > max) {
            return null;
        }

        return int;
    }

    /**
     * Sanitize boolean input
     * @param input - Input to convert to boolean
     * @returns Boolean value or null if invalid
     */
    static sanitizeBoolean(input: any): boolean | null {
        if (typeof input === 'boolean') {
            return input;
        }

        if (typeof input === 'string') {
            const lower = input.toLowerCase().trim();
            if (lower === 'true' || lower === '1' || lower === 'yes') {
                return true;
            }
            if (lower === 'false' || lower === '0' || lower === 'no') {
                return false;
            }
        }

        if (typeof input === 'number') {
            return input !== 0;
        }

        return null;
    }

    /**
     * Sanitize date input
     * @param input - Input to convert to date
     * @param allowPast - Whether past dates are allowed
     * @param allowFuture - Whether future dates are allowed
     * @returns Date object or null if invalid
     */
    static sanitizeDate(
        input: any,
        allowPast: boolean = true,
        allowFuture: boolean = true
    ): Date | null {
        let date: Date;

        if (input instanceof Date) {
            date = input;
        } else if (typeof input === 'string' || typeof input === 'number') {
            date = new Date(input);
        } else {
            return null;
        }

        if (isNaN(date.getTime())) {
            return null;
        }

        const now = new Date();

        if (!allowPast && date < now) {
            return null;
        }

        if (!allowFuture && date > now) {
            return null;
        }

        return date;
    }

    /**
     * Remove null and undefined values from an object
     * @param obj - Object to clean
     * @returns Object with null/undefined values removed
     */
    static removeNullValues<T>(obj: T): Partial<T> {
        if (!obj || typeof obj !== 'object') {
            return obj as Partial<T>;
        }

        const cleaned: any = {};

        for (const [key, value] of Object.entries(obj)) {
            if (value !== null && value !== undefined) {
                if (typeof value === 'object' && !Array.isArray(value)) {
                    const cleanedValue = this.removeNullValues(value);
                    if (Object.keys(cleanedValue).length > 0) {
                        cleaned[key] = cleanedValue;
                    }
                } else {
                    cleaned[key] = value;
                }
            }
        }

        return cleaned;
    }

    /**
     * Escape special characters for use in SQL LIKE queries
     * @param input - Input string to escape
     * @returns Escaped string safe for SQL LIKE
     */
    static escapeSqlLike(input: string): string {
        if (typeof input !== 'string') {
            return '';
        }

        return input
            .replace(/\\/g, '\\\\')
            .replace(/%/g, '\\%')
            .replace(/_/g, '\\_');
    }
}

/**
 * Convenience functions for common sanitization operations
 */

/**
 * Sanitize string input
 * @param input - Input string
 * @param maxLength - Maximum length
 * @returns Sanitized string
 */
export const sanitizeString = (input: string, maxLength?: number): string =>
    SanitizationUtil.sanitizeString(input, maxLength);

/**
 * Sanitize object by cleaning all properties
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export const sanitizeObject = <T>(obj: T): T =>
    SanitizationUtil.sanitizeObject(obj);

/**
 * Validate and sanitize email
 * @param email - Email to validate
 * @returns Sanitized email or null
 */
export const sanitizeEmail = (email: string): string | null =>
    SanitizationUtil.sanitizeEmail(email);

/**
 * Sanitize numeric input
 * @param input - Input to sanitize
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Sanitized number or null
 */
export const sanitizeNumber = (input: any, min?: number, max?: number): number | null =>
    SanitizationUtil.sanitizeNumber(input, min, max);
