/**
 * API Client
 */

// Use relative URLs in browser to leverage Next.js proxy
// Use absolute URLs in server components
const getApiBaseUrl = () => {
  // In browser/client components, use relative URLs (Next.js will proxy)
  if (typeof window !== 'undefined') {
    return '';
  }
  // In server components, use absolute URL - env var is required
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is required for server-side API calls');
  }
  return apiUrl;
};

export interface ApiError {
  error: string;
  message: string;
}

export class ApiClient {
  private baseUrl: string;
  private getAuthToken: () => Promise<string | null>;

  constructor(getAuthToken?: () => Promise<string | null>) {
    // Compute base URL at runtime, not module load time
    this.baseUrl = getApiBaseUrl();
    this.getAuthToken = getAuthToken || (async () => null);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Client] Making request:', {
        method: options.method || 'GET',
        url,
        hasToken: !!token,
      });
    }
    
    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    } catch (networkError) {
      console.error('[API Client] Network error:', networkError);
      throw {
        error: 'Network Error',
        message: `Failed to connect to API server at ${this.baseUrl}. Check if the server is running.`,
      } as ApiError;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let error: ApiError;
      if (isJson) {
        try {
          error = await response.json();
        } catch {
          error = {
            error: 'Unknown Error',
            message: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
      } else {
        // Try to get response text for debugging
        const text = await response.text();
        const preview = text.substring(0, 200);
        error = {
          error: 'Server Error',
          message: `HTTP ${response.status}: ${response.statusText}. Response: ${preview}${text.length > 200 ? '...' : ''}`,
        };
      }
      throw error;
    }

    if (!isJson) {
      // Try to get response text to see what we actually got
      const text = await response.text();
      const preview = text.substring(0, 200);
      throw {
        error: 'Invalid Response',
        message: `Server did not return JSON. Content-Type was: ${contentType}. URL: ${url}. Response preview: ${preview}${text.length > 200 ? '...' : ''}`,
      } as ApiError;
    }

    try {
      return await response.json();
    } catch {
      throw {
        error: 'Parse Error',
        message: 'Failed to parse JSON response from server',
      } as ApiError;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

