export type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
  error?: string
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  if (!isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }

  try {
    const { getAccessToken } = await import('./cookies')
    const token = getAccessToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  } catch { }

  try {
    let res = await fetch(url, { ...options, headers, credentials: 'include' })
    let json = await res.json().catch(() => ({}))

    if (res.status === 401) {
      const { refresh } = await import('@/services/auth.service')
      const refreshed = await refresh()
      if (refreshed.success) {
        const { getAccessToken } = await import('./cookies')
        const token = getAccessToken()
        if (token) headers['Authorization'] = `Bearer ${token}`
        res = await fetch(url, { ...options, headers, credentials: 'include' })
        json = await res.json().catch(() => ({}))
      }
    }

    if (!res.ok) {
      return { success: false, error: json?.error || json?.message || `HTTP ${res.status}` }
    }
    return { success: true, data: json?.data ?? json, message: json?.message }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Network error'
    return { success: false, error: message }
  }
}

// Minimal axios-like client for existing services that expect `{ data }`
function buildHeaders(options: RequestInit = {}, isFormData: boolean = false) {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  // For FormData, don't set Content-Type - let browser set it with boundary
  if (!isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  } else {
    // Remove Content-Type if it exists for FormData
    delete headers['Content-Type'];
  }
  return headers;
}

async function withAuthHeaders(headers: Record<string, string>) {
  try {
    const { getAccessToken } = await import('./cookies');
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch { }
  return headers;
}

type QueryParams = Record<string, string | number | boolean | undefined>;
type RequestOpts = RequestInit & {
  params?: QueryParams;
  onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void;
  responseType?: 'json' | 'blob';
};

function withParams(url: string, params?: QueryParams) {
  if (!params || Object.keys(params).length === 0) return url;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) usp.append(k, String(v));
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${usp.toString()}`;
}

async function http<T>(method: string, url: string, body?: unknown, options: RequestOpts = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  let headers = buildHeaders(options, isFormData);
  headers = await withAuthHeaders(headers);
  const fullUrl = withParams(url, options.params);

  const res = await fetch(`${BASE_URL}${fullUrl}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  if (options.responseType === 'blob') {
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
    }
    const blob = await res.blob();
    return { data: blob as unknown as T };
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
  if (options.onUploadProgress) options.onUploadProgress({ loaded: 1, total: 1 });
  const payload = (json && typeof json === 'object' && 'data' in json) ? (json.data as T) : (json as T);
  return { data: payload };
}

export const apiClient = {
  get<T = unknown>(url: string, options?: RequestOpts) {
    return http<T>('GET', url, undefined, options);
  },
  post<T = unknown>(url: string, data?: unknown, options?: RequestOpts) {
    return http<T>('POST', url, data, options);
  },
  put<T = unknown>(url: string, data?: unknown, options?: RequestOpts) {
    return http<T>('PUT', url, data, options);
  },
  patch<T = unknown>(url: string, data?: unknown, options?: RequestOpts) {
    return http<T>('PATCH', url, data, options);
  },
  delete<T = unknown>(url: string, options?: RequestOpts) {
    return http<T>('DELETE', url, undefined, options);
  },
};
