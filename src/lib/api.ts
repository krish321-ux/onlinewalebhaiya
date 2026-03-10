const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Helper to get auth headers
function getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

// Generic fetch wrapper with error handling
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers,
        },
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    // Handle 204 No Content
    if (res.status === 204) return null as T;
    return res.json();
}

// ---- Jobs ----
export const jobsAPI = {
    getAll: (filters?: Record<string, string>) => {
        const params = new URLSearchParams(filters || {});
        return apiFetch<any[]>(`/api/jobs?${params}`);
    },
    getById: (id: string) => apiFetch<any>(`/api/jobs/${id}`),
    create: (formData: FormData) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        return fetch(`${API_BASE}/api/jobs`, {
            method: 'POST',
            body: formData,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }).then(async res => {
            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: 'Create failed' }));
                throw new Error(errData.error || 'Create failed');
            }
            return res.json();
        });
    },
    update: (id: string, formData: FormData) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        return fetch(`${API_BASE}/api/jobs/${id}`, {
            method: 'PUT',
            body: formData,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }).then(async res => {
            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: 'Update failed' }));
                throw new Error(errData.error || 'Update failed');
            }
            return res.json();
        });
    },
    delete: (id: string) => apiFetch<void>(`/api/jobs/${id}`, { method: 'DELETE' }),
};

// ---- Scholarships ----
export const scholarshipsAPI = {
    getAll: (filters?: Record<string, string>) => {
        const params = new URLSearchParams(filters || {});
        return apiFetch<any[]>(`/api/scholarships?${params}`);
    },
    getById: (id: string) => apiFetch<any>(`/api/scholarships/${id}`),
    create: (formData: FormData) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        return fetch(`${API_BASE}/api/scholarships`, {
            method: 'POST',
            body: formData,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }).then(async res => {
            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: 'Create failed' }));
                throw new Error(errData.error || 'Create failed');
            }
            return res.json();
        });
    },
    update: (id: string, formData: FormData) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        return fetch(`${API_BASE}/api/scholarships/${id}`, {
            method: 'PUT',
            body: formData,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }).then(async res => {
            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: 'Update failed' }));
                throw new Error(errData.error || 'Update failed');
            }
            return res.json();
        });
    },
    delete: (id: string) => apiFetch<void>(`/api/scholarships/${id}`, { method: 'DELETE' }),
};

// ---- Service Cards ----
export const serviceCardsAPI = {
    getAll: () => apiFetch<any[]>('/api/service-cards'),
    create: (data: any) => apiFetch<any>('/api/service-cards', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiFetch<any>(`/api/service-cards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<void>(`/api/service-cards/${id}`, { method: 'DELETE' }),
};

// ---- Services ----
export const servicesAPI = {
    submit: (formData: FormData) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        return fetch(`${API_BASE}/api/services/request`, {
            method: 'POST',
            body: formData,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }).then(async res => {
            if (!res.ok) throw new Error((await res.json()).error || 'Submit failed');
            return res.json();
        });
    },
    checkStatus: (caseId: string) => apiFetch<any>(`/api/services/case/${caseId}`),
    getAll: () => apiFetch<any[]>('/api/services/requests'),
    updateStatus: (id: string, status: string) =>
        apiFetch<any>(`/api/services/requests/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
    delete: (id: string) =>
        apiFetch<void>(`/api/services/requests/${id}`, { method: 'DELETE' }),
};

// ---- Chatbot ----
export const chatbotAPI = {
    // Stateful chat message
    sendMessage: (sessionId: string, message: string) =>
        apiFetch<{ answer: string; source: string; state: string; conversationId: string | null }>('/api/chatbot/message', {
            method: 'POST',
            body: JSON.stringify({ sessionId, message }),
        }),

    // File upload via chat
    uploadFile: (sessionId: string, file: File, conversationId?: string | null) => {
        const formData = new FormData();
        formData.append('sessionId', sessionId);
        formData.append('file', file);
        if (conversationId) formData.append('conversationId', conversationId);
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        return fetch(`${API_BASE}/api/chatbot/upload`, {
            method: 'POST',
            body: formData,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }).then(async res => {
            if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
            return res.json();
        });
    },

    // Legacy ask (backward compatible)
    ask: (question: string) => apiFetch<{ answer: string; source: string }>('/api/chatbot/ask', {
        method: 'POST',
        body: JSON.stringify({ question }),
    }),

    getFAQs: () => apiFetch<any[]>('/api/chatbot/faq'),
    addFAQ: (data: { question: string; answer: string; category: string; keywords?: string[] }) =>
        apiFetch<any>('/api/chatbot/faq', { method: 'POST', body: JSON.stringify(data) }),
    updateFAQ: (id: string, data: any) =>
        apiFetch<any>(`/api/chatbot/faq/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteFAQ: (id: string) => apiFetch<void>(`/api/chatbot/faq/${id}`, { method: 'DELETE' }),
    deleteTopic: (category: string) =>
        apiFetch<{ deleted: number }>('/api/chatbot/faq', { method: 'DELETE', body: JSON.stringify({ category }) }),
    bulkAddFAQs: (items: { question: string; answer: string; category: string; keywords?: string[] }[]) =>
        apiFetch<any[]>('/api/chatbot/faq', { method: 'POST', body: JSON.stringify({ bulk: true, items }) }),
    getLogs: () => apiFetch<any[]>('/api/chatbot/logs'),

    // Website Pages CRUD
    getPages: () => apiFetch<any[]>('/api/chatbot/pages'),
    addPage: (data: { title: string; content: string; keywords?: string[] }) =>
        apiFetch<any>('/api/chatbot/pages', { method: 'POST', body: JSON.stringify(data) }),
    updatePage: (id: string, data: any) =>
        apiFetch<any>(`/api/chatbot/pages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deletePage: (id: string) => apiFetch<void>(`/api/chatbot/pages/${id}`, { method: 'DELETE' }),
};

// ---- Conversations (Admin) ----
export const conversationAPI = {
    getAll: (params?: { search?: string; status?: string; dateFrom?: string; dateTo?: string; page?: number }) => {
        const q = new URLSearchParams();
        if (params?.search) q.set('search', params.search);
        if (params?.status) q.set('status', params.status);
        if (params?.dateFrom) q.set('dateFrom', params.dateFrom);
        if (params?.dateTo) q.set('dateTo', params.dateTo);
        if (params?.page) q.set('page', params.page.toString());
        return apiFetch<{ data: any[]; total: number }>(`/api/admin/conversations?${q}`);
    },
    getById: (id: string) => apiFetch<any>(`/api/admin/conversations/${id}`),
    updateStatus: (id: string, status: string) =>
        apiFetch<any>(`/api/admin/conversations/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
    getStats: () => apiFetch<{ new: number; contacted: number; completed: number; total: number }>('/api/admin/conversations/stats'),
    delete: (id: string) => apiFetch<void>(`/api/admin/conversations/${id}`, { method: 'DELETE' }),
    sendReply: (id: string, message: string) =>
        apiFetch<{ success: boolean }>(`/api/admin/conversations/${id}/reply`, {
            method: 'POST',
            body: JSON.stringify({ message }),
        }),
    sendFile: (id: string, file: File, message?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        if (message) formData.append('message', message);
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        return fetch(`${API_BASE}/api/admin/conversations/${id}/reply`, {
            method: 'POST',
            body: formData,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }).then(async res => {
            if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
            return res.json();
        });
    },
};

// ---- Profiles ----
export const profilesAPI = {
    save: (data: any) => apiFetch<any>('/api/profiles', { method: 'POST', body: JSON.stringify(data) }),
    get: (phone: string) => apiFetch<any>(`/api/profiles/${phone}`),
    getRecommendations: (data: any) => apiFetch<any[]>('/api/profiles/recommendations', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

// ---- Admin ----
export const adminAPI = {
    getStats: () => apiFetch<any>('/api/admin/stats'),
    getLeads: () => apiFetch<any[]>('/api/admin/leads'),
    login: (email: string, password: string) =>
        apiFetch<{ token: string; user: any }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
    deleteLead: (id: string) => apiFetch<void>(`/api/admin/leads/${id}`, { method: 'DELETE' }),
};

// ---- Gallery ----
export const galleryAPI = {
    // Public: fetch active images for homepage
    getImages: () => apiFetch<any[]>('/api/gallery'),

    // Admin: all images
    getAllImages: () => apiFetch<any[]>('/api/gallery/all'),

    // Admin: upload new image
    uploadImage: async (file: File, title: string, sortOrder: number) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', title);
        formData.append('sort_order', String(sortOrder));
        const res = await fetch(`${API_BASE}/api/gallery`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Upload failed' }));
            throw new Error(err.error || `HTTP ${res.status}`);
        }
        return res.json();
    },

    // Admin: update image meta
    updateImage: (id: string, updates: { title?: string; sort_order?: number; is_active?: boolean }) =>
        apiFetch<any>(`/api/gallery/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        }),

    // Admin: delete image
    deleteImage: (id: string) =>
        apiFetch<null>(`/api/gallery/${id}`, { method: 'DELETE' }),
};
