import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CsvUploadModal from '../CsvUploadModal';

describe('CsvUploadModal Component', () => {
    const defaultProps = {
        show: true,
        onClose: jest.fn(),
        onSubmit: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders modal when show is true', () => {
        render(<CsvUploadModal {...defaultProps} />);

        expect(screen.getByText('Import CVEs from CSV')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    test('does not render modal when show is false', () => {
        render(<CsvUploadModal {...defaultProps} show={false} />);

        expect(screen.queryByText('Import CVEs from CSV')).not.toBeInTheDocument();
    });

    test('handles file selection', () => {
        render(<CsvUploadModal {...defaultProps} />);

        const fileInput = screen.getByDisplayValue('');
        expect(fileInput).toBeInTheDocument();
    });

    test('calls onClose when Cancel button is clicked', () => {
        const mockOnClose = jest.fn();
        render(<CsvUploadModal {...defaultProps} onClose={mockOnClose} />);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    test('calls onSubmit and onClose when Submit button is clicked with file', () => {
        const mockOnSubmit = jest.fn();
        const mockOnClose = jest.fn();
        render(<CsvUploadModal {...defaultProps} onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        // First select a file
        const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
        const file = new File(['test'], 'test.csv', { type: 'text/csv' });
        Object.defineProperty(fileInput, 'files', {
            value: [file],
            writable: false,
        });
        fireEvent.change(fileInput);

        // Now click submit
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        expect(mockOnSubmit).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('submit button is disabled when no file is selected', () => {
        render(<CsvUploadModal {...defaultProps} />);

        const submitButton = screen.getByText('Submit');
        expect(submitButton).toBeDisabled();
    });
});