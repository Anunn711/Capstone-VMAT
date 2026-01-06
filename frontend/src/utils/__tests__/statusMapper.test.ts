import { mapBackendStatus } from '../statusMapper';
import type { UiStatus } from '../statusMapper';

describe('StatusMapper', () => {
    test('maps Ongoing to New', () => {
        expect(mapBackendStatus('Ongoing')).toBe('New');
    });

    test('maps Accepted to Accepted', () => {
        expect(mapBackendStatus('Accepted')).toBe('Accepted');
    });

    test('maps Closed to Mitigated', () => {
        expect(mapBackendStatus('Closed')).toBe('Mitigated');
    });

    test('maps Mitigated to Mitigated', () => {
        expect(mapBackendStatus('Mitigated')).toBe('Mitigated');
    });

    test('maps unknown status to New', () => {
        expect(mapBackendStatus('UnknownStatus')).toBe('New');
    });

    test('maps empty string to Accepted', () => {
        expect(mapBackendStatus('')).toBe('Accepted');
    });

    test('maps null to Accepted', () => {
        expect(mapBackendStatus(null)).toBe('Accepted');
    });

    test('maps undefined to Accepted', () => {
        expect(mapBackendStatus(undefined)).toBe('Accepted');
    });

    test('maps case sensitive statuses correctly', () => {
        expect(mapBackendStatus('ongoing')).toBe('New'); // lowercase should map to New (unknown)
        expect(mapBackendStatus('ONGOING')).toBe('New'); // uppercase should map to New (unknown)
    });

    test('return type is UiStatus', () => {
        const result: UiStatus = mapBackendStatus('Ongoing');
        expect(result).toBe('New');
    });
});