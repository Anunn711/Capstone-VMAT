import { MitigationAPI } from '../api';

// Mock the apiFetch function properly
jest.mock('../api', () => {
    const mockApiFetch = jest.fn();
    return {
        apiFetch: mockApiFetch,
        MitigationAPI: {
            getMitigations: jest.fn(),
            getMitigationById: jest.fn(),
            createMitigation: jest.fn(),
            updateMitigation: jest.fn(),
            deleteMitigation: jest.fn(),
            handleResponse: jest.fn(),
        }
    };
});

describe('MitigationAPI', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getMitigations with no filters', async () => {
        const mockResponse = [{ id: 1, name: 'Test Mitigation' }];
        (MitigationAPI.getMitigations as jest.Mock).mockResolvedValue(mockResponse);

        const result = await MitigationAPI.getMitigations();

        expect(result).toEqual(mockResponse);
    });

    test('getMitigations with status filter', async () => {
        const mockResponse = [{ id: 1, status: 'active' }];
        (MitigationAPI.getMitigations as jest.Mock).mockResolvedValue(mockResponse);

        const result = await MitigationAPI.getMitigations({ status: 'active' });

        expect(result).toEqual(mockResponse);
    });

    test('getMitigations with priority filter', async () => {
        const mockResponse = [{ id: 1, priority: 'high' }];
        (MitigationAPI.getMitigations as jest.Mock).mockResolvedValue(mockResponse);

        const result = await MitigationAPI.getMitigations({ priority: 'high' });

        expect(result).toEqual(mockResponse);
    });

    test('getMitigations with search filter', async () => {
        const mockResponse = [{ id: 1, name: 'search result' }];
        (MitigationAPI.getMitigations as jest.Mock).mockResolvedValue(mockResponse);

        const result = await MitigationAPI.getMitigations({ search: 'test search' });

        expect(result).toEqual(mockResponse);
    });

    test('getMitigations with all filters', async () => {
        const mockResponse = [{ id: 1, name: 'filtered result' }];
        (MitigationAPI.getMitigations as jest.Mock).mockResolvedValue(mockResponse);

        const result = await MitigationAPI.getMitigations({
            status: 'active',
            priority: 'high',
            search: 'test'
        });

        expect(result).toEqual(mockResponse);
    });

    test('getMitigationById', async () => {
        const mockResponse = { id: 123, name: 'Specific Mitigation' };
        (MitigationAPI.getMitigationById as jest.Mock).mockResolvedValue(mockResponse);

        const result = await MitigationAPI.getMitigationById(123);

        expect(result).toEqual(mockResponse);
    });

    test('createMitigation', async () => {
        const mitigationData = { name: 'New Mitigation', description: 'Test' };
        const mockResponse = { id: 456, ...mitigationData };

        (MitigationAPI.createMitigation as jest.Mock).mockResolvedValue(mockResponse);

        const result = await MitigationAPI.createMitigation(mitigationData);

        expect(result).toEqual(mockResponse);
    });

    test('updateMitigation', async () => {
        const mitigationData = { name: 'Updated Mitigation' };
        const mockResponse = { id: 789, ...mitigationData };

        (MitigationAPI.updateMitigation as jest.Mock).mockResolvedValue(mockResponse);

        const result = await MitigationAPI.updateMitigation(789, mitigationData);

        expect(result).toEqual(mockResponse);
    });

    test('deleteMitigation', async () => {
        const mockResponse = { success: true };

        (MitigationAPI.deleteMitigation as jest.Mock).mockResolvedValue(mockResponse);

        const result = await MitigationAPI.deleteMitigation(999);

        expect(result).toEqual(mockResponse);
    });

    test('error handling', async () => {
        const error = new Error('API Error');
        (MitigationAPI.getMitigations as jest.Mock).mockRejectedValue(error);

        await expect(MitigationAPI.getMitigations()).rejects.toThrow('API Error');
    });
});