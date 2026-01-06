import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MitigationStatusModal from '../MitigationStatusModal';

const mockMitigation = {
    id: 1,
    title: 'Test Mitigation',
    description: 'Test description',
    status: 'pending' as const,
    priority: 'high' as const,
    category: 'Security',
    type: 'Technical',
    impact_category: 'High',
    effort: 'Medium',
    cost: '$1000',
    affected_systems: 'Web Server',
    risk_reduction: 80,
    icon: 'security',
    due_date: '2024-12-31',
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
    vulnerability_id: 1,
    vulnerability: {}
};

const mockFormData = {
    status: 'in-progress',
    implemented_by: 'John Doe',
    implementation_date: '2024-12-01',
    verification_date: '2024-12-15',
    notes: 'Test implementation notes',
    priority: 'high'
};

const defaultProps = {
    show: true,
    mitigation: mockMitigation,
    formData: mockFormData,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    onInputChange: jest.fn()
};

describe('MitigationStatusModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders modal when show is true', () => {
        render(<MitigationStatusModal {...defaultProps} />);

        expect(screen.getByText('Update Mitigation Status')).toBeInTheDocument();
        expect(screen.getByText('Updating: Test Mitigation')).toBeInTheDocument();
    });

    it('does not render when show is false', () => {
        render(<MitigationStatusModal {...defaultProps} show={false} />);

        expect(screen.queryByText('Update Mitigation Status')).not.toBeInTheDocument();
    });

    it('does not render when mitigation is null', () => {
        render(<MitigationStatusModal {...defaultProps} mitigation={null} />);

        expect(screen.queryByText('Update Mitigation Status')).not.toBeInTheDocument();
    });

    it('renders all form fields with correct values', () => {
        const { container } = render(<MitigationStatusModal {...defaultProps} />);

        // Status select - check by class
        const statusSelect = container.querySelector('.form-select') as HTMLSelectElement;
        expect(statusSelect).toHaveValue('in-progress');

        // Text inputs
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2024-12-01')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2024-12-15')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test implementation notes')).toBeInTheDocument();
    }); it('calls onInputChange when status select changes', () => {
        render(<MitigationStatusModal {...defaultProps} />);

        const statusSelect = document.querySelectorAll('.form-select')[0] as HTMLSelectElement;
        fireEvent.change(statusSelect, { target: { value: 'implemented' } });

        expect(defaultProps.onInputChange).toHaveBeenCalledWith('status', 'implemented');
    }); it('calls onInputChange when priority select changes', () => {
        render(<MitigationStatusModal {...defaultProps} />);

        const prioritySelect = document.querySelectorAll('.form-select')[1] as HTMLSelectElement;
        fireEvent.change(prioritySelect, { target: { value: 'critical' } });

        expect(defaultProps.onInputChange).toHaveBeenCalledWith('priority', 'critical');
    }); it('calls onInputChange when implemented_by input changes', () => {
        render(<MitigationStatusModal {...defaultProps} />);

        const implementedByInput = screen.getByDisplayValue('John Doe');
        fireEvent.change(implementedByInput, { target: { value: 'Jane Smith' } });

        expect(defaultProps.onInputChange).toHaveBeenCalledWith('implemented_by', 'Jane Smith');
    });

    it('calls onInputChange when implementation_date input changes', () => {
        render(<MitigationStatusModal {...defaultProps} />);

        const implementationDateInput = screen.getByDisplayValue('2024-12-01');
        fireEvent.change(implementationDateInput, { target: { value: '2024-12-10' } });

        expect(defaultProps.onInputChange).toHaveBeenCalledWith('implementation_date', '2024-12-10');
    });

    it('calls onInputChange when verification_date input changes', () => {
        render(<MitigationStatusModal {...defaultProps} />);

        const verificationDateInput = screen.getByDisplayValue('2024-12-15');
        fireEvent.change(verificationDateInput, { target: { value: '2024-12-20' } });

        expect(defaultProps.onInputChange).toHaveBeenCalledWith('verification_date', '2024-12-20');
    });

    it('calls onInputChange when notes textarea changes', () => {
        render(<MitigationStatusModal {...defaultProps} />);

        const notesTextarea = screen.getByDisplayValue('Test implementation notes');
        fireEvent.change(notesTextarea, { target: { value: 'Updated notes' } });

        expect(defaultProps.onInputChange).toHaveBeenCalledWith('notes', 'Updated notes');
    });

    it('calls onClose when close button is clicked', () => {
        render(<MitigationStatusModal {...defaultProps} />);

        const closeButton = screen.getByRole('button', { name: '' }); // Close button has no text
        fireEvent.click(closeButton);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when Cancel button is clicked', () => {
        render(<MitigationStatusModal {...defaultProps} />);

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        fireEvent.click(cancelButton);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onSubmit when Update Status button is clicked', () => {
        render(<MitigationStatusModal {...defaultProps} />);

        const updateButton = screen.getByRole('button', { name: 'Update Status' });
        fireEvent.click(updateButton);

        expect(defaultProps.onSubmit).toHaveBeenCalled();
    });

    it('renders all status options', () => {
        render(<MitigationStatusModal {...defaultProps} />);

        const statusSelect = document.querySelectorAll('.form-select')[0] as HTMLSelectElement;

        // Check all options exist
        expect(statusSelect).toContainHTML('<option value="pending">Pending</option>');
        expect(statusSelect).toContainHTML('<option value="in-progress">In Progress</option>');
        expect(statusSelect).toContainHTML('<option value="implemented">Implemented</option>');
        expect(statusSelect).toContainHTML('<option value="rejected">Rejected</option>');
    }); it('renders all priority options', () => {
        render(<MitigationStatusModal {...defaultProps} />);

        const prioritySelect = document.querySelectorAll('.form-select')[1] as HTMLSelectElement;

        // Check all options exist
        expect(prioritySelect).toContainHTML('<option value="low">Low</option>');
        expect(prioritySelect).toContainHTML('<option value="medium">Medium</option>');
        expect(prioritySelect).toContainHTML('<option value="high">High</option>');
        expect(prioritySelect).toContainHTML('<option value="critical">Critical</option>');
    }); it('has correct placeholder text', () => {
        render(<MitigationStatusModal {...defaultProps} />);

        expect(screen.getByPlaceholderText('Enter name or team responsible')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Add notes about implementation progress, challenges, or verification results...')).toBeInTheDocument();
    });
});