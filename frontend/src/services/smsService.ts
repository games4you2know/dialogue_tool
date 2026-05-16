import type { SMSConversation, SMSMessage, SMSQuestion } from '../types/index';
import API_BASE_URL from '../config/api';

export interface CreateSMSConversationRequest {
  projectId: string;
  name: string;
  tag: string;
  folderId?: string;
  npcCharacterId?: string;
}

export interface UpdateSMSConversationRequest {
  name: string;
  tag?: string;
  folderId?: string;
  npcCharacterId?: string | null;
}

export interface CreateSMSMessageRequest {
  fromCpu: boolean;
  text: string;
  timestamp?: Date;
}

export interface UpdateSMSMessageRequest {
  fromCpu?: boolean;
  text?: string;
  timestamp?: Date;
}

export interface CreateSMSQuestionRequest {
  content: string;
  answers: {
    content: string;
    isCorrect: boolean;
    order?: number;
    cpuResponse?: string;
  }[];
}

export interface UpdateSMSQuestionRequest {
  content: string;
  answers: {
    content: string;
    isCorrect: boolean;
    order?: number;
    cpuResponse?: string;
  }[];
}

export const smsService = {
  async getSMSConversationsByProject(projectId: string): Promise<SMSConversation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/project/${projectId}`);
      if (!response.ok) throw new Error(`Error fetching SMS conversations: ${response.statusText}`);
      return response.json();
    } catch (error) {
      console.error('Error fetching SMS conversations:', error);
      throw error;
    }
  },

  async getSMSConversation(conversationId: string): Promise<SMSConversation> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/${conversationId}`);
      if (!response.ok) throw new Error(`Error fetching SMS conversation: ${response.statusText}`);
      return response.json();
    } catch (error) {
      console.error('Error fetching SMS conversation:', error);
      throw error;
    }
  },

  async createSMSConversation(conversation: CreateSMSConversationRequest): Promise<SMSConversation> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversation),
      });
      if (!response.ok) throw new Error(`Error creating SMS conversation: ${response.statusText}`);
      return response.json();
    } catch (error) {
      console.error('Error creating SMS conversation:', error);
      throw error;
    }
  },

  async updateSMSConversation(conversationId: string, conversation: UpdateSMSConversationRequest): Promise<SMSConversation> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversation),
      });
      if (!response.ok) throw new Error(`Error updating SMS conversation: ${response.statusText}`);
      return response.json();
    } catch (error) {
      console.error('Error updating SMS conversation:', error);
      throw error;
    }
  },

  async deleteSMSConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/${conversationId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Error deleting SMS conversation: ${response.statusText}`);
    } catch (error) {
      console.error('Error deleting SMS conversation:', error);
      throw error;
    }
  },

  async addSMSMessage(conversationId: string, message: CreateSMSMessageRequest): Promise<SMSMessage> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      if (!response.ok) throw new Error(`Error adding SMS message: ${response.statusText}`);
      return response.json();
    } catch (error) {
      console.error('Error adding SMS message:', error);
      throw error;
    }
  },

  async updateSMSMessage(messageId: string, message: UpdateSMSMessageRequest): Promise<SMSMessage> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      if (!response.ok) throw new Error(`Error updating SMS message: ${response.statusText}`);
      return response.json();
    } catch (error) {
      console.error('Error updating SMS message:', error);
      throw error;
    }
  },

  async deleteSMSMessage(messageId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/messages/${messageId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Error deleting SMS message: ${response.statusText}`);
    } catch (error) {
      console.error('Error deleting SMS message:', error);
      throw error;
    }
  },

  async addSMSQuestion(messageId: string, question: CreateSMSQuestionRequest): Promise<SMSQuestion> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/messages/${messageId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question),
      });
      if (!response.ok) throw new Error(`Error adding SMS question: ${response.statusText}`);
      return response.json();
    } catch (error) {
      console.error('Error adding SMS question:', error);
      throw error;
    }
  },

  async updateSMSQuestion(questionId: string, question: UpdateSMSQuestionRequest): Promise<SMSQuestion> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question),
      });
      if (!response.ok) throw new Error(`Error updating SMS question: ${response.statusText}`);
      return response.json();
    } catch (error) {
      console.error('Error updating SMS question:', error);
      throw error;
    }
  },

  async deleteSMSQuestion(questionId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/questions/${questionId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Error deleting SMS question: ${response.statusText}`);
    } catch (error) {
      console.error('Error deleting SMS question:', error);
      throw error;
    }
  },
};
