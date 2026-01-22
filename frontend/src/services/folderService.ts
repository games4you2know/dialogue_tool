import axios from 'axios';
import type { Folder } from '../types';

const API_URL = 'http://localhost:4000/api';

export interface CreateFolderRequest {
  projectId: string;
  name: string;
  description?: string;
  type: 'dialogue' | 'sms';
  parentId?: string;
}

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
  parentId?: string;
}

export interface MoveFolderItemRequest {
  dialogueId?: string;
  conversationId?: string;
  folderId: string | null;
}

export const folderService = {
  // Get all folders for a project
  async getFoldersByProject(projectId: string, type?: 'dialogue' | 'sms'): Promise<Folder[]> {
    const params = type ? `?type=${type}` : '';
    const response = await axios.get(`${API_URL}/folders/project/${projectId}${params}`);
    return response.data;
  },

  // Get folder by ID with its content
  async getFolderById(id: string): Promise<Folder> {
    const response = await axios.get(`${API_URL}/folders/${id}`);
    return response.data;
  },

  // Create a new folder
  async createFolder(data: CreateFolderRequest): Promise<Folder> {
    const response = await axios.post(`${API_URL}/folders`, data);
    return response.data;
  },

  // Update a folder
  async updateFolder(id: string, data: UpdateFolderRequest): Promise<Folder> {
    const response = await axios.put(`${API_URL}/folders/${id}`, data);
    return response.data;
  },

  // Delete a folder
  async deleteFolder(id: string): Promise<void> {
    await axios.delete(`${API_URL}/folders/${id}`);
  },

  // Move dialogue to folder
  async moveDialogue(dialogueId: string, folderId: string | null): Promise<void> {
    await axios.post(`${API_URL}/folders/move-dialogue`, {
      dialogueId,
      folderId,
    });
  },

  // Move SMS conversation to folder
  async moveSMS(conversationId: string, folderId: string | null): Promise<void> {
    await axios.post(`${API_URL}/folders/move-sms`, {
      conversationId,
      folderId,
    });
  },
};
