import { authService } from "./authService";
import API_BASE_URL from '../config/api';

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
}

export const projectMemberService = {
  // Récupérer tous les membres d'un projet
  async getMembers(projectId: string): Promise<ProjectMember[]> {
    const response = await fetch(`${API_BASE_URL}/project-members/project/${projectId}`, {
      headers: {
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des membres");
    }

    return response.json();
  },

  // Ajouter un membre à un projet
  async addMember(projectId: string, username: string, role: string = "member"): Promise<ProjectMember> {
    const response = await fetch(`${API_BASE_URL}/project-members/project/${projectId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify({ username, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de l'ajout du membre");
    }

    return response.json();
  },

  // Modifier le rôle d'un membre
  async updateMemberRole(memberId: string, role: string): Promise<ProjectMember> {
    const response = await fetch(`${API_BASE_URL}/project-members/${memberId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de la modification du rôle");
    }

    return response.json();
  },

  // Retirer un membre d'un projet
  async removeMember(memberId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/project-members/${memberId}`, {
      method: "DELETE",
      headers: {
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de la suppression du membre");
    }
  },
};
