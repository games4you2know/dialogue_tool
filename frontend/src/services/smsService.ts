import type { SMSConversation, SMSMessage, SMSQuestion, SMSReactions } from '../types/index';

const API_BASE_URL = 'http://localhost:4000/api';

export interface CreateSMSConversationRequest {
  projectId: string;
  name: string;
  folderId?: string;
}

export interface UpdateSMSConversationRequest {
  name: string;
  folderId?: string;
}

export interface CreateSMSMessageRequest {
  characterId?: string;
  text: string;
  timestamp?: Date;
}

export interface UpdateSMSMessageRequest {
  characterId?: string;
  text: string;
  timestamp?: Date;
}

export interface CreateSMSQuestionRequest {
  content: string;
  answers: {
    content: string;
    isCorrect: boolean;
    order?: number;
  }[];
  reactions: SMSReactions;
}

export interface UpdateSMSQuestionRequest {
  content: string;
  answers: {
    content: string;
    isCorrect: boolean;
    order?: number;
  }[];
  reactions: SMSReactions;
}

export const smsService = {
  // Get all SMS conversations for a project
  async getSMSConversationsByProject(projectId: string): Promise<SMSConversation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/project/${projectId}`);
      if (!response.ok) {
        throw new Error(`Error fetching SMS conversations: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching SMS conversations:', error);
      throw error;
    }
  },

  // Get single SMS conversation
  async getSMSConversation(conversationId: string): Promise<SMSConversation> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/${conversationId}`);
      if (!response.ok) {
        throw new Error(`Error fetching SMS conversation: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching SMS conversation:', error);
      throw error;
    }
  },

  // Create new SMS conversation
  async createSMSConversation(conversation: CreateSMSConversationRequest): Promise<SMSConversation> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversation),
      });
      
      if (!response.ok) {
        throw new Error(`Error creating SMS conversation: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating SMS conversation:', error);
      throw error;
    }
  },

  // Update SMS conversation
  async updateSMSConversation(conversationId: string, conversation: UpdateSMSConversationRequest): Promise<SMSConversation> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversation),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating SMS conversation: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error updating SMS conversation:', error);
      throw error;
    }
  },

  // Delete SMS conversation
  async deleteSMSConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/${conversationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting SMS conversation: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting SMS conversation:', error);
      throw error;
    }
  },

  // SMS Messages Management
  
  // Add SMS message
  async addSMSMessage(conversationId: string, message: CreateSMSMessageRequest): Promise<SMSMessage> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      
      if (!response.ok) {
        throw new Error(`Error adding SMS message: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error adding SMS message:', error);
      throw error;
    }
  },

  // Update SMS message
  async updateSMSMessage(messageId: string, message: UpdateSMSMessageRequest): Promise<SMSMessage> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating SMS message: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error updating SMS message:', error);
      throw error;
    }
  },

  // Delete SMS message
  async deleteSMSMessage(messageId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/messages/${messageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting SMS message: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting SMS message:', error);
      throw error;
    }
  },

  // SMS Questions Management
  
  // Add question to SMS message
  async addSMSQuestion(messageId: string, question: CreateSMSQuestionRequest): Promise<SMSQuestion> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/messages/${messageId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(question),
      });
      
      if (!response.ok) {
        throw new Error(`Error adding SMS question: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error adding SMS question:', error);
      throw error;
    }
  },

  // Update SMS question
  async updateSMSQuestion(questionId: string, question: UpdateSMSQuestionRequest): Promise<SMSQuestion> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(question),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating SMS question: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error updating SMS question:', error);
      throw error;
    }
  },

  // Delete SMS question
  async deleteSMSQuestion(questionId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/questions/${questionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting SMS question: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting SMS question:', error);
      throw error;
    }
  },
};