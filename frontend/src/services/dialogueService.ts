import type { Dialogue, DialogueLine, DialogueChoice } from '../types/index';

const API_BASE_URL = 'http://localhost:4000/api';

export interface CreateDialogueRequest {
  projectId: string;
  name: string;
  description?: string;
  isStartDialogue?: boolean;
  folderId?: string;
  backgroundId?: string;
}

export interface UpdateDialogueRequest {
  name: string;
  description?: string;
  isStartDialogue?: boolean;
  folderId?: string;
  backgroundId?: string;
}

export interface CreateDialogueLineRequest {
  characterId?: string;
  text: string;
  order: number;
  displayedCharacterId?: string;
  leftCharacterId?: string;
  rightCharacterId?: string;
  displayedMoodId?: string;
  leftMoodId?: string;
  rightMoodId?: string;
}

export interface UpdateDialogueLineRequest {
  characterId?: string;
  text: string;
  order?: number;
  displayedCharacterId?: string;
  leftCharacterId?: string;
  rightCharacterId?: string;
  displayedMoodId?: string;
  leftMoodId?: string;
  rightMoodId?: string;
}

export interface CreateDialogueChoiceRequest {
  text: string;
  nextDialogueId?: string;
}

export interface UpdateDialogueChoiceRequest {
  text: string;
  nextDialogueId?: string;
}

export const dialogueService = {
  // Get all dialogues for a project
  async getDialoguesByProject(projectId: string): Promise<Dialogue[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/dialogues/project/${projectId}`);
      if (!response.ok) {
        throw new Error(`Error fetching dialogues: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching dialogues:', error);
      throw error;
    }
  },

  // Get single dialogue
  async getDialogue(dialogueId: string): Promise<Dialogue> {
    try {
      const response = await fetch(`${API_BASE_URL}/dialogues/${dialogueId}`);
      if (!response.ok) {
        throw new Error(`Error fetching dialogue: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching dialogue:', error);
      throw error;
    }
  },

  // Create new dialogue
  async createDialogue(dialogue: CreateDialogueRequest): Promise<Dialogue> {
    try {
      const response = await fetch(`${API_BASE_URL}/dialogues/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dialogue),
      });
      
      if (!response.ok) {
        throw new Error(`Error creating dialogue: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating dialogue:', error);
      throw error;
    }
  },

  // Update dialogue
  async updateDialogue(dialogueId: string, dialogue: UpdateDialogueRequest): Promise<Dialogue> {
    try {
      const response = await fetch(`${API_BASE_URL}/dialogues/${dialogueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dialogue),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating dialogue: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error updating dialogue:', error);
      throw error;
    }
  },

  // Delete dialogue
  async deleteDialogue(dialogueId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/dialogues/${dialogueId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting dialogue: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting dialogue:', error);
      throw error;
    }
  },

  // Dialogue Lines Management
  
  // Add dialogue line
  async addDialogueLine(dialogueId: string, line: CreateDialogueLineRequest): Promise<DialogueLine> {
    try {
      const response = await fetch(`${API_BASE_URL}/dialogues/${dialogueId}/lines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(line),
      });
      
      if (!response.ok) {
        throw new Error(`Error adding dialogue line: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error adding dialogue line:', error);
      throw error;
    }
  },

  // Update dialogue line
  async updateDialogueLine(lineId: string, line: UpdateDialogueLineRequest): Promise<DialogueLine> {
    try {
      const response = await fetch(`${API_BASE_URL}/dialogues/lines/${lineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(line),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating dialogue line: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error updating dialogue line:', error);
      throw error;
    }
  },

  // Delete dialogue line
  async deleteDialogueLine(lineId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/dialogues/lines/${lineId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting dialogue line: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting dialogue line:', error);
      throw error;
    }
  },

  // Dialogue Choices Management
  
  // Add dialogue choice
  async addDialogueChoice(lineId: string, choice: CreateDialogueChoiceRequest): Promise<DialogueChoice> {
    try {
      const response = await fetch(`${API_BASE_URL}/dialogues/lines/${lineId}/choices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(choice),
      });
      
      if (!response.ok) {
        throw new Error(`Error adding dialogue choice: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error adding dialogue choice:', error);
      throw error;
    }
  },

  // Update dialogue choice
  async updateDialogueChoice(choiceId: string, choice: UpdateDialogueChoiceRequest): Promise<DialogueChoice> {
    try {
      const response = await fetch(`${API_BASE_URL}/dialogues/choices/${choiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(choice),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating dialogue choice: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error updating dialogue choice:', error);
      throw error;
    }
  },

  // Delete dialogue choice
  async deleteDialogueChoice(choiceId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/dialogues/choices/${choiceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting dialogue choice: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting dialogue choice:', error);
      throw error;
    }
  },
};