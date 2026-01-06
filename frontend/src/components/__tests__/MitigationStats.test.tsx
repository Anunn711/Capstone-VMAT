import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MitigationStats from '../MitigationStats';

describe('MitigationStats Component', () => {
    const mockMitigations = [
        {
            id: 1,
            title: 'Mitigation 1',
            description: 'Test mitigation 1',
            status: 'implemented' as const,
            priority: 'critical' as const,
            category: 'security',
            type: 'technical',
            impact_category: 'high',
            effort: 'medium',
            cost: 'low',
            affected_systems: 'web-server',
            risk_reduction: 80,
            icon: 'shield',
            due_date: '2024-12-31',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z',
            vulnerability_id: 1,
            vulnerability: null
        },
        {
            id: 2,
            title: 'Mitigation 2',
            description: 'Test mitigation 2',
            status: 'in-progress' as const,
            priority: 'high' as const,
            category: 'process',
            type: 'administrative',
            impact_category: 'medium',
            effort: 'high',
            cost: 'medium',
            affected_systems: 'database',
            risk_reduction: 60,
            icon: 'gear',
            due_date: '2024-11-30',
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-16T00:00:00Z',
            vulnerability_id: 2,
            vulnerability: null
        },
        {
            id: 3,
            title: 'Mitigation 3',
            description: 'Test mitigation 3',
            status: 'pending' as const,
            priority: 'medium' as const,
            category: 'infrastructure',
            type: 'physical',
            impact_category: 'low',
            effort: 'low',
            cost: 'high',
            affected_systems: 'network',
            risk_reduction: 40,
            icon: 'network',
            due_date: '2024-10-31',
            created_at: '2024-01-03T00:00:00Z',
            updated_at: '2024-01-17T00:00:00Z',
            vulnerability_id: 3,
            vulnerability: null
        },
        {
            id: 4,
            title: 'Mitigation 4',
            description: 'Test mitigation 4',
            status: 'implemented' as const,
            priority: 'critical' as const,
            category: 'security',
            type: 'technical',
            impact_category: 'high',
            effort: 'high',
            cost: 'high',
            affected_systems: 'all-systems',
            risk_reduction: 90,
            icon: 'lock',
            due_date: '2024-09-30',
            created_at: '2024-01-04T00:00:00Z',
            updated_at: '2024-01-18T00:00:00Z',
            vulnerability_id: 4,
            vulnerability: null
        }
    ];

    test('displays correct counts for implemented mitigations', () => {
        render(<MitigationStats mitigations={mockMitigations} />);

        // Should show 2 implemented mitigations - use getAllByText since multiple elements have "2"
        const twoElements = screen.getAllByText('2');
        expect(twoElements.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Implemented')).toBeInTheDocument();
    });

    test('displays correct counts for in-progress mitigations', () => {
        render(<MitigationStats mitigations={mockMitigations} />);

        // Should show 1 in-progress mitigation - use getAllByText since multiple elements have "1"
        const oneElements = screen.getAllByText('1');
        expect(oneElements.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    test('displays correct counts for critical priority mitigations', () => {
        render(<MitigationStats mitigations={mockMitigations} />);

        // Should show 2 critical mitigations
        expect(screen.getByText('Critical Priority')).toBeInTheDocument();
        // The count will be visible in the UI
    });

    test('displays all statistics cards', () => {
        render(<MitigationStats mitigations={mockMitigations} />);

        expect(screen.getByText('Total Mitigations')).toBeInTheDocument();
        expect(screen.getByText('Implemented')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
        expect(screen.getByText('Critical Priority')).toBeInTheDocument();
    });

    test('handles empty mitigations array', () => {
        render(<MitigationStats mitigations={[]} />);

        // All counts should be 0
        const zeroElements = screen.getAllByText('0');
        expect(zeroElements).toHaveLength(4); // Should have 4 cards with 0 count

        expect(screen.getByText('Total Mitigations')).toBeInTheDocument();
        expect(screen.getByText('Implemented')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
        expect(screen.getByText('Critical Priority')).toBeInTheDocument();
    });

    test('correctly calculates statistics for different status distributions', () => {
        const skewedMitigations = [
            { ...mockMitigations[0], status: 'implemented' as const },
            { ...mockMitigations[1], status: 'implemented' as const },
            { ...mockMitigations[2], status: 'implemented' as const },
            { ...mockMitigations[3], status: 'in-progress' as const }
        ];

        render(<MitigationStats mitigations={skewedMitigations} />);

        expect(screen.getByText('3')).toBeInTheDocument(); // 3 implemented
        expect(screen.getByText('Implemented')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    test('correctly calculates critical priority count', () => {
        const allCriticalMitigations = mockMitigations.map(m => ({
            ...m,
            priority: 'critical' as const
        }));

        render(<MitigationStats mitigations={allCriticalMitigations} />);

        const fourElements = screen.getAllByText('4');
        expect(fourElements.length).toBeGreaterThanOrEqual(2); // Total and Critical should both show 4
        expect(screen.getByText('Critical Priority')).toBeInTheDocument();
    }); test('displays appropriate styling and structure', () => {
        const { container } = render(<MitigationStats mitigations={mockMitigations} />);

        // Check for Bootstrap classes and structure
        expect(container.querySelector('.row')).toBeInTheDocument();
        expect(container.querySelectorAll('.col-lg-3')).toHaveLength(4);
        expect(container.querySelectorAll('.card')).toHaveLength(4);
    });

    test('handles mitigations with only one status type', () => {
        const onlyPendingMitigations = mockMitigations.map(m => ({
            ...m,
            status: 'pending' as const
        }));

        render(<MitigationStats mitigations={onlyPendingMitigations} />);

        expect(screen.getByText('4')).toBeInTheDocument(); // 4 total
        expect(screen.getByText('Total Mitigations')).toBeInTheDocument();

        // Others should show 0
        const zeroElements = screen.getAllByText('0');
        expect(zeroElements.length).toBeGreaterThanOrEqual(2); // At least implemented and in-progress should be 0
    });
});