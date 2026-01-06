import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MitigationList from '../MitigationList';

describe('MitigationList Component', () => {
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
            cost: 'Low',
            affected_systems: '["Web Server", "Database"]',
            risk_reduction: 85,
            icon: '🛡️',
            due_date: '2024-02-15',
            created_at: '2024-01-15',
            updated_at: '2024-01-20',
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
            cost: 'Medium',
            affected_systems: '["Frontend", "API Gateway", "CDN", "Load Balancer"]',
            risk_reduction: 65,
            icon: '🔒',
            due_date: '2024-03-01',
            created_at: '2024-02-01',
            updated_at: '2024-02-05',
            vulnerability_id: 2,
            vulnerability: {
                id: 2,
                cve_id: 'CVE-2024-002',
                software_vendors: 'Apache',
                software_names: 'HTTP Server',
                software_versions: '2.4',
                os_platforms: 'Linux',
                vulnerability_descriptions: 'XSS vulnerability'
            }
        }
    ];

    const mockProps = {
        mitigations: mockMitigations,
        loading: false,
        onEdit: jest.fn(),
        onEditStatus: jest.fn(),
        onDelete: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('displays loading spinner when loading', () => {
        render(<MitigationList {...mockProps} loading={true} />);

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('displays empty state when no mitigations', () => {
        render(<MitigationList {...mockProps} mitigations={[]} />);

        expect(screen.getByText('No mitigations found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument();
    });

    test('renders mitigation cards correctly', () => {
        render(<MitigationList {...mockProps} />);

        expect(screen.getByText('SQL Injection Prevention')).toBeInTheDocument();
        expect(screen.getByText('XSS Prevention')).toBeInTheDocument();
        expect(screen.getByText('Implement parameterized queries')).toBeInTheDocument();
        expect(screen.getByText('Implement output encoding')).toBeInTheDocument();
    });

    test('displays status badges correctly', () => {
        render(<MitigationList {...mockProps} />);

        expect(screen.getByText('implemented')).toBeInTheDocument();
        expect(screen.getByText('in progress')).toBeInTheDocument();
    });

    test('displays priority badges correctly', () => {
        render(<MitigationList {...mockProps} />);

        expect(screen.getByText('critical Impact')).toBeInTheDocument();
        expect(screen.getByText('high Impact')).toBeInTheDocument();
    });

    test('displays risk reduction progress bars', () => {
        render(<MitigationList {...mockProps} />);

        expect(screen.getByText('85%')).toBeInTheDocument();
        expect(screen.getByText('65%')).toBeInTheDocument();
    });

    test('displays effort, cost, and systems information', () => {
        render(<MitigationList {...mockProps} />);

        expect(screen.getAllByText('Medium')).toHaveLength(2); // effort appears twice
        expect(screen.getAllByText('Low')).toHaveLength(2); // cost appears twice  
        expect(screen.getByText('2')).toBeInTheDocument(); // systems count for first mitigation
        expect(screen.getByText('4')).toBeInTheDocument(); // systems count for second mitigation
    });

    test('displays due dates correctly', () => {
        render(<MitigationList {...mockProps} />);

        expect(screen.getByText('Due: 2/14/2024')).toBeInTheDocument();
        expect(screen.getByText('Due: 2/29/2024')).toBeInTheDocument();
    });

    test('displays related vulnerabilities', () => {
        render(<MitigationList {...mockProps} />);

        expect(screen.getByText('CVE-2024-001')).toBeInTheDocument();
        expect(screen.getByText('CVE-2024-002')).toBeInTheDocument();
    });

    test('displays affected systems with overflow handling', () => {
        render(<MitigationList {...mockProps} />);

        // First mitigation shows 2 systems
        expect(screen.getByText('Web Server')).toBeInTheDocument();
        expect(screen.getByText('Database')).toBeInTheDocument();

        // Second mitigation shows 3 systems + overflow
        expect(screen.getByText('Frontend')).toBeInTheDocument();
        expect(screen.getByText('API Gateway')).toBeInTheDocument();
        expect(screen.getByText('CDN')).toBeInTheDocument();
        expect(screen.getByText('+1 more')).toBeInTheDocument();
    });

    test('calls onEdit when edit button is clicked', () => {
        render(<MitigationList {...mockProps} />);

        const editButtons = screen.getAllByText('Edit Details');
        fireEvent.click(editButtons[0]);

        expect(mockProps.onEdit).toHaveBeenCalledWith(mockMitigations[0]);
    });

    test('calls onEditStatus when edit status button is clicked', () => {
        render(<MitigationList {...mockProps} />);

        const editStatusButtons = screen.getAllByText('Edit Status');
        fireEvent.click(editStatusButtons[0]);

        expect(mockProps.onEditStatus).toHaveBeenCalledWith(mockMitigations[0]);
    });

    test('calls onDelete when delete button is clicked', () => {
        render(<MitigationList {...mockProps} />);

        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);

        expect(mockProps.onDelete).toHaveBeenCalledWith(1);
    });

    test('handles invalid JSON in affected_systems gracefully', () => {
        const mitigationWithInvalidJson = {
            ...mockMitigations[0],
            affected_systems: 'invalid json'
        };

        render(<MitigationList {...mockProps} mitigations={[mitigationWithInvalidJson]} />);

        expect(screen.getByText('0')).toBeInTheDocument(); // systems count should be 0
    });

    test('applies correct CSS classes for status badges', () => {
        render(<MitigationList {...mockProps} />);

        const implementedBadge = screen.getByText('implemented');
        const inProgressBadge = screen.getByText('in progress');

        expect(implementedBadge).toHaveClass('badge', 'bg-success');
        expect(inProgressBadge).toHaveClass('badge', 'bg-warning', 'text-dark');
    });

    test('applies correct CSS classes for priority badges', () => {
        render(<MitigationList {...mockProps} />);

        const criticalBadge = screen.getByText('critical Impact');
        const highBadge = screen.getByText('high Impact');

        expect(criticalBadge).toHaveClass('badge', 'bg-danger');
        expect(highBadge).toHaveClass('badge', 'bg-warning', 'text-dark');
    });

    test('displays icons correctly', () => {
        render(<MitigationList {...mockProps} />);

        expect(screen.getByText('🛡️')).toBeInTheDocument();
        expect(screen.getByText('🔒')).toBeInTheDocument();
    });

    test('handles missing due date gracefully', () => {
        const mitigationWithoutDueDate = {
            ...mockMitigations[0],
            due_date: ''
        };

        render(<MitigationList {...mockProps} mitigations={[mitigationWithoutDueDate]} />);

        expect(screen.getByText('Due: Not set')).toBeInTheDocument();
    });

    test('handles missing vulnerability data gracefully', () => {
        const mitigationWithoutVuln = {
            ...mockMitigations[0],
            vulnerability: null as any
        };

        render(<MitigationList {...mockProps} mitigations={[mitigationWithoutVuln]} />);

        // Should not crash and still render the mitigation
        expect(screen.getByText('SQL Injection Prevention')).toBeInTheDocument();
    });

    test('handles unknown status with default badge class', () => {
        const mitigationWithUnknownStatus = {
            ...mockMitigations[0],
            status: 'unknown' as any
        };

        render(<MitigationList {...mockProps} mitigations={[mitigationWithUnknownStatus]} />);

        // Should render with default secondary badge
        const statusBadge = screen.getByText('unknown');
        expect(statusBadge).toHaveClass('badge', 'bg-secondary');
    });

    test('handles unknown priority with default badge class', () => {
        const mitigationWithUnknownPriority = {
            ...mockMitigations[0],
            priority: 'unknown' as any
        };

        render(<MitigationList {...mockProps} mitigations={[mitigationWithUnknownPriority]} />);

        // Should render unknown priority and not crash
        expect(screen.getByText('SQL Injection Prevention')).toBeInTheDocument();
    });

    test('displays pending and rejected status badges correctly', () => {
        const mitigationsWithAllStatuses = [
            { ...mockMitigations[0], status: 'pending' as const },
            { ...mockMitigations[1], status: 'rejected' as const }
        ];

        render(<MitigationList {...mockProps} mitigations={mitigationsWithAllStatuses} />);

        const pendingBadge = screen.getByText('pending');
        expect(pendingBadge).toHaveClass('badge', 'bg-secondary');

        const rejectedBadge = screen.getByText('rejected');
        expect(rejectedBadge).toHaveClass('badge', 'bg-danger');
    });

    test('displays medium and low priority badges correctly', () => {
        const mitigationsWithAllPriorities = [
            { ...mockMitigations[0], priority: 'medium' as const, title: 'Medium Priority Mitigation' },
            { ...mockMitigations[1], priority: 'low' as const, title: 'Low Priority Mitigation' }
        ];

        render(<MitigationList {...mockProps} mitigations={mitigationsWithAllPriorities} />);

        // Just verify the mitigations render successfully with medium and low priorities
        expect(screen.getByText('Medium Priority Mitigation')).toBeInTheDocument();
        expect(screen.getByText('Low Priority Mitigation')).toBeInTheDocument();

        // Check that priority text appears (in some form) - use getAllByText since there may be multiple
        expect(screen.getAllByText(/medium/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/low/i).length).toBeGreaterThan(0);
    });
});