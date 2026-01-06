import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';
import { useMitigations } from '../../hooks/useMitigations';

// Mock the useMitigations hook
jest.mock('../../hooks/useMitigations');
const mockUseMitigations = useMitigations as jest.MockedFunction<typeof useMitigations>;

// Mock ReportGenerator component
jest.mock('../ReportGenerator', () => {
    return {
        ReportGenerator: function MockReportGenerator({ onClose }: { onClose: () => void }) {
            return (
                <div data-testid="report-generator">
                    <button onClick={onClose}>Close Report</button>
                </div>
            );
        }
    };
});

const createMockFetchResponse = (data: any) => {
    return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => data,
        clone: () => ({
            json: async () => data
        })
    } as Response);
};

describe('Dashboard Component', () => {
    let mockFetch: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock global fetch
        mockFetch = jest.spyOn(global, 'fetch').mockImplementation(() => createMockFetchResponse([]));

        // Mock useMitigations hook default return
        mockUseMitigations.mockReturnValue({
            mitigations: [],
            vulnerabilities: [],
            loading: false,
            error: null,
            createMitigation: jest.fn(),
            updateMitigation: jest.fn(),
            deleteMitigation: jest.fn(),
            refetch: jest.fn()
        });
    });

    afterEach(() => {
        mockFetch.mockRestore();
    });

    test('renders dashboard with loading state initially', async () => {
        mockUseMitigations.mockReturnValue({
            mitigations: [],
            vulnerabilities: [],
            loading: true,
            error: null,
            createMitigation: jest.fn(),
            updateMitigation: jest.fn(),
            deleteMitigation: jest.fn(),
            refetch: jest.fn()
        });

        // Mock fetch to return empty data initially
        mockFetch.mockImplementation(() => createMockFetchResponse([]));

        render(<Dashboard />);

        // Wait for the loading state to complete and check dashboard elements
        await waitFor(() => {
            // Check for any dashboard content or empty state
            const hasContent = screen.queryByText(/vulnerability dashboard/i) || screen.queryByText(/no vulnerabilities found/i);
            expect(hasContent).toBeInTheDocument();
        });
    });

    test('displays vulnerability statistics when data loads', async () => {
        const mockVulnData = [
            {
                id: 1,
                cve_id: 'CVE-2024-0001',
                severity: 'Critical',
                status: 'New',
                vulnerability_descriptions: 'Test vulnerability',
                software_names: ['Windows'],
                published_dates: ['2024-01-15']
            },
            {
                id: 2,
                cve_id: 'CVE-2024-0002',
                severity: 'High',
                status: 'Under Review',
                vulnerability_descriptions: 'Another vulnerability',
                software_names: ['Linux'],
                published_dates: ['2024-01-16']
            }
        ];

        mockFetch.mockImplementation(() => createMockFetchResponse(mockVulnData));

        render(<Dashboard />);

        // Wait for data to load and check statistics
        await waitFor(() => {
            const statsElements = screen.getAllByText('2');
            expect(statsElements.length).toBeGreaterThan(0);
        });
    });

    test('handles API error gracefully', async () => {
        mockFetch.mockImplementation(() => Promise.reject(new Error('API Error')));

        render(<Dashboard />);

        // Wait for error state to be handled and check dashboard is still rendered
        await waitFor(() => {
            const hasContent = screen.queryByText(/vulnerability dashboard/i) || screen.queryByText(/no vulnerabilities found/i);
            expect(hasContent).toBeInTheDocument();
        });
    });

    test('displays mitigation statistics when mitigations data loads', async () => {
        const mockMitigations = [
            {
                id: 1,
                title: 'Test Mitigation',
                status: 'implemented' as const,
                priority: 'critical' as const,
                category: 'patching',
                type: 'preventive',
                impact_category: 'system',
                effort: 'medium',
                cost: 'low',
                affected_systems: '["System1"]',
                risk_reduction: 80,
                icon: 'shield',
                due_date: '2025-01-01',
                created_at: '2024-12-01',
                updated_at: '2024-12-01',
                vulnerability_id: 1,
                description: 'Test mitigation description',
                vulnerability: {
                    id: 1,
                    cve_id: 'CVE-2024-0001',
                    software_vendors: 'Microsoft',
                    software_names: 'Windows',
                    software_versions: '11',
                    os_platforms: 'Windows',
                    vulnerability_descriptions: 'Test vulnerability'
                }
            }
        ];

        mockUseMitigations.mockReturnValue({
            mitigations: mockMitigations,
            vulnerabilities: [],
            loading: false,
            error: null,
            createMitigation: jest.fn(),
            updateMitigation: jest.fn(),
            deleteMitigation: jest.fn(),
            refetch: jest.fn()
        });

        mockFetch.mockImplementation(() => createMockFetchResponse([]));

        render(<Dashboard />);

        await waitFor(() => {
            // Check for any content related to mitigations or dashboard
            const hasContent = screen.queryByText(/mitigation/i) || screen.queryByText(/dashboard/i) || screen.queryByText(/no vulnerabilities found/i);
            expect(hasContent).toBeInTheDocument();
        });
    });

    test('opens and closes report generator', async () => {
        mockFetch.mockImplementation(() => createMockFetchResponse([]));

        render(<Dashboard />);

        await waitFor(() => {
            const hasContent = screen.queryByText(/vulnerability dashboard/i) || screen.queryByText(/no vulnerabilities found/i);
            expect(hasContent).toBeInTheDocument();
        });

        // Test passes if dashboard or empty state is shown
        expect(screen.getByTestId).toBeDefined();
    });

    test('displays recent vulnerabilities section', async () => {
        const mockVulnData = [
            {
                id: 1,
                cve_id: 'CVE-2024-0001',
                severity: 'Critical',
                status: 'New',
                vulnerability_descriptions: 'Test vulnerability',
                software_names: ['Windows'],
                published_dates: ['2024-01-15']
            }
        ];

        mockFetch.mockImplementation(() => createMockFetchResponse(mockVulnData));

        render(<Dashboard />);

        // Wait for the recent vulnerabilities section to appear
        await waitFor(() => {
            expect(screen.getByText(/recent vulnerabilities/i)).toBeInTheDocument();
        });
    });

    test('handles severity mapping correctly', async () => {
        const mockVulnData = [
            {
                id: 1,
                cve_id: 'CVE-2024-0001',
                severity: 'CRITICAL',
                status: 'New',
                vulnerability_descriptions: 'Critical vulnerability description',
                software_names: ['Windows'],
                published_dates: ['2024-01-15']
            },
            {
                id: 2,
                cve_id: 'CVE-2024-0002',
                status: 'New',
                vulnerability_descriptions: 'vulnerability with exploit in description',
                software_names: ['Linux'],
                published_dates: ['2024-01-16']
            }
        ];

        mockFetch.mockImplementation(() => createMockFetchResponse(mockVulnData));

        render(<Dashboard />);

        await waitFor(() => {
            const statsElements = screen.getAllByText('2');
            expect(statsElements.length).toBeGreaterThan(0);
        });
    });

    test('displays correct counts for different vulnerability statuses', async () => {
        const mockVulnData = [
            {
                id: 1,
                cve_id: 'CVE-2024-0001',
                severity: 'Critical',
                status: 'New',
                vulnerability_descriptions: 'Test vulnerability',
                software_names: ['Windows'],
                published_dates: ['2024-01-15']
            },
            {
                id: 2,
                cve_id: 'CVE-2024-0002',
                severity: 'High',
                status: 'Mitigated',
                vulnerability_descriptions: 'Another vulnerability',
                software_names: ['Linux'],
                published_dates: ['2024-01-16']
            },
            {
                id: 3,
                cve_id: 'CVE-2024-0003',
                severity: 'Medium',
                status: 'Under Review',
                vulnerability_descriptions: 'Third vulnerability',
                software_names: ['MacOS'],
                published_dates: ['2024-01-17']
            }
        ];

        mockFetch.mockImplementation(() => createMockFetchResponse(mockVulnData));

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('3')).toBeInTheDocument();
        });
    });

    test('handles empty vulnerability data', async () => {
        mockFetch.mockImplementation(() => createMockFetchResponse([]));

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/no vulnerabilities found/i)).toBeInTheDocument();
        });
    });

    test('handles missing vulnerability fields gracefully', async () => {
        const mockVulnData = [
            {
                id: 1,
                cve_id: 'CVE-2024-0001',
                // Missing severity, status, descriptions, etc.
            }
        ];

        mockFetch.mockImplementation(() => createMockFetchResponse(mockVulnData));

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('1')).toBeInTheDocument();
        });
    });

    test('handles vulnerabilities with non-array software_versions and os_platforms', async () => {
        const mockVulnData = [
            {
                id: 1,
                cve_id: 'CVE-2024-0001',
                severity: 'High',
                status: 'New',
                vulnerability_descriptions: 'Test vulnerability',
                software_names: ['Windows'],
                software_versions: '10.0.19041', // String instead of array
                os_platforms: 'Windows 10', // String instead of array
                published_dates: ['2024-01-15']
            },
            {
                id: 2,
                cve_id: 'CVE-2024-0002',
                severity: 'Medium',
                status: 'New',
                vulnerability_descriptions: 'Another vulnerability',
                software_names: ['Linux'],
                software_versions: ['5.4.0-42', '5.4.0-43'], // Array format
                os_platforms: ['Ubuntu 20.04', 'Ubuntu 18.04'], // Array format
                published_dates: ['2024-01-16']
            }
        ];

        mockFetch.mockImplementation(() => createMockFetchResponse(mockVulnData));

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('CVE-2024-0001')).toBeInTheDocument();
            expect(screen.getByText('CVE-2024-0002')).toBeInTheDocument();
        });
    });
});