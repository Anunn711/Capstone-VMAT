import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewModal from '../ReviewModal';

describe('ReviewModal Component', () => {
  const mockVulnerability = {
    id: 1,
    cve_id: 'CVE-2024-0001',
    severity: 'High',
    status: 'Ongoing',
    vulnerability_descriptions: 'Test vulnerability description',
    ticket_link: 'https://example.com/ticket/001',
    analyst_notes: 'Initial notes',
    reviewed: false,
    software_vendors: ['Test Vendor'],
    software_names: ['Test Software'],
    software_versions: ['1.0.0'],
    os_platforms: ['Windows'],
    published_dates: ['2024-01-01'],
    discovered_dates: ['2024-01-01']
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal with vulnerability data', () => {
    render(
      <ReviewModal
        onClose={mockOnClose}
        onSave={mockOnSave}
        vulnerability={mockVulnerability}
      />
    );

    expect(screen.getByText(/review vulnerability/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ongoing')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/ticket/001')).toBeInTheDocument();
  });

  test('calls onClose when Close button is clicked', () => {
    render(
      <ReviewModal
        onClose={mockOnClose}
        onSave={mockOnSave}
        vulnerability={mockVulnerability}
      />
    );

    // Use the close button without aria-label
    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('updates status when dropdown is changed', () => {
    render(
      <ReviewModal
        onClose={mockOnClose}
        onSave={mockOnSave}
        vulnerability={mockVulnerability}
      />
    );

    // Find the status select by its current value
    const statusSelect = screen.getByDisplayValue('Ongoing');
    fireEvent.change(statusSelect, { target: { value: 'Mitigated' } });

    expect(screen.getByDisplayValue('Mitigated')).toBeInTheDocument();
  });

  test('updates ticket ID when input is changed', () => {
    render(
      <ReviewModal
        onClose={mockOnClose}
        onSave={mockOnSave}
        vulnerability={mockVulnerability}
      />
    );

    const ticketInput = screen.getByDisplayValue('https://example.com/ticket/001');
    fireEvent.change(ticketInput, { target: { value: 'TICKET-999' } });

    expect(screen.getByDisplayValue('TICKET-999')).toBeInTheDocument();
  });

  test('updates analyst notes when textarea is changed', () => {
    render(
      <ReviewModal
        onClose={mockOnClose}
        onSave={mockOnSave}
        vulnerability={mockVulnerability}
      />
    );

    const notesTextarea = screen.getByDisplayValue('Initial notes');
    fireEvent.change(notesTextarea, { target: { value: 'Updated notes' } });

    expect(screen.getByDisplayValue('Updated notes')).toBeInTheDocument();
  });

  test('calls onSave with correct data when Save Changes is clicked', async () => {
    render(
      <ReviewModal
        onClose={mockOnClose}
        onSave={mockOnSave}
        vulnerability={mockVulnerability}
      />
    );

    const statusSelect = screen.getByDisplayValue('Ongoing');
    fireEvent.change(statusSelect, { target: { value: 'Closed' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(mockOnSave).toHaveBeenCalledWith({
      status: 'Closed',
      ticketId: 'https://example.com/ticket/001',
      severity: 'High',
      reviewNotes: 'Initial notes'
    });
  });

  test('displays all status options', () => {
    render(
      <ReviewModal
        onClose={mockOnClose}
        onSave={mockOnSave}
        vulnerability={mockVulnerability}
      />
    );

    const statusSelect = screen.getByDisplayValue('Ongoing');
    const options = Array.from(statusSelect.children) as HTMLOptionElement[];
    const optionValues = options.map(option => option.value);

    expect(optionValues).toContain('Ongoing');
    expect(optionValues).toContain('Accepted');
    expect(optionValues).toContain('Closed');
    expect(optionValues).toContain('Mitigated');
  });

  test('closes modal when Escape key is pressed', () => {
    render(
      <ReviewModal
        onClose={mockOnClose}
        onSave={mockOnSave}
        vulnerability={mockVulnerability}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('closes modal when no onSave function is provided', async () => {
    render(
      <ReviewModal
        onClose={mockOnClose}
        vulnerability={mockVulnerability}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save changes/i });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('shows error when onSave returns false', async () => {
    const mockFailingSave = jest.fn().mockResolvedValue(false);

    render(
      <ReviewModal
        onClose={mockOnClose}
        onSave={mockFailingSave}
        vulnerability={mockVulnerability}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save changes/i });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/save failed/i)).toBeInTheDocument();
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('shows error when onSave throws an exception', async () => {
    const mockErrorSave = jest.fn().mockRejectedValue(new Error('Network error'));

    render(
      <ReviewModal
        onClose={mockOnClose}
        onSave={mockErrorSave}
        vulnerability={mockVulnerability}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save changes/i });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/save failed/i)).toBeInTheDocument();
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
