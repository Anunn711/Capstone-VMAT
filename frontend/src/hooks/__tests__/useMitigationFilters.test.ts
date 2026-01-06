import { renderHook, act } from '@testing-library/react';
import { useMitigationFilters } from '../useMitigationFilters';

const mockMitigations = [
    {
        id: 1,
        title: 'Update Security Patches',
        description: 'Apply latest security patches to all systems',
        status: 'implemented' as const,
        priority: 'critical' as const,
        category: 'Security',
        type: 'Patch',
        impact_category: 'High',
        effort: 'Medium',
        cost: 'Low',
        affected_systems: 'All Systems',
        risk_reduction: 85,
        icon: 'shield',
        due_date: '2024-01-15',
        created_at: '2024-01-01',
        updated_at: '2024-01-10',
        vulnerability_id: 1,
        vulnerability: null,
    },
    {
        id: 2,
        title: 'Firewall Configuration',
        description: 'Configure firewall rules for better protection',
        status: 'in-progress' as const,
        priority: 'high' as const,
        category: 'Network',
        type: 'Configuration',
        impact_category: 'Medium',
        effort: 'High',
        cost: 'Medium',
        affected_systems: 'Network Infrastructure',
        risk_reduction: 70,
        icon: 'firewall',
        due_date: '2024-02-01',
        created_at: '2024-01-05',
        updated_at: '2024-01-12',
        vulnerability_id: 2,
        vulnerability: null,
    },
    {
        id: 3,
        title: 'Employee Training',
        description: 'Security awareness training for all employees',
        status: 'pending' as const,
        priority: 'medium' as const,
        category: 'Training',
        type: 'Education',
        impact_category: 'Low',
        effort: 'Low',
        cost: 'Low',
        affected_systems: 'Human Resources',
        risk_reduction: 30,
        icon: 'education',
        due_date: '2024-03-01',
        created_at: '2024-01-08',
        updated_at: '2024-01-08',
        vulnerability_id: 3,
        vulnerability: null,
    },
];

describe('useMitigationFilters', () => {
    test('returns initial state correctly', () => {
        const { result } = renderHook(() => useMitigationFilters(mockMitigations));

        expect(result.current.searchTerm).toBe('');
        expect(result.current.filterStatus).toBe('all');
        expect(result.current.filterPriority).toBe('all');
        expect(result.current.filteredMitigations).toEqual(mockMitigations);
    });

    test('filters by search term in title', () => {
        const { result } = renderHook(() => useMitigationFilters(mockMitigations));

        act(() => {
            result.current.setSearchTerm('Firewall');
        });

        expect(result.current.filteredMitigations).toHaveLength(1);
        expect(result.current.filteredMitigations[0].title).toBe('Firewall Configuration');
    });

    test('filters by search term in description', () => {
        const { result } = renderHook(() => useMitigationFilters(mockMitigations));

        act(() => {
            result.current.setSearchTerm('security patches');
        });

        expect(result.current.filteredMitigations).toHaveLength(1);
        expect(result.current.filteredMitigations[0].title).toBe('Update Security Patches');
    });

    test('filters by search term in category', () => {
        const { result } = renderHook(() => useMitigationFilters(mockMitigations));

        act(() => {
            result.current.setSearchTerm('Network');
        });

        expect(result.current.filteredMitigations).toHaveLength(1);
        expect(result.current.filteredMitigations[0].category).toBe('Network');
    });

    test('search is case insensitive', () => {
        const { result } = renderHook(() => useMitigationFilters(mockMitigations));

        act(() => {
            result.current.setSearchTerm('FIREWALL');
        });

        expect(result.current.filteredMitigations).toHaveLength(1);
        expect(result.current.filteredMitigations[0].title).toBe('Firewall Configuration');
    });

    test('filters by status', () => {
        const { result } = renderHook(() => useMitigationFilters(mockMitigations));

        act(() => {
            result.current.setFilterStatus('implemented');
        });

        expect(result.current.filteredMitigations).toHaveLength(1);
        expect(result.current.filteredMitigations[0].status).toBe('implemented');
    });

    test('filters by priority', () => {
        const { result } = renderHook(() => useMitigationFilters(mockMitigations));

        act(() => {
            result.current.setFilterPriority('critical');
        });

        expect(result.current.filteredMitigations).toHaveLength(1);
        expect(result.current.filteredMitigations[0].priority).toBe('critical');
    });

    test('combines multiple filters', () => {
        const { result } = renderHook(() => useMitigationFilters(mockMitigations));

        act(() => {
            result.current.setSearchTerm('Configuration');
            result.current.setFilterStatus('in-progress');
            result.current.setFilterPriority('high');
        });

        expect(result.current.filteredMitigations).toHaveLength(1);
        expect(result.current.filteredMitigations[0].title).toBe('Firewall Configuration');
    });

    test('returns empty array when no matches', () => {
        const { result } = renderHook(() => useMitigationFilters(mockMitigations));

        act(() => {
            result.current.setSearchTerm('NonexistentTerm');
        });

        expect(result.current.filteredMitigations).toHaveLength(0);
    });

    test('resets filters correctly', () => {
        const { result } = renderHook(() => useMitigationFilters(mockMitigations));

        // Apply filters
        act(() => {
            result.current.setSearchTerm('Firewall');
            result.current.setFilterStatus('implemented');
            result.current.setFilterPriority('critical');
        });

        // Reset filters
        act(() => {
            result.current.setSearchTerm('');
            result.current.setFilterStatus('all');
            result.current.setFilterPriority('all');
        });

        expect(result.current.filteredMitigations).toEqual(mockMitigations);
    });

    test('handles empty mitigations array', () => {
        const { result } = renderHook(() => useMitigationFilters([]));

        expect(result.current.filteredMitigations).toEqual([]);

        act(() => {
            result.current.setSearchTerm('anything');
        });

        expect(result.current.filteredMitigations).toEqual([]);
    });
});