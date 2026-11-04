/**
 * LuxuryRental Frontend API Client
 * Provides typed REST API access with transparent fallback to local state if backend is offline.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('lr_token');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem('lr_token', token);
    } else {
      localStorage.removeItem('lr_token');
    }
  } catch {}
}

async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

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

  // Auth Endpoints
  register: async (payload: { 
    email: string; 
    password: string; 
    name: string; 
    phone?: string; 
    termsAgreed?: boolean;
    serviceTermsAgreed?: boolean;
    privacyPolicyAgreed?: boolean;
    marketingConsent?: boolean 
  }) => {
    return fetchJson<{ success: boolean; message: string; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  login: async (payload: { email: string; password: string }) => {
    return fetchJson<{ success: boolean; message: string; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getMe: async () => {
    return fetchJson<{ success: boolean; user: any }>('/auth/me');
  },

  logout: async () => {
    try {
      return await fetchJson<{ success: boolean; message: string }>('/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },

  forgotPassword: async (email: string) => {
    return fetchJson<{ success: boolean; message: string; resetToken?: string; devResetToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  resetPassword: async (payload: { token: string; newPassword: string }) => {
    return fetchJson<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // User Profile & Settings Endpoints
  getMyProfile: async () => {
    return fetchJson<{ success: boolean; profile: any }>('/users/me');
  },

  updateMyProfile: async (payload: { name?: string; phone?: string; avatar_url?: string }) => {
    return fetchJson<{ success: boolean; message: string; profile: any }>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  uploadMyAvatar: async (fileData: string) => {
    return fetchJson<{ success: boolean; message: string; avatar_url: string }>('/users/me/avatar', {
      method: 'POST',
      body: JSON.stringify({ fileData })
    });
  },

  deleteMyAvatar: async () => {
    return fetchJson<{ success: boolean; message: string; avatar_url: string }>('/users/me/avatar', {
      method: 'DELETE'
    });
  },

  changeMyPassword: async (payload: { currentPassword: string; newPassword: string }) => {
    return fetchJson<{ success: boolean; message: string }>('/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  getMySettings: async () => {
    return fetchJson<{ success: boolean; settings: any }>('/users/me/settings');
  },

  updateMySettings: async (payload: { service_notifications?: boolean; marketing_notifications?: boolean; product_notifications?: boolean; reduce_animations?: boolean; theme?: 'light' | 'dark' }) => {
    return fetchJson<{ success: boolean; message: string; settings: any }>('/users/me/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  getMyFavorites: async () => {
    return fetchJson<{ success: boolean; favorites: any[] }>('/users/me/favorites');
  },

  addFavorite: async (productId: number) => {
    return fetchJson<{ success: boolean; message: string }>(`/users/me/favorites/${productId}`, {
      method: 'POST'
    });
  },

  removeFavorite: async (productId: number) => {
    return fetchJson<{ success: boolean; message: string }>(`/users/me/favorites/${productId}`, {
      method: 'DELETE'
    });
  },

  getMySellRequests: async () => {
    return fetchJson<{ success: boolean; sellRequests: any[] }>('/users/me/sell-requests');
  },

  // Products
  getProducts: async () => {
    return fetchJson<{ success: boolean; data: any[] }>('/products');
  },

  getProductById: async (id: number) => {
    return fetchJson<{ success: boolean; data: any }>(`/products/${id}`);
  },

  getRecommendations: async (target: string) => {
    return fetchJson<{ success: boolean; data: any[] }>(`/products/recommendations?target=${encodeURIComponent(target)}`);
  },

  getProductImages: async (productId: number) => {
    return fetchJson<{ success: boolean; count: number; data: any[] }>(`/products/${productId}/images`);
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

  // Admin Products & Gallery
  getAdminProducts: async () => {
    return fetchJson<{ success: boolean; data: any[] }>('/admin/products');
  },

  createAdminProduct: async (product: { title: string; type: string; price: number; brand?: string; category?: string; image_url?: string }) => {
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

  addProductImage: async (productId: number, payload: { imagePath?: string; fileData?: string; altText?: string; isPrimary?: number }) => {
    return fetchJson<{ success: boolean; message: string; data: any }>(`/admin/products/${productId}/images`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getAdminSellRequests: async () => {
    return fetchJson<{ success: boolean; count: number; data: any[] }>('/admin/sell-requests');
  },

  updateAdminSellRequest: async (id: number, status: string) => {
    return fetchJson<{ success: boolean; message: string }>(`/admin/sell-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  deleteProductImage: async (productId: number, imageId: number) => {
    return fetchJson<{ success: boolean; message: string }>(`/admin/products/${productId}/images/${imageId}`, {
      method: 'DELETE'
    });
  },

  // Admin Recruit Requests
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

  // Admin Workers
  getWorkers: async () => {
    return fetchJson<{ success: boolean; data: any[] }>('/admin/workers');
  },

  createWorker: async (worker: { name: string; phone: string; exp: string }) => {
    return fetchJson<{ success: boolean; message: string; data: any }>('/admin/workers', {
      method: 'POST',
      body: JSON.stringify(worker)
    });
  },

  // Admin Messages
  getMessages: async () => {
    return fetchJson<{ success: boolean; data: any[] }>('/admin/messages');
  },

  createMessage: async (msg: { sender: string; text: string; isMine?: boolean }) => {
    return fetchJson<{ success: boolean; data: any }>('/admin/messages', {
      method: 'POST',
      body: JSON.stringify(msg)
    });
  },

  // Legal Documents & Consents
  getLegalDocuments: async () => {
    return fetchJson<{ success: boolean; data: any[] }>('/legal');
  },

  getLegalDocument: async (docType: string) => {
    return fetchJson<{ success: boolean; data: any }>(`/legal/${docType}`);
  },

  getUserConsents: async () => {
    return fetchJson<{ success: boolean; data: any[] }>('/legal/user/consents');
  },

  updateUserConsent: async (docType: string, agreed: boolean) => {
    return fetchJson<{ success: boolean; message: string; consent: any }>('/legal/user/consents', {
      method: 'PUT',
      body: JSON.stringify({ docType, agreed })
    });
  }
};
