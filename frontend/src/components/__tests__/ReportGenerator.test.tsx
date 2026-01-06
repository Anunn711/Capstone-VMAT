import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportGenerator from '../ReportGenerator';

// Mock window.print
const mockPrint = jest.fn();
Object.defineProperty(window, 'print', {
    value: mockPrint,
    writable: true,
});

describe('ReportGenerator Component', () => {
    const mockDashboardData = {
        totalVulnerabilities: 150,
        criticalHigh: 25,
        awaitingReview: 10,
        mitigated: 90,
        severityData: [
            { name: 'Critical', value: 15, colorClass: 'bg-danger' },
            { name: 'High', value: 10, colorClass: 'bg-warning' },
            { name: 'Medium', value: 75, colorClass: 'bg-info' },
            { name: 'Low', value: 50, colorClass: 'bg-success' }
        ],
        statusData: [
            { name: 'Open', value: 60 },
            { name: 'Closed', value: 90 }
        ],
        trendData: [],
        recentCVEs: [
            {
                id: 1,
                cveId: 'CVE-2024-001',
                title: 'Critical SQL Injection Vulnerability',
                description: 'A critical vulnerability in the authentication system',
                severity: 'Critical',
                status: 'Open',
                cvssScore: 9.8,
                publishedDate: '2024-01-15',
                affectedSystems: ['Web Application', 'Database']
            },
            {
                id: 2,
                cveId: 'CVE-2024-002',
                title: 'XSS Vulnerability in User Input',
                description: 'Cross-site scripting vulnerability',
                severity: 'High',
                status: 'Under Review',
                cvssScore: 7.5,
                publishedDate: '2024-01-10',
                affectedSystems: ['Frontend']
            }
        ]
    };

    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('does not render when isOpen is false', () => {
        render(
            <ReportGenerator
                isOpen={false}
                onClose={mockOnClose}
                dashboardData={mockDashboardData}
            />
        );

        expect(screen.queryByText('Create Report')).not.toBeInTheDocument();
    });

    test('renders when isOpen is true', () => {
        render(
            <ReportGenerator
                isOpen={true}
                onClose={mockOnClose}
                dashboardData={mockDashboardData}
            />
        );

        expect(screen.getByText('Create Report')).toBeInTheDocument();
        expect(screen.getByText('Use this dialog to generate or print a dashboard report.')).toBeInTheDocument();
    });

    test('displays summary data correctly', () => {
        render(
            <ReportGenerator
                isOpen={true}
                onClose={mockOnClose}
                dashboardData={mockDashboardData}
            />
        );

        expect(screen.getByText('Total vulnerabilities: 150')).toBeInTheDocument();
        expect(screen.getByText('Critical & High: 25')).toBeInTheDocument();
        expect(screen.getByText('Awaiting review: 10')).toBeInTheDocument();
        expect(screen.getByText('Mitigated: 90')).toBeInTheDocument();
    });

    test('displays severity distribution', () => {
        render(
            <ReportGenerator
                isOpen={true}
                onClose={mockOnClose}
                dashboardData={mockDashboardData}
            />
        );

        expect(screen.getByText('Severity distribution')).toBeInTheDocument();
        expect(screen.getByText('Critical')).toBeInTheDocument();
        expect(screen.getByText('High')).toBeInTheDocument();
        expect(screen.getByText('Medium')).toBeInTheDocument();
        expect(screen.getByText('Low')).toBeInTheDocument();

        // Check severity values
        expect(screen.getByText('15')).toBeInTheDocument(); // Critical count
        expect(screen.getByText('10')).toBeInTheDocument(); // High count
        expect(screen.getByText('75')).toBeInTheDocument(); // Medium count
        expect(screen.getByText('50')).toBeInTheDocument(); // Low count
    });

    test('displays severity badges with correct CSS classes', () => {
        render(
            <ReportGenerator
                isOpen={true}
                onClose={mockOnClose}
                dashboardData={mockDashboardData}
            />
        );

        const criticalBadge = screen.getByText('Critical');
        expect(criticalBadge).toHaveClass('badge', 'bg-danger');

        const highBadge = screen.getByText('High');
        expect(highBadge).toHaveClass('badge', 'bg-warning');

        const mediumBadge = screen.getByText('Medium');
        expect(mediumBadge).toHaveClass('badge', 'bg-info');

        const lowBadge = screen.getByText('Low');
        expect(lowBadge).toHaveClass('badge', 'bg-success');
    });

    test('displays recent CVEs', () => {
        render(
            <ReportGenerator
                isOpen={true}
                onClose={mockOnClose}
                dashboardData={mockDashboardData}
            />
        );

        expect(screen.getByText('Recent CVEs')).toBeInTheDocument();
        expect(screen.getByText('CVE-2024-001')).toBeInTheDocument();
        expect(screen.getByText(/Critical SQL Injection Vulnerability/)).toBeInTheDocument();
        expect(screen.getByText('CVE-2024-002')).toBeInTheDocument();
        expect(screen.getByText(/XSS Vulnerability in User Input/)).toBeInTheDocument();
    }); test('calls onClose when close button is clicked', () => {
        render(
            <ReportGenerator
                isOpen={true}
                onClose={mockOnClose}
                dashboardData={mockDashboardData}
            />
        );

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when X button is clicked', () => {
        render(
            <ReportGenerator
                isOpen={true}
                onClose={mockOnClose}
                dashboardData={mockDashboardData}
            />
        );

        const xButton = screen.getByRole('button', { name: '' }); // btn-close
        fireEvent.click(xButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls window.print when print button is clicked', () => {
        render(
            <ReportGenerator
                isOpen={true}
                onClose={mockOnClose}
                dashboardData={mockDashboardData}
            />
        );

        const printButton = screen.getByText('Print / Save as PDF');
        fireEvent.click(printButton);

        expect(mockPrint).toHaveBeenCalledTimes(1);
    });

    test('renders modal with correct accessibility attributes', () => {
        render(
            <ReportGenerator
                isOpen={true}
                onClose={mockOnClose}
                dashboardData={mockDashboardData}
            />
        );

        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();
        expect(modal).toHaveAttribute('tabIndex', '-1');
    });

    test('handles empty severity data', () => {
        const emptyDataProps = {
            ...mockDashboardData,
            severityData: []
        };

        render(
            <ReportGenerator
                isOpen={true}
                onClose={mockOnClose}
                dashboardData={emptyDataProps}
            />
        );

        expect(screen.getByText('Severity distribution')).toBeInTheDocument();
        // Should not crash and still render the section
    });

    test('handles empty recent CVEs', () => {
        const emptyDataProps = {
            ...mockDashboardData,
            recentCVEs: []
        };

        render(
            <ReportGenerator
                isOpen={true}
                onClose={mockOnClose}
                dashboardData={emptyDataProps}
            />
        );

        expect(screen.getByText('Recent CVEs')).toBeInTheDocument();
        // Should not crash and still render the section
    });

    test('handles severity data without colorClass', () => {
        const dataWithoutColorClass = {
            ...mockDashboardData,
            severityData: [
                { name: 'Unknown', value: 5 } // No colorClass provided
            ]
        };

        render(
            <ReportGenerator
                isOpen={true}
                onClose={mockOnClose}
                dashboardData={dataWithoutColorClass}
            />
        );

        const unknownBadge = screen.getByText('Unknown');
        expect(unknownBadge).toHaveClass('badge', 'bg-secondary'); // Default fallback
        expect(screen.getByText('5')).toBeInTheDocument();
    });
});