import axios from 'axios';
import type { Background } from '../types';

const API_URL = 'http://localhost:4000/api';

export const backgroundService = {
  // Récupérer tous les backgrounds d'un projet
  async getBackgroundsByProject(projectId: string): Promise<Background[]> {
    const response = await axios.get(`${API_URL}/backgrounds/${projectId}`);
    return response.data;
  },

  // Récupérer un background par son ID
  async getBackgroundById(id: string): Promise<Background> {
    const response = await axios.get(`${API_URL}/backgrounds/detail/${id}`);
    return response.data;
  },

  // Créer un nouveau background
  async createBackground(data: { projectId: string; name: string; imageUrl: string }): Promise<Background> {
    const response = await axios.post(`${API_URL}/backgrounds`, data);
    return response.data;
  },

  // Mettre à jour un background
  async updateBackground(id: string, data: { name?: string; imageUrl?: string }): Promise<Background> {
    const response = await axios.put(`${API_URL}/backgrounds/${id}`, data);
    return response.data;
  },

  // Supprimer un background
  async deleteBackground(id: string): Promise<void> {
    await axios.delete(`${API_URL}/backgrounds/${id}`);
  },

  // Upload une image
  async uploadImage(file: File): Promise<{ filename: string; url: string; size: number; mimetype: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/assets/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};
