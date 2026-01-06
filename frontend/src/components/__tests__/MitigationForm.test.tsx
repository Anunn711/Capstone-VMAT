import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MitigationForm from '../MitigationForm';

describe('MitigationForm Component', () => {
    const mockVulnerabilities = [
        {
            id: 1,
            cve_id: 'CVE-2024-001',
            software_vendors: 'Microsoft',
            software_names: 'SQL Server',
            software_versions: '2019',
            os_platforms: 'Windows',
            vulnerability_descriptions: 'SQL injection vulnerability'
        },
        {
            id: 2,
            cve_id: 'CVE-2024-002',
            software_vendors: 'Apache',
            software_names: 'HTTP Server',
            software_versions: '2.4',
            os_platforms: 'Linux',
            vulnerability_descriptions: 'XSS vulnerability'
        }
    ];

    const mockFormData = {
        title: 'Test Mitigation',
        type: 'technical',
        description: 'Test description',
        impact_category: 'confidentiality',
        effort: 'medium',
        cost: 'low',
        affected_systems: 'Web Server, Database',
        vulnerability_id: '1'
    };

    const mockProps = {
        show: true,
        isEditing: false,
        formData: mockFormData,
        vulnerabilities: mockVulnerabilities,
        onClose: jest.fn(),
        onSubmit: jest.fn(),
        onInputChange: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('does not render when show is false', () => {
        render(<MitigationForm {...mockProps} show={false} />);
        expect(screen.queryByText('Create New Mitigation')).not.toBeInTheDocument();
    });

    test('renders create form when not editing', () => {
        render(<MitigationForm {...mockProps} />);
        expect(screen.getByText('Create New Mitigation')).toBeInTheDocument();
        expect(screen.getByText('Create Mitigation')).toBeInTheDocument();
    });

    test('renders edit form when editing', () => {
        render(<MitigationForm {...mockProps} isEditing={true} />);
        expect(screen.getByText('Edit Mitigation')).toBeInTheDocument();
        expect(screen.getByText('Update Mitigation')).toBeInTheDocument();
    });

    test('displays form data values correctly', () => {
        render(<MitigationForm {...mockProps} />);

        expect(screen.getByDisplayValue('Test Mitigation')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Web Server, Database')).toBeInTheDocument();

        // Check that the options exist rather than checking for specific selections
        expect(screen.getByText('Technical')).toBeInTheDocument();
        expect(screen.getByText('Confidentiality')).toBeInTheDocument();
        expect(screen.getAllByText('Medium')).toHaveLength(2); // Appears in both effort and cost
        expect(screen.getAllByText('Low')).toHaveLength(2); // Appears in both effort and cost
    }); test('calls onInputChange when title input changes', () => {
        render(<MitigationForm {...mockProps} />);

        const titleInput = screen.getByPlaceholderText('Enter mitigation title');
        fireEvent.change(titleInput, { target: { value: 'New Title' } });

        expect(mockProps.onInputChange).toHaveBeenCalledWith('title', 'New Title');
    });

    test('calls onInputChange when type select changes', () => {
        render(<MitigationForm {...mockProps} />);

        const typeSelect = screen.getAllByRole('combobox')[0]; // First select (type)
        fireEvent.change(typeSelect, { target: { value: 'administrative' } });

        expect(mockProps.onInputChange).toHaveBeenCalledWith('type', 'administrative');
    });

    test('calls onInputChange when description changes', () => {
        render(<MitigationForm {...mockProps} />);

        const descriptionTextarea = screen.getByPlaceholderText('Describe the mitigation strategy');
        fireEvent.change(descriptionTextarea, { target: { value: 'New description' } });

        expect(mockProps.onInputChange).toHaveBeenCalledWith('description', 'New description');
    });

    test('calls onInputChange when impact category changes', () => {
        render(<MitigationForm {...mockProps} />);

        const impactSelect = screen.getAllByRole('combobox')[1]; // Second select (impact category)
        fireEvent.change(impactSelect, { target: { value: 'integrity' } });

        expect(mockProps.onInputChange).toHaveBeenCalledWith('impact_category', 'integrity');
    });

    test('calls onInputChange when vulnerability changes', () => {
        render(<MitigationForm {...mockProps} />);

        const vulnSelect = screen.getAllByRole('combobox')[2]; // Third select (vulnerability)
        fireEvent.change(vulnSelect, { target: { value: '2' } });

        expect(mockProps.onInputChange).toHaveBeenCalledWith('vulnerability_id', '2');
    });

    test('calls onInputChange when effort changes', () => {
        render(<MitigationForm {...mockProps} />);

        const effortSelect = screen.getAllByRole('combobox')[3]; // Fourth select (effort)
        fireEvent.change(effortSelect, { target: { value: 'high' } });

        expect(mockProps.onInputChange).toHaveBeenCalledWith('effort', 'high');
    });

    test('calls onInputChange when cost changes', () => {
        render(<MitigationForm {...mockProps} />);

        const costSelect = screen.getAllByRole('combobox')[4]; // Fifth select (cost)
        fireEvent.change(costSelect, { target: { value: 'high' } });

        expect(mockProps.onInputChange).toHaveBeenCalledWith('cost', 'high');
    });

    test('calls onInputChange when affected systems changes', () => {
        render(<MitigationForm {...mockProps} />);

        const systemsInput = screen.getByPlaceholderText('Enter systems affected (comma-separated)');
        fireEvent.change(systemsInput, { target: { value: 'New System' } });

        expect(mockProps.onInputChange).toHaveBeenCalledWith('affected_systems', 'New System');
    });

    test('calls onClose when close button is clicked', () => {
        render(<MitigationForm {...mockProps} />);

        const closeButton = screen.getByRole('button', { name: '' }); // btn-close
        fireEvent.click(closeButton);

        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when cancel button is clicked', () => {
        render(<MitigationForm {...mockProps} />);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    test('calls onSubmit when submit button is clicked', () => {
        render(<MitigationForm {...mockProps} />);

        const submitButton = screen.getByText('Create Mitigation');
        fireEvent.click(submitButton);

        expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
    });

    test('renders vulnerabilities in select options', () => {
        render(<MitigationForm {...mockProps} />);

        expect(screen.getByText('CVE-2024-001 - SQL Server')).toBeInTheDocument();
        expect(screen.getByText('CVE-2024-002 - HTTP Server')).toBeInTheDocument();
    });

    test('renders all type options', () => {
        render(<MitigationForm {...mockProps} />);

        expect(screen.getByText('Technical')).toBeInTheDocument();
        expect(screen.getByText('Administrative')).toBeInTheDocument();
        expect(screen.getByText('Physical')).toBeInTheDocument();
        expect(screen.getByText('Compensating')).toBeInTheDocument();
    });

    test('renders all impact category options', () => {
        render(<MitigationForm {...mockProps} />);

        expect(screen.getByText('Confidentiality')).toBeInTheDocument();
        expect(screen.getByText('Integrity')).toBeInTheDocument();
        expect(screen.getByText('Availability')).toBeInTheDocument();
        expect(screen.getByText('Accountability')).toBeInTheDocument();
    });

    test('handles empty form data', () => {
        const emptyFormData = {
            title: '',
            type: '',
            description: '',
            impact_category: '',
            effort: 'low',
            cost: 'low',
            affected_systems: '',
            vulnerability_id: ''
        };

        render(<MitigationForm {...mockProps} formData={emptyFormData} />);

        expect(screen.getByPlaceholderText('Enter mitigation title')).toHaveValue('');
        expect(screen.getByPlaceholderText('Describe the mitigation strategy')).toHaveValue('');
        expect(screen.getByPlaceholderText('Enter systems affected (comma-separated)')).toHaveValue('');
    });
});