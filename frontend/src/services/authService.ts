import API_BASE_URL from '../config/api';

interface User {
  id: string;
  username: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  register: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de l'inscription");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de la connexion");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },

  checkAuth: async (): Promise<User | null> => {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        authService.logout();
        return null;
      }

      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data.user));
      return data.user;
    } catch {
      authService.logout();
      return null;
    }
  },

  getAuthHeader: (): { Authorization: string } | {} => {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};
