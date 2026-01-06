import {
    capitalize,
    truncate,
    formatDate,
    parseSystemsList
} from '../textUtils';

describe('Text Utilities', () => {
    describe('capitalize', () => {
        it('should capitalize first letter and lowercase rest', () => {
            expect(capitalize('hello')).toBe('Hello');
            expect(capitalize('WORLD')).toBe('World');
            expect(capitalize('hELLo')).toBe('Hello');
        });

        it('should handle empty and null strings', () => {
            expect(capitalize('')).toBe('');
            expect(capitalize(null as any)).toBe('');
            expect(capitalize(undefined as any)).toBe('');
        });

        it('should handle single character', () => {
            expect(capitalize('a')).toBe('A');
            expect(capitalize('Z')).toBe('Z');
        });
    });

    describe('truncate', () => {
        it('should truncate long strings', () => {
            expect(truncate('Hello World', 5)).toBe('Hello...');
            expect(truncate('Testing truncation', 7)).toBe('Testing...');
        });

        it('should not truncate short strings', () => {
            expect(truncate('Short', 10)).toBe('Short');
            expect(truncate('Exact', 5)).toBe('Exact');
        });

        it('should handle edge cases', () => {
            expect(truncate('', 5)).toBe('');
            expect(truncate(null as any, 5)).toBe(null);
            expect(truncate('Test', 0)).toBe('...');
        });
    });

    describe('formatDate', () => {
        it('should format valid dates', () => {
            const date = '2023-12-25';
            const formatted = formatDate(date);
            expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
        });

        it('should handle invalid dates', () => {
            expect(formatDate('invalid-date')).toBe('Invalid Date');
            expect(formatDate('not-a-date')).toBe('Invalid Date');
        });

        it('should handle malformed date strings that cause exceptions', () => {
            // Force an exception by passing invalid input to toLocaleDateString
            const mockDate = new Date('invalid');
            jest.spyOn(Date.prototype, 'toLocaleDateString').mockImplementationOnce(() => {
                throw new Error('Forced error');
            });
            expect(formatDate('2023-12-25')).toBe('Invalid date');
            jest.restoreAllMocks();
        });

        it('should handle empty dates', () => {
            expect(formatDate('')).toBe('Not set');
            expect(formatDate(null as any)).toBe('Not set');
            expect(formatDate(undefined as any)).toBe('Not set');
        });
    });

    describe('parseSystemsList', () => {
        it('should parse valid JSON arrays', () => {
            expect(parseSystemsList('["system1", "system2"]')).toEqual(['system1', 'system2']);
            expect(parseSystemsList('[]')).toEqual([]);
        });

        it('should handle invalid JSON', () => {
            expect(parseSystemsList('invalid json')).toEqual([]);
            expect(parseSystemsList('{"not": "array"}')).toEqual([]);
        });

        it('should handle non-array JSON', () => {
            expect(parseSystemsList('"string"')).toEqual([]);
            expect(parseSystemsList('123')).toEqual([]);
            expect(parseSystemsList('true')).toEqual([]);
        });

        it('should handle edge cases', () => {
            expect(parseSystemsList('')).toEqual([]);
            expect(parseSystemsList(null as any)).toEqual([]);
        });
    });
});