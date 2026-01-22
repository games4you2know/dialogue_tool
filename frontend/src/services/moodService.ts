import type { Mood } from '../types/index';

const API_BASE_URL = 'http://localhost:4000/api';

export const moodService = {
  // Get all moods for a project
  async getMoods(projectId: string): Promise<Mood[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/moods/project/${projectId}`);
      if (!response.ok) {
        throw new Error(`Error fetching moods: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching moods:', error);
      throw error;
    }
  },

  // Create a mood
  async createMood(projectId: string, name: string): Promise<Mood> {
    try {
      const response = await fetch(`${API_BASE_URL}/moods/project/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error(`Error creating mood: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating mood:', error);
      throw error;
    }
  },

  // Update a mood
  async updateMood(moodId: string, name: string): Promise<Mood> {
    try {
      const response = await fetch(`${API_BASE_URL}/moods/${moodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating mood: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error updating mood:', error);
      throw error;
    }
  },

  // Delete a mood
  async deleteMood(moodId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/moods/${moodId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting mood: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting mood:', error);
      throw error;
    }
  },
};
