import {
    SanitizationUtil,
    sanitizeEmail,
    sanitizeNumber,
    sanitizeObject,
    sanitizeString
} from '../../src/utils/sanitization.util';

describe('SanitizationUtil', () => {
    describe('stripHtml', () => {
        it('should remove HTML tags', () => {
            const input = '<script>alert("xss")</script><p>Hello <b>World</b></p>';
            const result = SanitizationUtil.stripHtml(input);
            expect(result).toBe('alert("xss")Hello World');
        });

        it('should handle non-string input', () => {
            expect(SanitizationUtil.stripHtml(123 as any)).toBe('');
            expect(SanitizationUtil.stripHtml(null as any)).toBe('');
        });
    });

    describe('sanitizeString', () => {
        it('should trim and remove control characters', () => {
            const input = '  \x00Hello\x1fWorld\x7f  ';
            const result = SanitizationUtil.sanitizeString(input);
            expect(result).toBe('HelloWorld');
        });

        it('should remove HTML tag characters', () => {
            const input = 'Hello<script>World>';
            const result = SanitizationUtil.sanitizeString(input);
            expect(result).toBe('HelloscriptWorld');
        });

        it('should enforce max length', () => {
            const input = 'Hello World';
            const result = SanitizationUtil.sanitizeString(input, 5);
            expect(result).toBe('Hello');
        });

        it('should handle non-string input', () => {
            expect(SanitizationUtil.sanitizeString(123 as any)).toBe('');
            expect(SanitizationUtil.sanitizeString(null as any)).toBe('');
        });
    });

    describe('sanitizeObject', () => {
        it('should sanitize all string properties', () => {
            const input = {
                name: '  <script>Name</script>  ',
                description: 'Valid description',
                number: 123,
                nested: {
                    value: '  <b>Nested</b>  '
                }
            };

            const result = SanitizationUtil.sanitizeObject(input);
            expect(result.name).toBe('scriptName/script'); // < and > removed
            expect(result.description).toBe('Valid description');
            expect(result.number).toBe(123);
            expect(result.nested.value).toBe('bNested/b'); // < and > removed
        });

        it('should handle arrays', () => {
            const input = ['  <script>Item1</script>  ', 'Item2'];
            const result = SanitizationUtil.sanitizeObject(input);
            expect(result[0]).toBe('scriptItem1/script'); // < and > removed
            expect(result[1]).toBe('Item2');
        });

        it('should handle non-object input', () => {
            expect(SanitizationUtil.sanitizeObject('string')).toBe('string');
            expect(SanitizationUtil.sanitizeObject(123)).toBe(123);
            expect(SanitizationUtil.sanitizeObject(null)).toBeNull();
        });
    });

    describe('sanitizeEmail', () => {
        it('should validate and sanitize valid email', () => {
            const email = '  USER@EXAMPLE.COM  ';
            const result = SanitizationUtil.sanitizeEmail(email);
            expect(result).toBe('user@example.com');
        });

        it('should return null for invalid email', () => {
            expect(SanitizationUtil.sanitizeEmail('invalid-email')).toBeNull();
            expect(SanitizationUtil.sanitizeEmail('user@')).toBeNull();
            expect(SanitizationUtil.sanitizeEmail('@domain.com')).toBeNull();
        });

        it('should handle non-string input', () => {
            expect(SanitizationUtil.sanitizeEmail(123 as any)).toBeNull();
            expect(SanitizationUtil.sanitizeEmail(null as any)).toBeNull();
        });
    });

    describe('sanitizeUrl', () => {
        it('should validate and return valid URLs', () => {
            const url = 'https://example.com/path';
            const result = SanitizationUtil.sanitizeUrl(url);
            expect(result).toBe('https://example.com/path');
        });

        it('should reject disallowed protocols', () => {
            expect(SanitizationUtil.sanitizeUrl('ftp://example.com')).toBeNull();
            expect(SanitizationUtil.sanitizeUrl('javascript:alert(1)')).toBeNull();
        });

        it('should allow custom protocols', () => {
            const result = SanitizationUtil.sanitizeUrl('ftp://example.com', ['ftp']);
            expect(result).toBe('ftp://example.com/');
        });

        it('should return null for invalid URLs', () => {
            expect(SanitizationUtil.sanitizeUrl('not-a-url')).toBeNull();
            expect(SanitizationUtil.sanitizeUrl('')).toBeNull();
        });

        it('should handle non-string input', () => {
            expect(SanitizationUtil.sanitizeUrl(123 as any)).toBeNull();
        });
    });

    describe('sanitizeFilename', () => {
        it('should remove dangerous characters', () => {
            const filename = 'file<name>with:bad|chars?.txt';
            const result = SanitizationUtil.sanitizeFilename(filename);
            expect(result).toBe('filenamewithbadchars.txt');
        });

        it('should remove leading and trailing dots', () => {
            expect(SanitizationUtil.sanitizeFilename('...filename...')).toBe('filename');
        });

        it('should handle reserved Windows filenames', () => {
            expect(SanitizationUtil.sanitizeFilename('CON')).toBe('file_CON');
            expect(SanitizationUtil.sanitizeFilename('PRN.txt')).toBe('file_PRN.txt');
        });

        it('should enforce max length', () => {
            const longName = 'a'.repeat(300);
            const result = SanitizationUtil.sanitizeFilename(longName, 10);
            expect(result).toHaveLength(10);
        });

        it('should handle non-string input', () => {
            expect(SanitizationUtil.sanitizeFilename(123 as any)).toBe('');
        });
    });

    describe('sanitizeNumber', () => {
        it('should convert valid numbers', () => {
            expect(SanitizationUtil.sanitizeNumber('123')).toBe(123);
            expect(SanitizationUtil.sanitizeNumber(123.45)).toBe(123.45);
            expect(SanitizationUtil.sanitizeNumber('123.45')).toBe(123.45);
        });

        it('should enforce min/max limits', () => {
            expect(SanitizationUtil.sanitizeNumber(5, 10, 20)).toBeNull();
            expect(SanitizationUtil.sanitizeNumber(25, 10, 20)).toBeNull();
            expect(SanitizationUtil.sanitizeNumber(15, 10, 20)).toBe(15);
        });

        it('should return null for invalid numbers', () => {
            expect(SanitizationUtil.sanitizeNumber('not-a-number')).toBeNull();
            expect(SanitizationUtil.sanitizeNumber(NaN)).toBeNull();
            expect(SanitizationUtil.sanitizeNumber(Infinity)).toBeNull();
        });
    });

    describe('sanitizeInteger', () => {
        it('should convert to integer', () => {
            expect(SanitizationUtil.sanitizeInteger('123')).toBe(123);
            expect(SanitizationUtil.sanitizeInteger(123.99)).toBe(123);
            expect(SanitizationUtil.sanitizeInteger('123.99')).toBe(123);
        });

        it('should enforce limits on integer result', () => {
            expect(SanitizationUtil.sanitizeInteger(9.99, 10, 20)).toBeNull();
            expect(SanitizationUtil.sanitizeInteger(15.5, 10, 20)).toBe(15);
        });

        it('should return null for invalid input', () => {
            expect(SanitizationUtil.sanitizeInteger('invalid')).toBeNull();
        });
    });

    describe('sanitizeBoolean', () => {
        it('should handle boolean input', () => {
            expect(SanitizationUtil.sanitizeBoolean(true)).toBe(true);
            expect(SanitizationUtil.sanitizeBoolean(false)).toBe(false);
        });

        it('should handle string input', () => {
            expect(SanitizationUtil.sanitizeBoolean('true')).toBe(true);
            expect(SanitizationUtil.sanitizeBoolean('TRUE')).toBe(true);
            expect(SanitizationUtil.sanitizeBoolean('1')).toBe(true);
            expect(SanitizationUtil.sanitizeBoolean('yes')).toBe(true);

            expect(SanitizationUtil.sanitizeBoolean('false')).toBe(false);
            expect(SanitizationUtil.sanitizeBoolean('FALSE')).toBe(false);
            expect(SanitizationUtil.sanitizeBoolean('0')).toBe(false);
            expect(SanitizationUtil.sanitizeBoolean('no')).toBe(false);
        });

        it('should handle number input', () => {
            expect(SanitizationUtil.sanitizeBoolean(1)).toBe(true);
            expect(SanitizationUtil.sanitizeBoolean(0)).toBe(false);
            expect(SanitizationUtil.sanitizeBoolean(-1)).toBe(true);
        });

        it('should return null for invalid input', () => {
            expect(SanitizationUtil.sanitizeBoolean('maybe')).toBeNull();
            expect(SanitizationUtil.sanitizeBoolean(null)).toBeNull();
            expect(SanitizationUtil.sanitizeBoolean({})).toBeNull();
        });
    });

    describe('sanitizeDate', () => {
        it('should handle Date objects', () => {
            const date = new Date('2023-07-05');
            const result = SanitizationUtil.sanitizeDate(date);
            expect(result).toEqual(date);
        });

        it('should parse date strings', () => {
            const result = SanitizationUtil.sanitizeDate('2023-07-05');
            expect(result).toBeInstanceOf(Date);
            expect(result!.getFullYear()).toBe(2023);
        });

        it('should enforce past/future restrictions', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);

            // Allow future, reject past
            expect(SanitizationUtil.sanitizeDate(futureDate, false, true)).toEqual(futureDate);
            expect(SanitizationUtil.sanitizeDate(pastDate, false, true)).toBeNull();

            // Allow past, reject future
            expect(SanitizationUtil.sanitizeDate(pastDate, true, false)).toEqual(pastDate);
            expect(SanitizationUtil.sanitizeDate(futureDate, true, false)).toBeNull();
        });

        it('should return null for invalid dates', () => {
            expect(SanitizationUtil.sanitizeDate('invalid-date')).toBeNull();
            expect(SanitizationUtil.sanitizeDate({})).toBeNull();
        });
    });

    describe('removeNullValues', () => {
        it('should remove null and undefined values', () => {
            const input = {
                name: 'test',
                value: null,
                description: undefined,
                count: 0,
                active: false,
                nested: {
                    field1: 'value',
                    field2: null
                }
            };

            const result = SanitizationUtil.removeNullValues(input);
            expect(result).toEqual({
                name: 'test',
                count: 0,
                active: false,
                nested: {
                    field1: 'value'
                }
            });
        });

        it('should handle non-object input', () => {
            expect(SanitizationUtil.removeNullValues('string')).toBe('string');
            expect(SanitizationUtil.removeNullValues(null)).toBeNull();
        });
    });

    describe('escapeSqlLike', () => {
        it('should escape SQL LIKE special characters', () => {
            const input = 'test%value_with\\backslash';
            const result = SanitizationUtil.escapeSqlLike(input);
            expect(result).toBe('test\\%value\\_with\\\\backslash');
        });

        it('should handle non-string input', () => {
            expect(SanitizationUtil.escapeSqlLike(123 as any)).toBe('');
        });
    });
});

describe('Sanitization convenience functions', () => {
    describe('sanitizeString', () => {
        it('should sanitize string', () => {
            const result = sanitizeString('  <script>test</script>  ');
            expect(result).toBe('scripttest/script'); // < and > removed
        });
    });

    describe('sanitizeObject', () => {
        it('should sanitize object', () => {
            const input = { name: '  test  ' };
            const result = sanitizeObject(input);
            expect(result.name).toBe('test');
        });
    });

    describe('sanitizeEmail', () => {
        it('should sanitize email', () => {
            const result = sanitizeEmail('  TEST@EXAMPLE.COM  ');
            expect(result).toBe('test@example.com');
        });
    });

    describe('sanitizeNumber', () => {
        it('should sanitize number', () => {
            const result = sanitizeNumber('123.45');
            expect(result).toBe(123.45);
        });
    });
});
