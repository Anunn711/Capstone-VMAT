// API service for mitigation-related HTTP requests
// Read a cookie value by name (small utility used for CSRF token retrieval)
function readCookie(name: string): string | undefined {
  const matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\\[\\]\/\\+^])/g, '\\$1') + '=([^;]*)'));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

export async function apiFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const method = (init && init.method) ? init.method.toUpperCase() : 'GET';
  const opts: RequestInit = { credentials: 'include', ...init };

  // Attach CSRF header for unsafe methods when the server has CSRF cookie protection enabled.
  // flask-jwt-extended exposes a non-HttpOnly cookie named 'csrf_access_token' by default;
  // the server expects this in the header configured as JWT_CSRF_HEADER_NAME (we use 'X-CSRF-TOKEN').
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = readCookie('csrf_access_token');
    if (csrf) {
      opts.headers = { ...(opts.headers || {}), 'X-CSRF-TOKEN': csrf } as any;
    }
  }

  // Caching behavior for GET requests: store successful JSON responses in localStorage and
  // fall back to cached JSON when offline or network errors occur.
  const isGet = method === 'GET';
  const cacheTtlMs = Number(process.env.REACT_APP_CACHE_TTL_MS || 24 * 60 * 60 * 1000); // default 24h

  function cacheKey(url: string) {
    return `vmat:cache:${url}`;
  }

  async function readCache(url: string) {
    try {
      const raw = localStorage.getItem(cacheKey(url));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.ts || !parsed.data) return null;
      if (Date.now() - parsed.ts > cacheTtlMs) {
        localStorage.removeItem(cacheKey(url));
        return null;
      }
      return parsed.data;
    } catch (e) {
      return null;
    }
  }

  async function writeCache(url: string, data: any) {
    try {
      const payload = { ts: Date.now(), data };
      localStorage.setItem(cacheKey(url), JSON.stringify(payload));
    } catch (e) {
      // ignore localStorage errors
    }
  }

  // Normalize input to absolute URL string for cache key to ensure consistency
  const rawUrlString = typeof input === 'string' ? input : String(input);
  let urlString: string;
  try {
    urlString = new URL(rawUrlString, typeof window !== 'undefined' ? window.location.origin : rawUrlString).href;
  } catch (e) {
    urlString = rawUrlString;
  }

  if (!isGet) {
    // Non-GET requests: normal fetch with CSRF header applied above
    return fetch(input, opts);
  }

  try {
    const resp = await fetch(input, opts);
    // If response is OK and JSON, cache it for future offline use
    if (resp.ok) {
      // Try to parse JSON in background and write to cache
      resp.clone().json().then((jsonData) => {
        console.debug('[apiFetch] writing cache for', urlString);
        writeCache(urlString, jsonData);
      }).catch(() => {
        /* not JSON or parse error */
      });
    }
    // If GET and response is not OK, attempt to fall back to cache (covers dev-server proxy errors)
    if (isGet && !resp.ok) {
      console.warn('[apiFetch] non-OK response for GET', resp.status, urlString);
      const cached = await readCache(urlString);
      if (cached !== null) {
        try {
          if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
            window.dispatchEvent(new CustomEvent('vmat:cache:used', { detail: { url: urlString } }));
          }
        } catch (e) { }
        console.debug('[apiFetch] serving cached data for non-OK response', urlString);
        const body = JSON.stringify(cached);
        const headers = new Headers({ 'Content-Type': 'application/json', 'X-VMAT-CACHED': '1' });
        return new Response(body, { status: 200, headers });
      }
    }
    return resp;
  } catch (networkErr) {
    // Network failed — try cached response
    const cached = await readCache(urlString);
    if (cached !== null) {
      // Create a synthetic Response containing cached JSON
      const body = JSON.stringify(cached);
      try {
        // Emit a DOM event so the UI can show a cached-data notification
        if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent('vmat:cache:used', { detail: { url: urlString } }));
        }
      } catch (e) {
        // ignore
      }
      console.debug('[apiFetch] serving cached data for', urlString);
      // Include a header to indicate cached response (so callers can detect it)
      const headers = new Headers({ 'Content-Type': 'application/json', 'X-VMAT-CACHED': '1' });
      return new Response(body, { status: 200, headers });
    }
    // No cache available — rethrow original network error to caller
    throw networkErr;
  }
}

export class MitigationAPI {
  private static async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  static async getMitigations(filters?: {
    status?: string;
    priority?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.priority && filters.priority !== 'all') {
      params.append('priority', filters.priority);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await apiFetch(`/api/mitigations?${params}`);
    return this.handleResponse(response);
  }

  static async getMitigationById(id: number) {
    const response = await apiFetch(`/api/mitigations/${id}`);
    return this.handleResponse(response);
  }

  static async createMitigation(data: any) {
    const response = await apiFetch('/api/mitigations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async updateMitigation(id: number, data: any) {
    const response = await apiFetch(`/api/mitigations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async deleteMitigation(id: number) {
    const response = await apiFetch(`/api/mitigations/${id}`, { method: 'DELETE' });
    return this.handleResponse(response);
  }

  static async getMitigationStats() {
    const response = await apiFetch('/api/mitigations/stats');
    return this.handleResponse(response);
  }
}

export class VulnerabilityAPI {
  private static async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  static async getVulnerabilities() {
    const response = await apiFetch('/api/vulnerabilities');
    return this.handleResponse(response);
  }

  static async getAwaitingReview() {
    const response = await apiFetch('/api/vulnerabilities/awaiting-review');
    return this.handleResponse(response);
  }

  static async updateVulnerability(id: number, data: any) {
    const response = await apiFetch(`/api/vulnerabilities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async getVulnerabilityById(id: number) {
    const response = await apiFetch(`/api/vulnerabilities/${id}`);
    return this.handleResponse(response);
  }
}