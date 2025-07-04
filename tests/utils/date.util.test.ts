import {
    DateUtil,
    getCurrentWeekRange,
    isDueThisWeek,
    isFutureDate,
    parseDate
} from '../../src/utils/date.util';

// Helper function to format date as YYYY-MM-DD in local time
function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

describe('DateUtil', () => {
    describe('getCurrentWeekRange', () => {
        it('should return current week range (Monday to Sunday)', () => {
            const { start, end } = DateUtil.getCurrentWeekRange();

            expect(start instanceof Date).toBe(true);
            expect(end instanceof Date).toBe(true);
            expect(start.getDay()).toBe(1); // Monday
            expect(end.getDay()).toBe(0); // Sunday
            expect(start.getHours()).toBe(0);
            expect(start.getMinutes()).toBe(0);
            expect(end.getHours()).toBe(23);
            expect(end.getMinutes()).toBe(59);
        });

        it('should handle reference date correctly', () => {
            // Create date in a way that's consistent across timezones
            const referenceDate = new Date(2023, 6, 5); // July 5, 2023 (months are 0-indexed)
            const { start, end } = DateUtil.getCurrentWeekRange(referenceDate);

            // Check that it's Monday to Sunday
            expect(start.getDay()).toBe(1); // Monday
            expect(end.getDay()).toBe(0); // Sunday

            // Check specific dates - using local date formatting to avoid timezone issues
            const startDateString = formatLocalDate(start);
            const endDateString = formatLocalDate(end);

            expect(startDateString).toBe('2023-07-03'); // Monday
            expect(endDateString).toBe('2023-07-09'); // Sunday
        });

        it('should handle Sunday as reference date', () => {
            const sunday = new Date(2023, 6, 9); // July 9, 2023 Sunday (months are 0-indexed)
            const { start, end } = DateUtil.getCurrentWeekRange(sunday);

            // Check that it's Monday to Sunday
            expect(start.getDay()).toBe(1); // Monday
            expect(end.getDay()).toBe(0); // Sunday

            // Check specific dates
            const startDateString = formatLocalDate(start);
            const endDateString = formatLocalDate(end);

            expect(startDateString).toBe('2023-07-03'); // Monday
            expect(endDateString).toBe('2023-07-09'); // Sunday
        });
    });

    describe('isInCurrentWeek', () => {
        it('should return true for date in current week', () => {
            const today = new Date();
            expect(DateUtil.isInCurrentWeek(today)).toBe(true);
        });

        it('should return false for date outside current week', () => {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 10);
            expect(DateUtil.isInCurrentWeek(nextWeek)).toBe(false);
        });

        it('should work with reference date', () => {
            const referenceDate = new Date('2023-07-05'); // Wednesday
            const mondayOfSameWeek = new Date('2023-07-03');
            const previousMonday = new Date('2023-06-26');

            expect(DateUtil.isInCurrentWeek(mondayOfSameWeek, referenceDate)).toBe(true);
            expect(DateUtil.isInCurrentWeek(previousMonday, referenceDate)).toBe(false);
        });
    });

    describe('getWeekRange', () => {
        it('should return week range for given date', () => {
            const date = new Date(2023, 6, 5); // July 5, 2023 Wednesday (months are 0-indexed)
            const { start, end } = DateUtil.getWeekRange(date);

            // Check that it's Monday to Sunday
            expect(start.getDay()).toBe(1); // Monday
            expect(end.getDay()).toBe(0); // Sunday

            // Check specific dates
            const startDateString = formatLocalDate(start);
            const endDateString = formatLocalDate(end);

            expect(startDateString).toBe('2023-07-03'); // Monday
            expect(endDateString).toBe('2023-07-09'); // Sunday
        });
    });

    describe('isFuture', () => {
        it('should return true for future date', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);
            expect(DateUtil.isFuture(futureDate)).toBe(true);
        });

        it('should return false for past date', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            expect(DateUtil.isFuture(pastDate)).toBe(false);
        });

        it('should work with custom comparison date', () => {
            const date1 = new Date('2023-07-05');
            const date2 = new Date('2023-07-04');
            expect(DateUtil.isFuture(date1, date2)).toBe(true);
            expect(DateUtil.isFuture(date2, date1)).toBe(false);
        });
    });

    describe('isPast', () => {
        it('should return true for past date', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            expect(DateUtil.isPast(pastDate)).toBe(true);
        });

        it('should return false for future date', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);
            expect(DateUtil.isPast(futureDate)).toBe(false);
        });
    });

    describe('isToday', () => {
        it('should return true for today', () => {
            const today = new Date();
            expect(DateUtil.isToday(today)).toBe(true);
        });

        it('should return false for different day', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            expect(DateUtil.isToday(tomorrow)).toBe(false);
        });

        it('should work with reference date', () => {
            const date = new Date('2023-07-05');
            const sameDay = new Date('2023-07-05T15:30:00');
            const differentDay = new Date('2023-07-06');

            expect(DateUtil.isToday(sameDay, date)).toBe(true);
            expect(DateUtil.isToday(differentDay, date)).toBe(false);
        });
    });

    describe('safeParse', () => {
        it('should parse valid date string', () => {
            const dateString = '2023-07-05T10:30:00Z';
            const result = DateUtil.safeParse(dateString);
            expect(result instanceof Date).toBe(true);
            expect(result!.getFullYear()).toBe(2023);
        });

        it('should return null for invalid date string', () => {
            expect(DateUtil.safeParse('invalid-date')).toBeNull();
            expect(DateUtil.safeParse('')).toBeNull();
        });

        it('should return null for non-string input', () => {
            expect(DateUtil.safeParse(null as any)).toBeNull();
            expect(DateUtil.safeParse(undefined as any)).toBeNull();
        });
    });

    describe('addDays', () => {
        it('should add days correctly', () => {
            const date = new Date('2023-07-05');
            const result = DateUtil.addDays(date, 3);
            expect(result.toISOString().split('T')[0]).toBe('2023-07-08');
        });

        it('should subtract days with negative input', () => {
            const date = new Date('2023-07-05');
            const result = DateUtil.addDays(date, -2);
            expect(result.toISOString().split('T')[0]).toBe('2023-07-03');
        });

        it('should not modify original date', () => {
            const originalDate = new Date('2023-07-05');
            const originalTime = originalDate.getTime();
            DateUtil.addDays(originalDate, 5);
            expect(originalDate.getTime()).toBe(originalTime);
        });
    });

    describe('getDaysDifference', () => {
        it('should calculate days difference correctly', () => {
            const date1 = new Date('2023-07-08');
            const date2 = new Date('2023-07-05');
            expect(DateUtil.getDaysDifference(date1, date2)).toBe(3);
            expect(DateUtil.getDaysDifference(date2, date1)).toBe(-3);
        });

        it('should return 0 for same date', () => {
            const date = new Date('2023-07-05');
            expect(DateUtil.getDaysDifference(date, date)).toBe(0);
        });
    });

    describe('startOfDay', () => {
        it('should return start of day', () => {
            const date = new Date('2023-07-05T15:30:45.123');
            const result = DateUtil.startOfDay(date);
            expect(result.getHours()).toBe(0);
            expect(result.getMinutes()).toBe(0);
            expect(result.getSeconds()).toBe(0);
            expect(result.getMilliseconds()).toBe(0);
        });
    });

    describe('endOfDay', () => {
        it('should return end of day', () => {
            const date = new Date('2023-07-05T10:30:45.123');
            const result = DateUtil.endOfDay(date);
            expect(result.getHours()).toBe(23);
            expect(result.getMinutes()).toBe(59);
            expect(result.getSeconds()).toBe(59);
            expect(result.getMilliseconds()).toBe(999);
        });
    });
});

describe('Date convenience functions', () => {
    describe('getCurrentWeekRange', () => {
        it('should return current week range', () => {
            const { start, end } = getCurrentWeekRange();
            expect(start instanceof Date).toBe(true);
            expect(end instanceof Date).toBe(true);
        });
    });

    describe('isDueThisWeek', () => {
        it('should check if date is due this week', () => {
            const today = new Date();
            expect(isDueThisWeek(today)).toBe(true);

            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            expect(isDueThisWeek(nextMonth)).toBe(false);
        });
    });

    describe('isFutureDate', () => {
        it('should check if date is in future', () => {
            const future = new Date();
            future.setDate(future.getDate() + 1);
            expect(isFutureDate(future)).toBe(true);

            const past = new Date();
            past.setDate(past.getDate() - 1);
            expect(isFutureDate(past)).toBe(false);
        });
    });

    describe('parseDate', () => {
        it('should parse date safely', () => {
            const result = parseDate('2023-07-05');
            expect(result instanceof Date).toBe(true);
            expect(parseDate('invalid')).toBeNull();
        });
    });
});
