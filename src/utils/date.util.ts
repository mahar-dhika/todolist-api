/**
 * Date manipulation and utilities
 */
export class DateUtil {
    /**
     * Get the start and end of the current week (Monday to Sunday)
     * @param referenceDate - Optional reference date (defaults to current date)
     * @returns Object with start and end dates of the week
     */
    static getCurrentWeekRange(referenceDate?: Date): { start: Date; end: Date } {
        const date = referenceDate ? new Date(referenceDate) : new Date();

        // Get the current day of week (0 = Sunday, 1 = Monday, etc.)
        const dayOfWeek = date.getDay();

        // Calculate days to subtract to get to Monday (start of week)
        // For Monday-based week: Sunday=6, Monday=0, Tuesday=1, Wednesday=2, Thursday=3, Friday=4, Saturday=5
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        // Calculate start of week (Monday at 00:00:00) using local date components
        const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysToMonday, 0, 0, 0, 0);

        // Calculate end of week (Sunday at 23:59:59.999) using local date components
        const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysToMonday + 6, 23, 59, 59, 999);

        return { start, end };
    }

    /**
     * Check if a date falls within the current week
     * @param date - Date to check
     * @param referenceDate - Optional reference date for "current" week
     * @returns True if date is in current week
     */
    static isInCurrentWeek(date: Date, referenceDate?: Date): boolean {
        const { start, end } = this.getCurrentWeekRange(referenceDate);
        return date >= start && date <= end;
    }

    /**
     * Get the start and end of a specific week for a given date
     * @param date - Date within the week
     * @returns Object with start and end dates of the week containing the date
     */
    static getWeekRange(date: Date): { start: Date; end: Date } {
        return this.getCurrentWeekRange(date);
    }

    /**
     * Check if a date is in the future
     * @param date - Date to check
     * @param compareWith - Date to compare with (defaults to current date)
     * @returns True if date is in the future
     */
    static isFuture(date: Date, compareWith?: Date): boolean {
        const comparison = compareWith || new Date();
        return date > comparison;
    }

    /**
     * Check if a date is in the past
     * @param date - Date to check
     * @param compareWith - Date to compare with (defaults to current date)
     * @returns True if date is in the past
     */
    static isPast(date: Date, compareWith?: Date): boolean {
        const comparison = compareWith || new Date();
        return date < comparison;
    }

    /**
     * Check if a date is today
     * @param date - Date to check
     * @param referenceDate - Optional reference date for "today"
     * @returns True if date is today
     */
    static isToday(date: Date, referenceDate?: Date): boolean {
        const today = referenceDate || new Date();
        return date.toDateString() === today.toDateString();
    }

    /**
     * Format date to ISO string without milliseconds
     * @param date - Date to format
     * @returns ISO string without milliseconds
     */
    static toISOString(date: Date): string {
        return date.toISOString().split('.')[0] + 'Z';
    }

    /**
     * Parse date string safely
     * @param dateString - Date string to parse
     * @returns Date object or null if invalid
     */
    static safeParse(dateString: string): Date | null {
        if (!dateString || typeof dateString !== 'string') {
            return null;
        }

        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    }

    /**
     * Add days to a date
     * @param date - Base date
     * @param days - Number of days to add (can be negative)
     * @returns New date with days added
     */
    static addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    /**
     * Get the difference in days between two dates
     * @param date1 - First date
     * @param date2 - Second date
     * @returns Number of days difference (positive if date1 is later)
     */
    static getDaysDifference(date1: Date, date2: Date): number {
        const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
        return Math.round((date1.getTime() - date2.getTime()) / oneDay);
    }

    /**
     * Get start of day (00:00:00.000)
     * @param date - Input date
     * @returns New date at start of day
     */
    static startOfDay(date: Date): Date {
        const result = new Date(date);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    /**
     * Get end of day (23:59:59.999)
     * @param date - Input date
     * @returns New date at end of day
     */
    static endOfDay(date: Date): Date {
        const result = new Date(date);
        result.setHours(23, 59, 59, 999);
        return result;
    }
}

/**
 * Convenience functions for common date operations
 */

/**
 * Get the start and end of the current week
 * @returns Object with start and end dates of the current week
 */
export const getCurrentWeekRange = (): { start: Date; end: Date } =>
    DateUtil.getCurrentWeekRange();

/**
 * Check if a date is due this week
 * @param date - Date to check
 * @returns True if date falls within current week
 */
export const isDueThisWeek = (date: Date): boolean =>
    DateUtil.isInCurrentWeek(date);

/**
 * Check if a date is in the future
 * @param date - Date to check
 * @returns True if date is in the future
 */
export const isFutureDate = (date: Date): boolean =>
    DateUtil.isFuture(date);

/**
 * Parse date string safely
 * @param dateString - Date string to parse
 * @returns Date object or null if invalid
 */
export const parseDate = (dateString: string): Date | null =>
    DateUtil.safeParse(dateString);
