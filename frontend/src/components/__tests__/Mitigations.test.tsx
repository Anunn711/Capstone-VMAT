import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Mitigations from '../Mitigations';
import { useMitigations } from '../../hooks/useMitigations';
import { useMitigationFilters } from '../../hooks/useMitigationFilters';

// Mock the hooks
jest.mock('../../hooks/useMitigations');
jest.mock('../../hooks/useMitigationFilters');

const mockUseMitigations = useMitigations as jest.MockedFunction<typeof useMitigations>;
const mockUseMitigationFilters = useMitigationFilters as jest.MockedFunction<typeof useMitigationFilters>;

// Mock the child components with simple implementations
jest.mock('../MitigationStats', () => {
    return function MockMitigationStats({ mitigations }: any) {
        return <div data-testid="mitigation-stats">Stats: {mitigations.length} mitigations</div>;
    };
});

jest.mock('../MitigationFilters', () => {
    return function MockMitigationFilters() {
        return (
            <div data-testid="mitigation-filters">
                <input placeholder="Search mitigations" />
                <select data-testid="status-filter">
                    <option value="">All Status</option>
                    <option value="implemented">Implemented</option>
                    <option value="in-progress">In Progress</option>
                </select>
                <select data-testid="priority-filter">
                    <option value="">All Priority</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                </select>
            </div>
        );
    };
});

jest.mock('../MitigationList', () => {
    return function MockMitigationList({ mitigations }: any) {
        return (
            <div data-testid="mitigation-list">
                {mitigations.map((mitigation: any) => (
                    <div key={mitigation.id} data-testid={`mitigation-${mitigation.id}`}>
                        <span>{mitigation.title}</span>
                        <button>Edit</button>
                        <button>Delete</button>
                        <button>Mark Implemented</button>
                    </div>
                ))}
            </div>
        );
    };
});

jest.mock('../MitigationForm', () => {
    return function MockMitigationForm() {
        return (
            <div data-testid="mitigation-form">
                <input data-testid="form-title" />
                <button>Submit</button>
                <button>Cancel</button>
            </div>
        );
    };
});

jest.mock('../MitigationStatusModal', () => {
    return function MockMitigationStatusModal({ show }: any) {
        if (!show) return null;
        return (
            <div data-testid="mitigation-status-modal">
                <button>Save Status</button>
                <button>Close</button>
            </div>
        );
    };
});

describe('Mitigations Component', () => {
    const mockMitigations = [
        {
            id: 1,
            title: 'Update Windows Security',
            status: 'pending' as const,
            priority: 'critical' as const,
            category: 'patching',
            type: 'preventive',
            impact_category: 'system',
            effort: 'medium',
            cost: 'low',
            affected_systems: '["System1","System2"]',
            risk_reduction: 80,
            icon: 'shield',
            due_date: '2025-01-01',
            created_at: '2024-12-01',
            updated_at: '2024-12-01',
            vulnerability_id: 1,
            description: 'Install latest Windows security patches',
            vulnerability: {
                id: 1,
                cve_id: 'CVE-2024-0001',
                software_vendors: 'Microsoft',
                software_names: 'Windows',
                software_versions: '11',
                os_platforms: 'Windows',
                vulnerability_descriptions: 'Windows security vulnerability'
            }
        },
        {
            id: 2,
            title: 'Network Segmentation',
            status: 'in-progress' as const,
            priority: 'high' as const,
            category: 'network',
            type: 'preventive',
            impact_category: 'network',
            effort: 'high',
            cost: 'medium',
            affected_systems: '["Network1","Network2"]',
            risk_reduction: 60,
            icon: 'network',
            due_date: '2025-02-01',
            created_at: '2024-12-01',
            updated_at: '2024-12-01',
            vulnerability_id: 2,
            description: 'Implement network segmentation',
            vulnerability: {
                id: 2,
                cve_id: 'CVE-2024-0002',
                software_vendors: 'Cisco',
                software_names: 'Router',
                software_versions: '1.0',
                os_platforms: 'IOS',
                vulnerability_descriptions: 'Network vulnerability'
            }
        }
    ];

    const mockCreateMitigation = jest.fn();
    const mockUpdateMitigation = jest.fn();
    const mockDeleteMitigation = jest.fn();
    const mockRefetch = jest.fn();

    const mockSetSearchTerm = jest.fn();
    const mockSetFilterStatus = jest.fn();
    const mockSetFilterPriority = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        mockUseMitigations.mockReturnValue({
            mitigations: mockMitigations,
            vulnerabilities: [],
            loading: false,
            error: null,
            createMitigation: mockCreateMitigation,
            updateMitigation: mockUpdateMitigation,
            deleteMitigation: mockDeleteMitigation,
            refetch: mockRefetch
        });

        mockUseMitigationFilters.mockReturnValue({
            searchTerm: '',
            setSearchTerm: mockSetSearchTerm,
            filterStatus: '',
            setFilterStatus: mockSetFilterStatus,
            filterPriority: '',
            setFilterPriority: mockSetFilterPriority,
            filteredMitigations: mockMitigations
        });
    });

    test('renders mitigations component with data', async () => {
        render(<Mitigations />);

        expect(screen.getByTestId('mitigation-stats')).toBeInTheDocument();
        expect(screen.getByTestId('mitigation-filters')).toBeInTheDocument();
        expect(screen.getByTestId('mitigation-list')).toBeInTheDocument();
        expect(screen.getByTestId('mitigation-form')).toBeInTheDocument();

        expect(screen.getByText('Update Windows Security')).toBeInTheDocument();
        expect(screen.getByText('Network Segmentation')).toBeInTheDocument();
    });

    test('displays mitigation statistics correctly', async () => {
        render(<Mitigations />);

        expect(screen.getByText('Stats: 2 mitigations')).toBeInTheDocument();
    });

    test('shows filter controls', async () => {
        render(<Mitigations />);

        expect(screen.getByPlaceholderText('Search mitigations')).toBeInTheDocument();
        expect(screen.getByTestId('status-filter')).toBeInTheDocument();
        expect(screen.getByTestId('priority-filter')).toBeInTheDocument();
    });

    test('displays mitigation list with action buttons', async () => {
        render(<Mitigations />);

        const editButtons = screen.getAllByText('Edit');
        const deleteButtons = screen.getAllByText('Delete');
        const statusButtons = screen.getAllByText('Mark Implemented');

        expect(editButtons).toHaveLength(2);
        expect(deleteButtons).toHaveLength(2);
        expect(statusButtons).toHaveLength(2);
    });

    test('renders mitigation form', async () => {
        render(<Mitigations />);

        expect(screen.getByTestId('form-title')).toBeInTheDocument();
        expect(screen.getByText('Submit')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('handles loading state', async () => {
        mockUseMitigations.mockReturnValue({
            mitigations: [],
            vulnerabilities: [],
            loading: true,
            error: null,
            createMitigation: mockCreateMitigation,
            updateMitigation: mockUpdateMitigation,
            deleteMitigation: mockDeleteMitigation,
            refetch: mockRefetch
        });

        render(<Mitigations />);

        // The component should still render even in loading state
        expect(screen.getByTestId('mitigation-stats')).toBeInTheDocument();
    });

    test('handles error state', async () => {
        mockUseMitigations.mockReturnValue({
            mitigations: [],
            vulnerabilities: [],
            loading: false,
            error: 'Failed to load mitigations',
            createMitigation: mockCreateMitigation,
            updateMitigation: mockUpdateMitigation,
            deleteMitigation: mockDeleteMitigation,
            refetch: mockRefetch
        });

        render(<Mitigations />);

        // The component should still render even with error
        expect(screen.getByTestId('mitigation-stats')).toBeInTheDocument();
    });

    test('handles empty mitigations list', async () => {
        mockUseMitigations.mockReturnValue({
            mitigations: [],
            vulnerabilities: [],
            loading: false,
            error: null,
            createMitigation: mockCreateMitigation,
            updateMitigation: mockUpdateMitigation,
            deleteMitigation: mockDeleteMitigation,
            refetch: mockRefetch
        });

        mockUseMitigationFilters.mockReturnValue({
            searchTerm: '',
            setSearchTerm: mockSetSearchTerm,
            filterStatus: '',
            setFilterStatus: mockSetFilterStatus,
            filterPriority: '',
            setFilterPriority: mockSetFilterPriority,
            filteredMitigations: []
        });

        render(<Mitigations />);

        expect(screen.getByText('Stats: 0 mitigations')).toBeInTheDocument();
    });

    test('displays filtered mitigations when filters are applied', async () => {
        const filteredMitigations = [mockMitigations[0]]; // Only one mitigation

        mockUseMitigationFilters.mockReturnValue({
            searchTerm: 'Windows',
            setSearchTerm: mockSetSearchTerm,
            filterStatus: 'pending',
            setFilterStatus: mockSetFilterStatus,
            filterPriority: 'critical',
            setFilterPriority: mockSetFilterPriority,
            filteredMitigations: filteredMitigations
        });

        render(<Mitigations />);

        expect(screen.getByText('Update Windows Security')).toBeInTheDocument();
        expect(screen.queryByText('Network Segmentation')).not.toBeInTheDocument();
    });

    test('uses correct hooks', async () => {
        render(<Mitigations />);

        expect(mockUseMitigations).toHaveBeenCalled();
        expect(mockUseMitigationFilters).toHaveBeenCalledWith(mockMitigations);
    });
});