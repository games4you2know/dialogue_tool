import type { Character, Mood } from '../types/index';

const API_BASE_URL = 'http://localhost:4000/api';

export interface CreateCharacterRequest {
  projectId: string;
  name: string;
  tag: string;
  color?: string;
  description?: string;
}

export interface UpdateCharacterRequest {
  name: string;
  tag: string;
  color?: string;
  description?: string;
}

export const characterService = {
  // Get all characters for a project
  async getCharactersByProject(projectId: string): Promise<Character[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/characters/project/${projectId}`);
      if (!response.ok) {
        throw new Error(`Error fetching characters: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching characters:', error);
      throw error;
    }
  },

  // Get single character
  async getCharacter(characterId: string): Promise<Character> {
    try {
      const response = await fetch(`${API_BASE_URL}/characters/${characterId}`);
      if (!response.ok) {
        throw new Error(`Error fetching character: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching character:', error);
      throw error;
    }
  },

  // Create new character
  async createCharacter(character: CreateCharacterRequest): Promise<Character> {
    try {
      const response = await fetch(`${API_BASE_URL}/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(character),
      });
      
      if (!response.ok) {
        throw new Error(`Error creating character: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  },

  // Update character
  async updateCharacter(characterId: string, character: UpdateCharacterRequest): Promise<Character> {
    try {
      const response = await fetch(`${API_BASE_URL}/characters/${characterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(character),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating character: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  },

  // Delete character
  async deleteCharacter(characterId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/characters/${characterId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting character: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting character:', error);
      throw error;
    }
  },

  // ============ MOOD METHODS ============

  // Get all moods for a character
  async getMoods(characterId: string): Promise<Mood[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/characters/${characterId}/moods`);
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
  async createMood(characterId: string, name: string): Promise<Mood> {
    try {
      const response = await fetch(`${API_BASE_URL}/characters/${characterId}/moods`, {
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
  async updateMood(characterId: string, moodId: string, name: string): Promise<Mood> {
    try {
      const response = await fetch(`${API_BASE_URL}/characters/${characterId}/moods/${moodId}`, {
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
  async deleteMood(characterId: string, moodId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/characters/${characterId}/moods/${moodId}`, {
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