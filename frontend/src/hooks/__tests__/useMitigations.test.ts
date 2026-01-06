import { renderHook, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { useMitigations } from '../useMitigations';
import * as api from '../../services/api';

// Mock the API module
jest.mock('../../services/api');
const mockApiFetch = api.apiFetch as jest.MockedFunction<typeof api.apiFetch>;

describe('useMitigations Hook', () => {
    const mockMitigations = [
        {
            id: 1,
            title: 'SQL Injection Prevention',
            description: 'Implement parameterized queries',
            status: 'implemented' as const,
            priority: 'critical' as const,
            category: 'Security',
            type: 'Technical',
            impact_category: 'High',
            effort: 'Medium',
            cost: '$5000',
            affected_systems: 'Web Application',
            risk_reduction: 90,
            icon: 'shield',
            due_date: '2024-02-15',
            created_at: '2024-01-15',
            updated_at: '2024-01-20',
            implemented_by: 'Security Team',
            implementation_date: '2024-01-25',
            verification_date: '2024-01-30',
            implementation_notes: 'Successfully implemented',
            vulnerability_id: 1,
            vulnerability: {
                id: 1,
                cve_id: 'CVE-2024-001',
                software_vendors: 'Microsoft',
                software_names: 'SQL Server',
                software_versions: '2019',
                os_platforms: 'Windows',
                vulnerability_descriptions: 'SQL injection vulnerability'
            }
        },
        {
            id: 2,
            title: 'XSS Prevention',
            description: 'Implement output encoding',
            status: 'in-progress' as const,
            priority: 'high' as const,
            category: 'Security',
            type: 'Technical',
            impact_category: 'Medium',
            effort: 'Low',
            cost: '$2000',
            affected_systems: 'Frontend',
            risk_reduction: 75,
            icon: 'lock',
            due_date: '2024-03-01',
            created_at: '2024-02-01',
            updated_at: '2024-02-05',
            vulnerability_id: 2,
            vulnerability: {
                id: 2,
                cve_id: 'CVE-2024-002',
                software_vendors: 'Apache',
                software_names: 'Apache HTTP Server',
                software_versions: '2.4',
                os_platforms: 'Linux',
                vulnerability_descriptions: 'XSS vulnerability'
            }
        }
    ];

    const mockVulnerabilities = [
        {
            id: 1,
            cve_id: 'CVE-2024-001',
            software_vendors: 'Microsoft',
            software_names: 'SQL Server',
            software_versions: '2019',
            os_platforms: 'Windows',
            vulnerability_descriptions: 'SQL injection vulnerability'
        },
        {
            id: 2,
            cve_id: 'CVE-2024-002',
            software_vendors: 'Apache',
            software_names: 'Apache HTTP Server',
            software_versions: '2.4',
            os_platforms: 'Linux',
            vulnerability_descriptions: 'XSS vulnerability'
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('fetches mitigations and vulnerabilities on mount', async () => {
        mockApiFetch
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockMitigations)
            } as any)
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockVulnerabilities)
            } as any);

        const { result } = renderHook(() => useMitigations());

        expect(result.current.loading).toBe(true);
        expect(result.current.mitigations).toEqual([]);
        expect(result.current.vulnerabilities).toEqual([]);
        expect(result.current.error).toBeNull();

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.mitigations).toEqual(mockMitigations);
        expect(result.current.vulnerabilities).toEqual(mockVulnerabilities);
        expect(mockApiFetch).toHaveBeenCalledWith('/api/mitigations');
        expect(mockApiFetch).toHaveBeenCalledWith('/api/vulnerabilities');
    });

    test('handles error when fetching mitigations fails', async () => {
        mockApiFetch
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockVulnerabilities)
            } as any);

        const { result } = renderHook(() => useMitigations());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Network error');
        expect(result.current.mitigations).toEqual([]);
        expect(result.current.vulnerabilities).toEqual(mockVulnerabilities);
    });

    test('handles error when API response is not ok', async () => {
        mockApiFetch
            .mockResolvedValueOnce({
                ok: false,
                json: jest.fn()
            } as any)
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockVulnerabilities)
            } as any);

        const { result } = renderHook(() => useMitigations());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Failed to fetch mitigations');
    });

    test('creates new mitigation successfully', async () => {
        // Setup initial data
        mockApiFetch
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockMitigations)
            } as any)
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockVulnerabilities)
            } as any);

        const { result } = renderHook(() => useMitigations());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Mock create response
        const newMitigation = {
            id: 3,
            title: 'New Mitigation',
            description: 'Test mitigation',
            status: 'pending' as const,
            priority: 'medium' as const,
            category: 'Test',
            type: 'Test',
            impact_category: 'Low',
            effort: 'High',
            cost: '$1000',
            affected_systems: 'Test System',
            risk_reduction: 50,
            icon: 'test',
            due_date: '2024-12-31',
            created_at: '2024-02-01',
            updated_at: '2024-02-01',
            vulnerability_id: 1,
            vulnerability: mockVulnerabilities[0]
        };

        mockApiFetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue(newMitigation)
        } as any);

        let createdMitigation;
        await act(async () => {
            createdMitigation = await result.current.createMitigation({ title: 'New Mitigation' });
        });

        expect(createdMitigation).toEqual(newMitigation);
        expect(result.current.mitigations).toHaveLength(3);
        expect(result.current.mitigations[2]).toEqual(newMitigation);
        expect(mockApiFetch).toHaveBeenLastCalledWith('/api/mitigations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'New Mitigation' })
        });
    });

    test('handles create mitigation error', async () => {
        mockApiFetch
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockMitigations)
            } as any)
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockVulnerabilities)
            } as any);

        const { result } = renderHook(() => useMitigations());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        mockApiFetch.mockResolvedValueOnce({
            ok: false,
            json: jest.fn()
        } as any);

        await act(async () => {
            await expect(result.current.createMitigation({ title: 'Fail' }))
                .rejects.toThrow('Failed to create mitigation');
        });

        expect(result.current.error).toBe('Failed to create mitigation');
        expect(result.current.mitigations).toHaveLength(2); // No new mitigation added
    });

    test('updates mitigation successfully', async () => {
        mockApiFetch
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockMitigations)
            } as any)
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockVulnerabilities)
            } as any);

        const { result } = renderHook(() => useMitigations());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const updatedMitigation = {
            ...mockMitigations[0],
            title: 'Updated Title',
            status: 'implemented' as const
        };

        mockApiFetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue(updatedMitigation)
        } as any);

        let updated;
        await act(async () => {
            updated = await result.current.updateMitigation(1, { title: 'Updated Title' });
        });

        expect(updated).toEqual(updatedMitigation);
        expect(result.current.mitigations[0].title).toBe('Updated Title');
        expect(mockApiFetch).toHaveBeenLastCalledWith('/api/mitigations/1', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Updated Title' })
        });
    });

    test('handles update mitigation error', async () => {
        mockApiFetch
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockMitigations)
            } as any)
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockVulnerabilities)
            } as any);

        const { result } = renderHook(() => useMitigations());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        mockApiFetch.mockRejectedValueOnce(new Error('Update failed'));

        await act(async () => {
            await expect(result.current.updateMitigation(1, { title: 'Fail' }))
                .rejects.toThrow('Update failed');
        });

        expect(result.current.error).toBe('Update failed');
    });

    test('deletes mitigation successfully', async () => {
        mockApiFetch
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockMitigations)
            } as any)
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockVulnerabilities)
            } as any);

        const { result } = renderHook(() => useMitigations());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.mitigations).toHaveLength(2);

        mockApiFetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn()
        } as any);

        await act(async () => {
            await result.current.deleteMitigation(1);
        });

        expect(result.current.mitigations).toHaveLength(1);
        expect(result.current.mitigations.find(m => m.id === 1)).toBeUndefined();
        expect(mockApiFetch).toHaveBeenLastCalledWith('/api/mitigations/1', { method: 'DELETE' });
    });

    test('handles delete mitigation error', async () => {
        mockApiFetch
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockMitigations)
            } as any)
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockVulnerabilities)
            } as any);

        const { result } = renderHook(() => useMitigations());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        mockApiFetch.mockResolvedValueOnce({
            ok: false,
            json: jest.fn()
        } as any);

        await act(async () => {
            await expect(result.current.deleteMitigation(1))
                .rejects.toThrow('Failed to delete mitigation');
        });

        expect(result.current.error).toBe('Failed to delete mitigation');
        expect(result.current.mitigations).toHaveLength(2); // No mitigation removed
    });

    test('refetch function works correctly', async () => {
        mockApiFetch
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockMitigations)
            } as any)
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockVulnerabilities)
            } as any);

        const { result } = renderHook(() => useMitigations());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Mock refetch calls
        mockApiFetch
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue([...mockMitigations, { id: 3, title: 'Refetched' }])
            } as any)
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockVulnerabilities)
            } as any);

        await act(async () => {
            result.current.refetch();
        });

        // Wait for the refetch to complete
        await waitFor(() => {
            expect(result.current.mitigations).toHaveLength(3);
        });
    });

    test('handles non-Error exceptions gracefully', async () => {
        mockApiFetch
            .mockRejectedValueOnce('String error')
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockVulnerabilities)
            } as any);

        const { result } = renderHook(() => useMitigations());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Unknown error');
    });
});