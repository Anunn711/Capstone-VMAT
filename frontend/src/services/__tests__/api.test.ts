import { apiFetch } from '../api';

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
    writable: true,
    value: '',
});

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('API Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
        document.cookie = '';
    });

    test('makes basic GET request', async () => {
        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue({ data: 'test' }),
            clone: jest.fn().mockReturnThis(),
        } as any;

        mockFetch.mockResolvedValue(mockResponse);

        await apiFetch('/api/test');

        expect(mockFetch).toHaveBeenCalledWith('/api/test', {
            credentials: 'include',
        });
    }); test('makes POST request with CSRF token', async () => {
        document.cookie = 'csrf_access_token=test-csrf-token';

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: 'test' }),
        } as Response);

        await apiFetch('/api/test', {
            method: 'POST',
            body: JSON.stringify({ test: 'data' }),
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/test', {
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify({ test: 'data' }),
            headers: {
                'X-CSRF-TOKEN': 'test-csrf-token',
            },
        });
    });

    test('makes PUT request with CSRF token', async () => {
        document.cookie = 'csrf_access_token=put-csrf-token';

        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue({ data: 'updated' }),
            clone: jest.fn().mockReturnThis(),
        } as any;

        mockFetch.mockResolvedValue(mockResponse);

        await apiFetch('/api/test/1', {
            method: 'PUT',
            body: JSON.stringify({ updated: 'data' }),
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
            credentials: 'include',
            method: 'PUT',
            body: JSON.stringify({ updated: 'data' }),
            headers: {
                'X-CSRF-TOKEN': 'put-csrf-token',
            },
        });
    }); test('makes DELETE request with CSRF token', async () => {
        document.cookie = 'csrf_access_token=delete-csrf-token';

        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue({ success: true }),
            clone: jest.fn().mockReturnThis(),
        } as any;

        mockFetch.mockResolvedValue(mockResponse);

        await apiFetch('/api/test/1', { method: 'DELETE' });

        expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
            credentials: 'include',
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': 'delete-csrf-token',
            },
        });
    }); test('does not add CSRF header for GET requests', async () => {
        document.cookie = 'csrf_access_token=should-not-be-used';

        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue({ data: 'test' }),
            clone: jest.fn().mockReturnThis(),
        } as any;

        mockFetch.mockResolvedValue(mockResponse);

        await apiFetch('/api/test', { method: 'GET' });

        expect(mockFetch).toHaveBeenCalledWith('/api/test', {
            credentials: 'include',
            method: 'GET',
        });
    }); test('handles missing CSRF token gracefully', async () => {
        // No CSRF token in cookies
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: 'test' }),
        } as Response);

        await apiFetch('/api/test', { method: 'POST' });

        expect(mockFetch).toHaveBeenCalledWith('/api/test', {
            credentials: 'include',
            method: 'POST',
        });
    });

    test('handles fetch errors', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        await expect(apiFetch('/api/test')).rejects.toThrow('Network error');
    });

    test('preserves existing headers while adding CSRF', async () => {
        document.cookie = 'csrf_access_token=test-token';

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: 'test' }),
        } as Response);

        await apiFetch('/api/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Custom-Header': 'custom-value',
            },
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/test', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Custom-Header': 'custom-value',
                'X-CSRF-TOKEN': 'test-token',
            },
        });
    });

    test('handles complex cookie parsing', async () => {
        document.cookie = 'other_cookie=value1; csrf_access_token=complex-token-123; another=value2';

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: 'test' }),
            clone: function () { return this; }
        } as any);

        await apiFetch('/api/test', { method: 'POST' });

        expect(mockFetch).toHaveBeenCalledWith('/api/test', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': 'complex-token-123',
            },
        });
    });

    test('handles network error with cached fallback for GET requests', async () => {
        const cachedData = { data: 'cached-response' };
        const cacheKey = 'vmat:cache:http://localhost/api/test';
        const cachedPayload = { ts: Date.now(), data: cachedData };

        localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedPayload));
        mockFetch.mockRejectedValue(new Error('Network error'));

        const response = await apiFetch('/api/test');

        expect(response.ok).toBe(true);
        expect(response.status).toBe(200);
        expect(response.headers.get('X-VMAT-CACHED')).toBe('1');

        const result = await response.json();
        expect(result).toEqual(cachedData);
        expect(localStorageMock.getItem).toHaveBeenCalledWith(cacheKey);
    });

    test('throws network error when no cache available', async () => {
        localStorageMock.getItem.mockReturnValue(null);
        mockFetch.mockRejectedValue(new Error('Network error'));

        await expect(apiFetch('/api/test')).rejects.toThrow('Network error');
    });

    test('serves cached response for non-OK GET responses', async () => {
        const cachedData = { data: 'cached-fallback' };
        const cacheKey = 'vmat:cache:http://localhost/api/test';
        const cachedPayload = { ts: Date.now(), data: cachedData };

        localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedPayload));
        mockFetch.mockResolvedValue({
            ok: false,
            status: 404,
            statusText: 'Not Found'
        } as Response);

        const response = await apiFetch('/api/test');

        expect(response.ok).toBe(true);
        expect(response.status).toBe(200);
        expect(response.headers.get('X-VMAT-CACHED')).toBe('1');

        const result = await response.json();
        expect(result).toEqual(cachedData);
    });

    test('caches successful GET responses in background', async () => {
        const responseData = { data: 'fresh-data' };
        const cacheKey = 'vmat:cache:http://localhost/api/test';

        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue(responseData),
            clone: jest.fn().mockReturnThis()
        };

        mockFetch.mockResolvedValue(mockResponse as any);

        const response = await apiFetch('/api/test');

        expect(response).toBe(mockResponse);

        // Wait a tick for background caching
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockResponse.clone).toHaveBeenCalled();
        expect(mockResponse.json).toHaveBeenCalled();
    });

    test('ignores caching errors for successful responses', async () => {
        const responseData = { data: 'test' };
        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue(responseData),
            clone: jest.fn().mockReturnThis()
        };

        // Mock localStorage.setItem to throw
        localStorageMock.setItem.mockImplementation(() => {
            throw new Error('Storage quota exceeded');
        });

        mockFetch.mockResolvedValue(mockResponse as any);

        const response = await apiFetch('/api/test');

        // Should still return the response even if caching fails
        expect(response).toBe(mockResponse);
    });

    test('handles expired cache entries', async () => {
        const expiredCachePayload = {
            ts: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago (expired)
            data: { data: 'old-data' }
        };

        localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredCachePayload));
        localStorageMock.removeItem.mockImplementation();

        mockFetch.mockRejectedValue(new Error('Network error'));

        await expect(apiFetch('/api/test')).rejects.toThrow('Network error');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('vmat:cache:http://localhost/api/test');
    });

    test('handles malformed cache entries gracefully', async () => {
        localStorageMock.getItem.mockReturnValue('invalid-json');
        mockFetch.mockRejectedValue(new Error('Network error'));

        await expect(apiFetch('/api/test')).rejects.toThrow('Network error');
    });

    test('handles cache entries with missing properties', async () => {
        const incompleteCachePayload = { ts: Date.now() }; // missing data property

        localStorageMock.getItem.mockReturnValue(JSON.stringify(incompleteCachePayload));
        mockFetch.mockRejectedValue(new Error('Network error'));

        await expect(apiFetch('/api/test')).rejects.toThrow('Network error');
    });

    test('handles localStorage access errors during read', async () => {
        localStorageMock.getItem.mockImplementation(() => {
            throw new Error('Storage access denied');
        });

        mockFetch.mockRejectedValue(new Error('Network error'));

        await expect(apiFetch('/api/test')).rejects.toThrow('Network error');
    });

    test('returns original response for non-GET requests', async () => {
        const mockResponse = { ok: true, status: 200 };
        mockFetch.mockResolvedValue(mockResponse as Response);

        const response = await apiFetch('/api/test', { method: 'POST' });

        expect(response).toBe(mockResponse);
        expect(localStorageMock.getItem).not.toHaveBeenCalled();
    });
});