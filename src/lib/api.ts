/**
 * Utility functions for authenticated API requests
 */

const API_URL = import.meta.env.VITE_API_URL;

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Make an authenticated API request
 */
export async function authenticatedFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  };

  // Add authorization header if not skipping auth
  if (!skipAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  return response;
}

/**
 * Make a GET request
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await authenticatedFetch(endpoint);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Failed to fetch ${endpoint}`);
  }
  
  return response.json();
}

/**
 * Make a POST request
 */
export async function apiPost<T>(
  endpoint: string,
  data: unknown
): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.detail || `Failed to post to ${endpoint}`);
  }
  
  return response.json();
}

/**
 * Make a PATCH request
 */
export async function apiPatch<T>(
  endpoint: string,
  data: unknown
): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.detail || `Failed to patch ${endpoint}`);
  }
  
  return response.json();
}

/**
 * Make a DELETE request
 */
export async function apiDelete(endpoint: string): Promise<void> {
  const response = await authenticatedFetch(endpoint, {
    method: 'DELETE',
  });
  
  if (!response.ok && response.status !== 204) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.detail || `Failed to delete ${endpoint}`);
  }
}
