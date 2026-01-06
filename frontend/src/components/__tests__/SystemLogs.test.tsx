import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SystemLogs from '../SystemLogs';
import * as api from '../../services/api';

// Mock the API module
jest.mock('../../services/api');
const mockApiFetch = api.apiFetch as jest.MockedFunction<typeof api.apiFetch>;

describe('SystemLogs Component', () => {
    const mockLogs = [
        {
            id: 1,
            timestamp: '2024-01-15T10:30:00.000Z',
            username: 'admin',
            action: 'User login'
        },
        {
            id: 2,
            timestamp: '2024-01-15T11:00:00.000Z',
            username: 'testuser',
            action: 'Updated vulnerability CVE-2024-001 status to Mitigated'
        },
        {
            id: 3,
            timestamp: '2024-01-15T11:15:00.000Z',
            username: 'admin',
            action: 'Created new mitigation for critical vulnerability'
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('shows loading state initially', () => {
        mockApiFetch.mockImplementation(() => new Promise(() => { })); // Never resolves

        render(<SystemLogs />);

        expect(screen.getByText('Loading system logs...')).toBeInTheDocument();
    });

    test('displays logs successfully when API call succeeds', async () => {
        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue(mockLogs)
        } as any;

        mockApiFetch.mockResolvedValue(mockResponse);

        render(<SystemLogs />);

        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.queryByText('Loading system logs...')).not.toBeInTheDocument();
        });

        // Check header and description
        expect(screen.getByText('System Logging')).toBeInTheDocument();
        expect(screen.getByText('Showing recent sign-ins/outs and changes to vulnerabilities/mitigations.')).toBeInTheDocument();

        // Check table headers
        expect(screen.getByText('Timestamp')).toBeInTheDocument();
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByText('Action')).toBeInTheDocument();

        // Check log entries
        expect(screen.getAllByText('admin')).toHaveLength(2);
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('User login')).toBeInTheDocument();
        expect(screen.getByText('Updated vulnerability CVE-2024-001 status to Mitigated')).toBeInTheDocument();
        expect(screen.getByText('Created new mitigation for critical vulnerability')).toBeInTheDocument();
    });

    test('displays error message when API call fails with response error', async () => {
        const mockResponse = {
            ok: false,
            status: 500,
            text: jest.fn().mockResolvedValue('Internal Server Error')
        } as any;

        mockApiFetch.mockResolvedValue(mockResponse);

        render(<SystemLogs />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load system logs: Internal Server Error')).toBeInTheDocument();
        });

        expect(screen.queryByText('Loading system logs...')).not.toBeInTheDocument();
        expect(screen.queryByText('System Logging')).not.toBeInTheDocument();
    });

    test('displays error message when API call fails with status code only', async () => {
        const mockResponse = {
            ok: false,
            status: 404,
            text: jest.fn().mockResolvedValue('')
        } as any;

        mockApiFetch.mockResolvedValue(mockResponse);

        render(<SystemLogs />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load system logs: HTTP 404')).toBeInTheDocument();
        });
    });

    test('displays error message when API call throws exception', async () => {
        mockApiFetch.mockRejectedValue(new Error('Network error'));

        render(<SystemLogs />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load system logs: Network error')).toBeInTheDocument();
        });
    });

    test('displays error message when API call throws non-Error exception', async () => {
        mockApiFetch.mockRejectedValue('Unknown error');

        render(<SystemLogs />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load system logs: Failed to load logs')).toBeInTheDocument();
        });
    });

    test('displays empty state when no logs are returned', async () => {
        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue([])
        } as any;

        mockApiFetch.mockResolvedValue(mockResponse);

        render(<SystemLogs />);

        await waitFor(() => {
            expect(screen.getByText('No audit log entries yet.')).toBeInTheDocument();
        });

        expect(screen.getByText('System Logging')).toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    test('calls correct API endpoint', async () => {
        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue(mockLogs)
        } as any;

        mockApiFetch.mockResolvedValue(mockResponse);

        render(<SystemLogs />);

        await waitFor(() => {
            expect(mockApiFetch).toHaveBeenCalledWith('/api/system-logs', { method: 'GET' });
        });
    });

    test('formats timestamps correctly', async () => {
        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue(mockLogs)
        } as any;

        mockApiFetch.mockResolvedValue(mockResponse);

        render(<SystemLogs />);

        await waitFor(() => {
            // Check that timestamps are formatted (should contain date/time)
            const timestamps = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/); // Match date patterns
            expect(timestamps.length).toBeGreaterThan(0);
        });
    });

    test('renders table with proper structure when logs exist', async () => {
        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue(mockLogs)
        } as any;

        mockApiFetch.mockResolvedValue(mockResponse);

        render(<SystemLogs />);

        await waitFor(() => {
            const table = screen.getByRole('table');
            expect(table).toHaveClass('table', 'table-sm', 'table-striped', 'align-middle');
        });

        // Verify the component structure is rendered
        expect(screen.getByText('System Logging')).toBeInTheDocument();
    });

    test('renders correct number of log entries', async () => {
        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue(mockLogs)
        } as any;

        mockApiFetch.mockResolvedValue(mockResponse);

        render(<SystemLogs />);

        await waitFor(() => {
            // Should have 3 data rows plus 1 header row = 4 total rows
            const rows = screen.getAllByRole('row');
            expect(rows).toHaveLength(4); // 1 header + 3 data rows
        });
    });
});