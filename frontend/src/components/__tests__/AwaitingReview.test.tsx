import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AwaitingReview from '../AwaitingReview';
import { VulnerabilityAPI } from '../../services/api';

jest.mock('../../services/api', () => ({
  VulnerabilityAPI: {
    getAwaitingReview: jest.fn(),
    updateVulnerability: jest.fn(),
  }
}));

const mockedVulnerabilityAPI = VulnerabilityAPI as jest.Mocked<typeof VulnerabilityAPI>;

describe('AwaitingReview Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    mockedVulnerabilityAPI.getAwaitingReview.mockReturnValue(new Promise(() => { }) as any);
    render(<AwaitingReview />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays vulnerabilities after successful fetch', async () => {
    const mockVulnerabilities = [
      {
        id: 1,
        cve_id: 'CVE-2024-0001',
        severity: 'High',
        status: 'Ongoing',
        vulnerability_descriptions: 'Critical SQL injection vulnerability in web application',
        ticket_link: null,
        analyst_notes: null,
        reviewed: false,
        software_vendors: ['Microsoft'],
        software_names: ['Windows'],
        software_versions: ['10.0'],
        os_platforms: ['Windows'],
        published_dates: ['2024-01-15T00:00:00.000Z'],
        discovered_dates: ['2024-01-10T00:00:00.000Z'],
        epss_score: 0.85
      },
      {
        id: 2,
        cve_id: 'CVE-2024-0002',
        severity: 'Critical',
        status: 'Accepted',
        vulnerability_descriptions: 'Cross-site scripting vulnerability in login form',
        ticket_link: null,
        analyst_notes: null,
        reviewed: false,
        software_vendors: ['Apache'],
        software_names: ['Apache HTTP Server'],
        software_versions: ['2.4.41'],
        os_platforms: ['Linux'],
        published_dates: ['2024-01-14T00:00:00.000Z'],
        discovered_dates: ['2024-01-12T00:00:00.000Z'],
        epss_score: 0.45
      }
    ];

    mockedVulnerabilityAPI.getAwaitingReview.mockResolvedValueOnce(mockVulnerabilities);

    render(<AwaitingReview />);

    await waitFor(() => {
      expect(screen.getAllByText('CVE-2024-0001')).toHaveLength(2); // Badge and title
    });
    expect(screen.getAllByText('CVE-2024-0002')).toHaveLength(2); // Badge and title
  });

  test('displays correct severity badges', async () => {
    const mockVulnerabilities = [
      {
        id: 1,
        cve_id: 'CVE-2024-0001',
        severity: 'High',
        status: 'Ongoing',
        vulnerability_descriptions: 'High severity test',
        reviewed: false,
        software_vendors: ['Microsoft'],
        software_names: ['Windows'],
        software_versions: ['10.0'],
        os_platforms: ['Windows'],
        published_dates: ['2024-01-15T00:00:00.000Z'],
        discovered_dates: ['2024-01-10T00:00:00.000Z'],
        epss_score: 0.85
      },
      {
        id: 2,
        cve_id: 'CVE-2024-0002',
        severity: 'Medium',
        status: 'Ongoing',
        vulnerability_descriptions: 'Medium severity test',
        reviewed: false,
        software_vendors: ['Apache'],
        software_names: ['Apache HTTP Server'],
        software_versions: ['2.4.41'],
        os_platforms: ['Linux'],
        published_dates: ['2024-01-14T00:00:00.000Z'],
        discovered_dates: ['2024-01-12T00:00:00.000Z'],
        epss_score: 0.45
      },
      {
        id: 3,
        cve_id: 'CVE-2024-0003',
        severity: 'Low',
        status: 'Ongoing',
        vulnerability_descriptions: 'Low severity test',
        reviewed: false,
        software_vendors: ['Oracle'],
        software_names: ['Oracle Database'],
        software_versions: ['19c'],
        os_platforms: ['Oracle Linux'],
        published_dates: ['2024-01-13T00:00:00.000Z'],
        discovered_dates: ['2024-01-11T00:00:00.000Z'],
        epss_score: 0.25
      }
    ];

    mockedVulnerabilityAPI.getAwaitingReview.mockResolvedValueOnce(mockVulnerabilities);

    render(<AwaitingReview />);

    await waitFor(() => {
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
    });
  });

  test('opens review modal when Review button is clicked', async () => {
    const mockVulnerabilities = [
      {
        id: 1,
        cve_id: 'CVE-2024-0001',
        severity: 'High',
        status: 'Ongoing',
        vulnerability_descriptions: 'Test vulnerability',
        reviewed: false,
        software_vendors: ['Microsoft'],
        software_names: ['Windows'],
        software_versions: ['10.0'],
        os_platforms: ['Windows'],
        published_dates: ['2024-01-15T00:00:00.000Z'],
        discovered_dates: ['2024-01-10T00:00:00.000Z'],
        epss_score: 0.85
      }
    ];

    mockedVulnerabilityAPI.getAwaitingReview.mockResolvedValueOnce(mockVulnerabilities);

    render(<AwaitingReview />);

    await waitFor(() => {
      expect(screen.getAllByText('CVE-2024-0001')).toHaveLength(2); // Badge and title
    });

    const reviewButton = screen.getByRole('button', { name: /review/i });
    fireEvent.click(reviewButton);

    await waitFor(() => {
      expect(screen.getByText(/review vulnerability/i)).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockedVulnerabilityAPI.getAwaitingReview.mockRejectedValueOnce(new Error('API Error'));

    render(<AwaitingReview />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  test('displays empty state when no vulnerabilities are awaiting review', async () => {
    mockedVulnerabilityAPI.getAwaitingReview.mockResolvedValueOnce([]);

    render(<AwaitingReview />);

    await waitFor(() => {
      expect(screen.getByText('0 vulnerabilities need assessment and review')).toBeInTheDocument();
    });
  });

  test('removes vulnerability from list after successful review with Closed status', async () => {
    const mockVulnerabilities = [
      {
        id: 1,
        cve_id: 'CVE-2024-0001',
        severity: 'High',
        status: 'Ongoing',
        vulnerability_descriptions: 'Test vulnerability',
        reviewed: false,
        software_vendors: ['Microsoft'],
        software_names: ['Windows'],
        software_versions: ['10.0'],
        os_platforms: ['Windows'],
        published_dates: ['2024-01-15T00:00:00.000Z'],
        discovered_dates: ['2024-01-10T00:00:00.000Z'],
        epss_score: 0.85
      }
    ];

    mockedVulnerabilityAPI.getAwaitingReview.mockResolvedValueOnce(mockVulnerabilities);
    mockedVulnerabilityAPI.updateVulnerability.mockResolvedValueOnce({ success: true });
    mockedVulnerabilityAPI.getAwaitingReview.mockResolvedValueOnce([]); // Empty after review

    render(<AwaitingReview />);

    await waitFor(() => {
      expect(screen.getAllByText('CVE-2024-0001')).toHaveLength(2); // Badge and title
    });

    const reviewButton = screen.getByRole('button', { name: /review/i });
    fireEvent.click(reviewButton);

    await waitFor(() => {
      expect(screen.getByText(/review vulnerability/i)).toBeInTheDocument();
    });

    // Simulate status change to Closed and save
    const statusSelect = screen.getByDisplayValue('Ongoing');
    fireEvent.change(statusSelect, { target: { value: 'Closed' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('0 vulnerabilities need assessment and review')).toBeInTheDocument();
    });
  });

  test('keeps vulnerability in list after review with Ongoing status', async () => {
    const mockVulnerabilities = [
      {
        id: 1,
        cve_id: 'CVE-2024-0001',
        severity: 'High',
        status: 'Ongoing',
        vulnerability_descriptions: 'Test vulnerability',
        reviewed: false,
        software_vendors: ['Microsoft'],
        software_names: ['Windows'],
        software_versions: ['10.0'],
        os_platforms: ['Windows'],
        published_dates: ['2024-01-15T00:00:00.000Z'],
        discovered_dates: ['2024-01-10T00:00:00.000Z'],
        epss_score: 0.85
      }
    ];

    mockedVulnerabilityAPI.getAwaitingReview.mockResolvedValueOnce(mockVulnerabilities);
    mockedVulnerabilityAPI.updateVulnerability.mockResolvedValueOnce({ success: true });
    mockedVulnerabilityAPI.getAwaitingReview.mockResolvedValueOnce(mockVulnerabilities); // Same data after review

    render(<AwaitingReview />);

    await waitFor(() => {
      expect(screen.getAllByText('CVE-2024-0001')).toHaveLength(2); // Badge and title
    });

    const reviewButton = screen.getByRole('button', { name: /review/i });
    fireEvent.click(reviewButton);

    await waitFor(() => {
      expect(screen.getByText(/review vulnerability/i)).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getAllByText('CVE-2024-0001')).toHaveLength(2); // Still there
    });
  });

  test('handles updateVulnerability API error', async () => {
    const mockVulnerabilities = [
      {
        id: 1,
        cve_id: 'CVE-2024-0001',
        severity: 'High',
        status: 'Ongoing',
        vulnerability_descriptions: 'Test vulnerability',
        software_vendors: ['Test Vendor'],
        software_names: ['Test Software'],
        software_versions: ['1.0.0'],
        os_platforms: ['Windows'],
        published_dates: ['2024-01-01'],
        discovered_dates: ['2024-01-01']
      }
    ];

    mockedVulnerabilityAPI.getAwaitingReview.mockResolvedValueOnce(mockVulnerabilities);
    mockedVulnerabilityAPI.updateVulnerability.mockRejectedValueOnce(new Error('Update failed'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<AwaitingReview />);

    await waitFor(() => {
      expect(screen.getAllByText('CVE-2024-0001')[0]).toBeInTheDocument();
    });

    // Open review modal and try to save
    const reviewButton = screen.getByText('Review');
    fireEvent.click(reviewButton);

    await waitFor(() => {
      expect(screen.getByText(/Review Vulnerability/)).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating vulnerability:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  test('normalizeListField handles bracket notation and edge cases', async () => {
    const mockVulnerabilities = [
      {
        id: 1,
        cve_id: 'CVE-2024-0001',
        severity: 'High',
        status: 'Ongoing',
        vulnerability_descriptions: 'Test vulnerability',
        software_vendors: '[Item1, Item2, Item3]', // Bracket notation without quotes
        software_names: '["Quoted1","Quoted2"]', // Bracket notation with quotes
        software_versions: '[]', // Empty bracket notation 
        os_platforms: '[   ]', // Bracket notation with just whitespace
        published_dates: ['2024-01-01'],
        discovered_dates: ['2024-01-01']
      }
    ];

    mockedVulnerabilityAPI.getAwaitingReview.mockResolvedValueOnce(mockVulnerabilities);

    render(<AwaitingReview />);

    await waitFor(() => {
      expect(screen.getAllByText('CVE-2024-0001')[0]).toBeInTheDocument();
    });

    // Check the parsed bracket notation results  
    expect(screen.getByText('Item1, Item2, Item3')).toBeInTheDocument();
    expect(screen.getByText('Quoted1, Quoted2')).toBeInTheDocument();
  });

  test('normalizeListField handles empty string fallback', async () => {
    const mockVulnerabilities = [
      {
        id: 1,
        cve_id: 'CVE-2024-0001',
        severity: 'High',
        status: 'Ongoing',
        vulnerability_descriptions: 'Test vulnerability',
        software_vendors: '', // Empty string - should show fallback
        software_names: '   ', // Whitespace only - should show fallback after trim
        software_versions: ['Version1'], // Not displayed in UI
        os_platforms: ['Windows'],
        published_dates: ['2024-01-01'],
        discovered_dates: ['2024-01-01']
      }
    ];

    mockedVulnerabilityAPI.getAwaitingReview.mockResolvedValueOnce(mockVulnerabilities);

    render(<AwaitingReview />);

    await waitFor(() => {
      expect(screen.getAllByText('CVE-2024-0001')[0]).toBeInTheDocument();
    });

    // Check for fallback em dashes for empty/whitespace vendor and product names
    const dashElements = screen.getAllByText('—');
    expect(dashElements.length).toBeGreaterThanOrEqual(2); // Both empty and whitespace cases
    expect(screen.getByText('Windows')).toBeInTheDocument();
  });

  test('normalizeListField handles null and undefined values', async () => {
    const mockVulnerabilities = [
      {
        id: 1,
        cve_id: 'CVE-2024-0001',
        severity: 'High',
        status: 'Ongoing',
        vulnerability_descriptions: 'Test vulnerability',
        software_vendors: null, // null value - should show dash
        software_names: undefined, // undefined value - should show dash
        software_versions: ['Version1'], // Not displayed in UI
        os_platforms: ['Windows'],
        published_dates: ['2024-01-01'],
        discovered_dates: ['2024-01-01']
      }
    ];

    mockedVulnerabilityAPI.getAwaitingReview.mockResolvedValueOnce(mockVulnerabilities);

    render(<AwaitingReview />);

    await waitFor(() => {
      expect(screen.getAllByText('CVE-2024-0001')[0]).toBeInTheDocument();
    });

    // Check for fallback em dashes for null/undefined vendor and product names
    const dashElements = screen.getAllByText('—');
    expect(dashElements.length).toBeGreaterThanOrEqual(2); // null, undefined cases
    expect(screen.getByText('Windows')).toBeInTheDocument();
  });
});