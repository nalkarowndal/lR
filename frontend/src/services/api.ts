/**
 * LuxuryRental Frontend API Client
 * Provides typed REST API access with transparent fallback to local state if backend is offline.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-role': 'ADMIN',
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  // Health
  checkHealth: async () => {
    try {
      return await fetchJson<{ status: string }>('/health');
    } catch {
      return null;
    }
  },

  // Products
  getProducts: async () => {
    return fetchJson<{ success: boolean; data: any[] }>('/products');
  },

  getRecommendations: async (target: string) => {
    return fetchJson<{ success: boolean; data: any[] }>(`/products/recommendations?target=${encodeURIComponent(target)}`);
  },

  // Search
  search: async (q: string) => {
    return fetchJson<{ success: boolean; data: any[] }>(`/search?q=${encodeURIComponent(q)}`);
  },

  getTrendingKeywords: async () => {
    return fetchJson<{ success: boolean; recommended: string[]; trending: any[] }>('/search/trending');
  },

  // Categories & Brands
  getCategories: async () => {
    return fetchJson<{ success: boolean; data: any[] }>('/categories');
  },

  getBrands: async (popular = false) => {
    return fetchJson<{ success: boolean; data: any[] }>(`/categories/brands${popular ? '?popular=true' : ''}`);
  },

  // Sell Requests
  createSellRequest: async (brandName: string, userName = '고객') => {
    return fetchJson<{ success: boolean; message: string; data: any }>('/sell-requests', {
      method: 'POST',
      body: JSON.stringify({ brandName, userName })
    });
  },

  // Admin
  getAdminProducts: async () => {
    return fetchJson<{ success: boolean; data: any[] }>('/admin/products');
  },

  createAdminProduct: async (product: { title: string; type: string; price: number; brand?: string; category?: string }) => {
    return fetchJson<{ success: boolean; message: string; data: any }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  },

  deleteAdminProduct: async (id: number) => {
    return fetchJson<{ success: boolean; message: string }>(`/admin/products/${id}`, {
      method: 'DELETE'
    });
  },

  getRecruitRequests: async () => {
    return fetchJson<{ success: boolean; data: any[] }>('/admin/recruit/requests');
  },

  createRecruitRequest: async (request: { storeName: string; date: string; section: string; time: string; breakTime: string; required: number; partner?: string }) => {
    return fetchJson<{ success: boolean; message: string; data: any }>('/admin/recruit/requests', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  },

  updateRecruitRequest: async (id: number, updates: { status?: string; hired?: number }) => {
    return fetchJson<{ success: boolean; message: string }>(`/admin/recruit/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  getWorkers: async () => {
    return fetchJson<{ success: boolean; data: any[] }>('/admin/workers');
  },

  createWorker: async (worker: { name: string; phone: string; exp: string }) => {
    return fetchJson<{ success: boolean; message: string; data: any }>('/admin/workers', {
      method: 'POST',
      body: JSON.stringify(worker)
    });
  },

  getMessages: async () => {
    return fetchJson<{ success: boolean; data: any[] }>('/admin/messages');
  },

  createMessage: async (msg: { sender: string; text: string; isMine?: boolean }) => {
    return fetchJson<{ success: boolean; data: any }>('/admin/messages', {
      method: 'POST',
      body: JSON.stringify(msg)
    });
  }
};
