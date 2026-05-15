import React, { useState, useEffect } from 'react';
import type { BankTransaction } from '../types/index';
import { bankTransactionService, type CreateBankTransactionRequest, type UpdateBankTransactionRequest } from '../services/bankTransactionService';

interface BankTransactionManagerProps {
  projectId: string;
}

interface TransactionFormData {
  type: number;
  name: string;
  paymentType: number;
  amount: string;
}

const TYPE_LABELS: Record<number, string> = {
  0: 'Dépense',
  1: 'Recette',
};

const PAYMENT_TYPE_LABELS: Record<number, string> = {
  0: 'Carte',
  1: 'Virement',
  2: 'Prélèvement',
};

const PAYMENT_TYPE_ICONS: Record<number, string> = {
  0: '💳',
  1: '🏦',
  2: '🔄',
};

const formatAmount = (amount: number, type: number): string => {
  const sign = type === 0 ? '-' : '+';
  return `${sign}${amount.toFixed(2)} €`;
};

const BankTransactionManager: React.FC<BankTransactionManagerProps> = ({ projectId }) => {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<BankTransaction | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 0,
    name: '',
    paymentType: 0,
    amount: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const fetched = await bankTransactionService.getByProject(projectId);
      setTransactions(fetched);
      setError(null);
    } catch {
      setError('Erreur lors du chargement des transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const resetForm = () => {
    setFormData({ type: 0, name: '', paymentType: 0, amount: '' });
    setEditingTransaction(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError('Montant invalide');
      return;
    }
    try {
      if (editingTransaction) {
        const updateData: UpdateBankTransactionRequest = {
          type: formData.type,
          name: formData.name,
          paymentType: formData.paymentType,
          amount: parsedAmount,
        };
        await bankTransactionService.update(editingTransaction.id, updateData);
      } else {
        const createData: CreateBankTransactionRequest = {
          projectId,
          type: formData.type,
          name: formData.name,
          paymentType: formData.paymentType,
          amount: parsedAmount,
        };
        await bankTransactionService.create(createData);
      }
      await loadData();
      resetForm();
    } catch {
      setError("Erreur lors de l'enregistrement de la transaction");
    }
  };

  const handleEdit = (transaction: BankTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      name: transaction.name,
      paymentType: transaction.paymentType,
      amount: transaction.amount.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Supprimer cette transaction ?')) return;
    try {
      await bankTransactionService.delete(transactionId);
      await loadData();
    } catch {
      setError('Erreur lors de la suppression de la transaction');
    }
  };

  const balance = transactions.reduce((acc, tx) => {
    return tx.type === 1 ? acc + tx.amount : acc - tx.amount;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Chargement des transactions...</span>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Compte bancaire</h2>
          {transactions.length > 0 && (
            <p className={`text-sm font-medium mt-1 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Solde : {balance >= 0 ? '+' : ''}{balance.toFixed(2)} €
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouvelle transaction
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">🏦</div>
          <p>Aucune transaction enregistrée</p>
          <p className="text-sm mt-1">Cliquez sur "+ Nouvelle transaction" pour commencer</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center gap-4">
              {/* Type indicator */}
              <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${tx.type === 1 ? 'bg-green-500' : 'bg-red-500'}`} />

              {/* Payment type icon */}
              <div className="text-xl flex-shrink-0" title={PAYMENT_TYPE_LABELS[tx.paymentType]}>
                {PAYMENT_TYPE_ICONS[tx.paymentType]}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{tx.name}</p>
                <p className="text-xs text-gray-500">
                  {TYPE_LABELS[tx.type]} · {PAYMENT_TYPE_LABELS[tx.paymentType]}
                </p>
              </div>

              {/* Amount */}
              <span className={`text-lg font-semibold flex-shrink-0 ${tx.type === 1 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(tx.amount, tx.type)}
              </span>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(tx)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                  title="Modifier"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(tx.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingTransaction ? 'Modifier la transaction' : 'Nouvelle transaction'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Dépense</option>
                  <option value={1}>Recette</option>
                </select>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: Loyer, Salaire, Courses..."
                  required
                />
              </div>

              {/* Payment type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moyen de paiement *
                </label>
                <select
                  value={formData.paymentType}
                  onChange={(e) => setFormData({ ...formData, paymentType: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>💳 Carte</option>
                  <option value={1}>🏦 Virement</option>
                  <option value={2}>🔄 Prélèvement</option>
                </select>
              </div>

              {/* Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (€) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: 850.00"
                  required
                />
                {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                  <p className={`text-xs mt-1 font-medium ${formData.type === 1 ? 'text-green-600' : 'text-red-600'}`}>
                    → {formatAmount(parseFloat(formData.amount), formData.type)}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTransaction ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankTransactionManager;
