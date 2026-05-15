import type { Call } from '../types/index';
import API_BASE_URL from '../config/api';

export interface CreateCallRequest {
  projectId: string;
  characterId?: string;
  callDate: Date;
  duration: number;
  status: number;
}

export interface UpdateCallRequest {
  characterId?: string;
  callDate?: Date;
  duration?: number;
  status?: number;
}

export const callService = {
  async getCallsByProject(projectId: string): Promise<Call[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/project/${projectId}`);
      if (!response.ok) {
        throw new Error(`Error fetching calls: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching calls:', error);
      throw error;
    }
  },

  async createCall(call: CreateCallRequest): Promise<Call> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(call),
      });
      if (!response.ok) {
        throw new Error(`Error creating call: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error creating call:', error);
      throw error;
    }
  },

  async updateCall(callId: string, call: UpdateCallRequest): Promise<Call> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/${callId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(call),
      });
      if (!response.ok) {
        throw new Error(`Error updating call: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error updating call:', error);
      throw error;
    }
  },

  async deleteCall(callId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/${callId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error deleting call: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting call:', error);
      throw error;
    }
  },
};
