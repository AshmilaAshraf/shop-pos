
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    authToken = token;
    if (token) {
        sessionStorage.setItem('auth_token', token);
    } else {
        sessionStorage.removeItem('auth_token');
    }
};

export const getAuthToken = (): string | null => {
    if (!authToken) {
        authToken = sessionStorage.getItem('auth_token');
    }
    return authToken;
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    const token = getAuthToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
        ...options,
        headers,
    });

    if (res.status === 401 && !url.includes('/auth/login')) {
        setAuthToken(null);
        throw new Error("Unauthorized");
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || res.statusText || "Request failed");
    }

    return res.json();
};

export const api = {
    // Auth
    login: async (data: { username: string; password: string }) => {
        const result = await fetchWithAuth(`${API_URL}/auth/login`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        // Save the token we get back from login
        if (result.token) {
            setAuthToken(result.token);
        }
        return result;
    },

    logout: () => {
        setAuthToken(null); // Throw away the ticket
        return fetchWithAuth(`${API_URL}/auth/logout`, { method: "POST" });
    },

    me: () => fetchWithAuth(`${API_URL}/auth/me`),

    register: (data: any) =>
        fetchWithAuth(`${API_URL}/auth/register`, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // Products
    getProducts: (search?: string) => {
        const url = search
            ? `${API_URL}/products?search=${encodeURIComponent(search)}`
            : `${API_URL}/products`;
        return fetchWithAuth(url);
    },

    createProduct: (data: any) =>
        fetchWithAuth(`${API_URL}/products`, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // Customers
    getCustomers: (search?: string) => {
        const url = search
            ? `${API_URL}/customers?search=${encodeURIComponent(search)}`
            : `${API_URL}/customers`;
        return fetchWithAuth(url);
    },

    createCustomer: (data: any) =>
        fetchWithAuth(`${API_URL}/customers`, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // Sales
    createSale: (data: any) =>
        fetchWithAuth(`${API_URL}/sales`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
    getSales: () => fetchWithAuth(`${API_URL}/sales`),

    // Dashboard
    getDashboardStats: () => fetchWithAuth(`${API_URL}/dashboard/stats`),
};