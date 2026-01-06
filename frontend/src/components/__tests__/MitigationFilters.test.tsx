import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MitigationFilters from '../MitigationFilters';

describe('MitigationFilters Component', () => {
    const mockProps = {
        searchTerm: '',
        setSearchTerm: jest.fn(),
        filterStatus: 'all',
        setFilterStatus: jest.fn(),
        filterPriority: 'all',
        setFilterPriority: jest.fn(),
        onCreateClick: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders component with all elements', () => {
        render(<MitigationFilters {...mockProps} />);

        expect(screen.getByText('Mitigations')).toBeInTheDocument();
        expect(screen.getByText('+ Create Mitigation')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search mitigations...')).toBeInTheDocument();
        expect(screen.getByDisplayValue('All Status')).toBeInTheDocument();
        expect(screen.getByDisplayValue('All Priority')).toBeInTheDocument();
    });

    test('displays search term value correctly', () => {
        render(<MitigationFilters {...mockProps} searchTerm="test search" />);

        const searchInput = screen.getByPlaceholderText('Search mitigations...');
        expect(searchInput).toHaveValue('test search');
    });

    test('calls setSearchTerm when search input changes', () => {
        render(<MitigationFilters {...mockProps} />);

        const searchInput = screen.getByPlaceholderText('Search mitigations...');
        fireEvent.change(searchInput, { target: { value: 'new search term' } });

        expect(mockProps.setSearchTerm).toHaveBeenCalledWith('new search term');
    });

    test('displays status filter value correctly', () => {
        render(<MitigationFilters {...mockProps} filterStatus="pending" />);

        const statusSelect = screen.getByDisplayValue('Pending');
        expect(statusSelect).toBeInTheDocument();
    });

    test('calls setFilterStatus when status filter changes', () => {
        render(<MitigationFilters {...mockProps} />);

        const statusSelect = screen.getByDisplayValue('All Status');
        fireEvent.change(statusSelect, { target: { value: 'in-progress' } });

        expect(mockProps.setFilterStatus).toHaveBeenCalledWith('in-progress');
    });

    test('displays all status options', () => {
        render(<MitigationFilters {...mockProps} />);

        // Check for presence of all status options
        expect(screen.getByText('All Status')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
        expect(screen.getByText('Implemented')).toBeInTheDocument();
        expect(screen.getByText('Rejected')).toBeInTheDocument();
    });

    test('displays priority filter value correctly', () => {
        render(<MitigationFilters {...mockProps} filterPriority="high" />);

        const prioritySelect = screen.getByDisplayValue('High');
        expect(prioritySelect).toBeInTheDocument();
    });

    test('calls setFilterPriority when priority filter changes', () => {
        render(<MitigationFilters {...mockProps} />);

        const prioritySelect = screen.getByDisplayValue('All Priority');
        fireEvent.change(prioritySelect, { target: { value: 'critical' } });

        expect(mockProps.setFilterPriority).toHaveBeenCalledWith('critical');
    });

    test('displays all priority options', () => {
        render(<MitigationFilters {...mockProps} />);

        // Check for presence of all priority options
        expect(screen.getByText('All Priority')).toBeInTheDocument();
        expect(screen.getByText('Critical')).toBeInTheDocument();
        expect(screen.getByText('High')).toBeInTheDocument();
        expect(screen.getByText('Medium')).toBeInTheDocument();
        expect(screen.getByText('Low')).toBeInTheDocument();
    });

    test('calls onCreateClick when create button is clicked', () => {
        render(<MitigationFilters {...mockProps} />);

        const createButton = screen.getByText('+ Create Mitigation');
        fireEvent.click(createButton);

        expect(mockProps.onCreateClick).toHaveBeenCalledTimes(1);
    });

    test('has proper CSS classes for layout', () => {
        render(<MitigationFilters {...mockProps} />);

        const searchInput = screen.getByPlaceholderText('Search mitigations...');
        expect(searchInput).toHaveClass('form-control');

        const statusSelect = screen.getByDisplayValue('All Status');
        expect(statusSelect).toHaveClass('form-select');

        const prioritySelect = screen.getByDisplayValue('All Priority');
        expect(prioritySelect).toHaveClass('form-select');

        const createButton = screen.getByText('+ Create Mitigation');
        expect(createButton).toHaveClass('btn', 'btn-primary');
    });

    test('renders with different combinations of filter values', () => {
        const { rerender } = render(
            <MitigationFilters
                {...mockProps}
                searchTerm="vulnerability"
                filterStatus="implemented"
                filterPriority="critical"
            />
        );

        expect(screen.getByDisplayValue('vulnerability')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Implemented')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Critical')).toBeInTheDocument();

        // Test re-rendering with different values
        rerender(
            <MitigationFilters
                {...mockProps}
                searchTerm=""
                filterStatus="pending"
                filterPriority="low"
            />
        );

        expect(screen.getByDisplayValue('')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Pending')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Low')).toBeInTheDocument();
    });
});