import type { BankTransaction } from '../types/index';
import API_BASE_URL from '../config/api';

export interface CreateBankTransactionRequest {
  projectId: string;
  type: number;
  name: string;
  paymentType: number;
  amount: number;
}

export interface UpdateBankTransactionRequest {
  type?: number;
  name?: string;
  paymentType?: number;
  amount?: number;
}

export const bankTransactionService = {
  async getByProject(projectId: string): Promise<BankTransaction[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/bank-transactions/project/${projectId}`);
      if (!response.ok) {
        throw new Error(`Error fetching bank transactions: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching bank transactions:', error);
      throw error;
    }
  },

  async create(transaction: CreateBankTransactionRequest): Promise<BankTransaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/bank-transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) {
        throw new Error(`Error creating bank transaction: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error creating bank transaction:', error);
      throw error;
    }
  },

  async update(transactionId: string, transaction: UpdateBankTransactionRequest): Promise<BankTransaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/bank-transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) {
        throw new Error(`Error updating bank transaction: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error updating bank transaction:', error);
      throw error;
    }
  },

  async delete(transactionId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/bank-transactions/${transactionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error deleting bank transaction: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting bank transaction:', error);
      throw error;
    }
  },
};
