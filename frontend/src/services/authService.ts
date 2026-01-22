const API_BASE_URL = "http://localhost:4000/api";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  // Enregistrer un nouvel utilisateur
  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de l'inscription");
    }

    const data = await response.json();
    // Sauvegarder le token
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  },

  // Se connecter
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de la connexion");
    }

    const data = await response.json();
    // Sauvegarder le token
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  },

  // Se déconnecter
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Obtenir le token
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },

  // Vérifier le token auprès du serveur
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

  // Obtenir le header d'autorisation pour les requêtes
  getAuthHeader: (): { Authorization: string } | {} => {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};
