// Simple text utility functions for testing coverage
export const capitalize = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, length: number): string => {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + '...';
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return 'Not set';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch {
        return 'Invalid date';
    }
};

export const parseSystemsList = (systemsJson: string): string[] => {
    try {
        const parsed = JSON.parse(systemsJson);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};