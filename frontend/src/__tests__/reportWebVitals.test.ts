import reportWebVitals from '../reportWebVitals';

describe('reportWebVitals', () => {
    test('does nothing when no onPerfEntry is provided', () => {
        expect(() => reportWebVitals()).not.toThrow();
    });

    test('does nothing when onPerfEntry is not a function', () => {
        expect(() => reportWebVitals('invalid' as any)).not.toThrow();
        expect(() => reportWebVitals(null as any)).not.toThrow();
        expect(() => reportWebVitals(undefined)).not.toThrow();
    });

    test('accepts a valid function parameter', () => {
        const mockOnPerfEntry = jest.fn();
        expect(() => reportWebVitals(mockOnPerfEntry)).not.toThrow();
    });
});