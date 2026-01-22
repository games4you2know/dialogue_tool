import type { Project } from '../types';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:4000/api';

export interface ApiProject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  scenes?: any[];
}

// Conversion entre les types API et frontend
const mapApiProjectToProject = (apiProject: ApiProject): Project => ({
  id: apiProject.id,
  name: apiProject.name,
  description: apiProject.description || '',
  createdAt: new Date(apiProject.createdAt),
  updatedAt: new Date(apiProject.updatedAt),
  dialogues: [], // À implémenter plus tard
  smsConversations: [] // À implémenter plus tard
});

export const projectService = {
  // Récupérer tous les projets
  async getAll(): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: {
          ...authService.getAuthHeader(),
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiProjects: ApiProject[] = await response.json();
      return apiProjects.map(mapApiProjectToProject);
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  },

  // Récupérer un projet par ID
  async getById(id: string): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        headers: {
          ...authService.getAuthHeader(),
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiProject: ApiProject = await response.json();
      return mapApiProjectToProject(apiProject);
    } catch (error) {
      console.error('Error fetching project:', error);
      throw new Error('Failed to fetch project');
    }
  },

  // Créer un nouveau projet
  async create(projectData: { name: string; description?: string }): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader(),
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }
      
      const apiProject: ApiProject = await response.json();
      return mapApiProjectToProject(apiProject);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Mettre à jour un projet
  async update(id: string, projectData: { name: string; description?: string }): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader(),
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }
      
      const apiProject: ApiProject = await response.json();
      return mapApiProjectToProject(apiProject);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Supprimer un projet
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: {
          ...authService.getAuthHeader(),
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Exporter un projet en JSON
  async exportProject(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}/export`, {
        headers: {
          ...authService.getAuthHeader(),
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export project');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `project-${id}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting project:', error);
      throw error;
    }
  }
};