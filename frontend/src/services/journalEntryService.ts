import type { JournalEntry } from '../types/index';
import API_BASE_URL from '../config/api';

export interface CreateJournalEntryRequest {
  projectId: string;
  entryId: string;
  context: string;
  emotion: number;
  content: string;
  info: string;
}

export interface UpdateJournalEntryRequest {
  entryId?: string;
  context?: string;
  emotion?: number;
  content?: string;
  info?: string;
}

export const journalEntryService = {
  async getByProject(projectId: string): Promise<JournalEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/journal-entries/project/${projectId}`);
      if (!response.ok) {
        throw new Error(`Error fetching journal entries: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      throw error;
    }
  },

  async create(entry: CreateJournalEntryRequest): Promise<JournalEntry> {
    try {
      const response = await fetch(`${API_BASE_URL}/journal-entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!response.ok) {
        throw new Error(`Error creating journal entry: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  },

  async update(id: string, entry: UpdateJournalEntryRequest): Promise<JournalEntry> {
    try {
      const response = await fetch(`${API_BASE_URL}/journal-entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!response.ok) {
        throw new Error(`Error updating journal entry: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/journal-entries/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error deleting journal entry: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  },
};
