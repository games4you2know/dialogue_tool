import React, { useState, useEffect } from 'react';
import type { JournalEntry } from '../types/index';
import { journalEntryService, type CreateJournalEntryRequest, type UpdateJournalEntryRequest } from '../services/journalEntryService';

interface JournalManagerProps {
  projectId: string;
}

interface EntryFormData {
  entryId: string;
  context: string;
  emotion: number;
  content: string;
  info: string;
}

const EMOTION_LABELS: Record<number, string> = {
  1: 'Heureux',
  2: 'En colère',
  3: 'Triste',
};

const EMOTION_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-700 border-green-200',
  2: 'bg-red-100 text-red-700 border-red-200',
  3: 'bg-blue-100 text-blue-700 border-blue-200',
};

const EMOTION_ICONS: Record<number, string> = {
  1: '😊',
  2: '😡',
  3: '😢',
};

const DEFAULT_FORM: EntryFormData = {
  entryId: '',
  context: '',
  emotion: 1,
  content: '',
  info: '',
};

const JournalManager: React.FC<JournalManagerProps> = ({ projectId }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState<EntryFormData>(DEFAULT_FORM);

  const loadData = async () => {
    try {
      setLoading(true);
      const fetched = await journalEntryService.getByProject(projectId);
      setEntries(fetched);
      setError(null);
    } catch {
      setError('Erreur lors du chargement des entrées du journal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    setEditingEntry(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEntry) {
        const updateData: UpdateJournalEntryRequest = {
          entryId: formData.entryId,
          context: formData.context,
          emotion: formData.emotion,
          content: formData.content,
          info: formData.info,
        };
        await journalEntryService.update(editingEntry.id, updateData);
      } else {
        const createData: CreateJournalEntryRequest = {
          projectId,
          entryId: formData.entryId,
          context: formData.context,
          emotion: formData.emotion,
          content: formData.content,
          info: formData.info,
        };
        await journalEntryService.create(createData);
      }
      await loadData();
      resetForm();
    } catch {
      setError("Erreur lors de l'enregistrement de l'entrée");
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      entryId: entry.entryId,
      context: entry.context,
      emotion: entry.emotion,
      content: entry.content,
      info: entry.info,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette entrée du journal ?')) return;
    try {
      await journalEntryService.delete(id);
      await loadData();
    } catch {
      setError("Erreur lors de la suppression de l'entrée");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Chargement du journal...</span>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Journal</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouvelle entrée
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">📓</div>
          <p>Aucune entrée dans le journal</p>
          <p className="text-sm mt-1">Cliquez sur "+ Nouvelle entrée" pour commencer</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <code className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-mono">
                    {entry.entryId}
                  </code>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${EMOTION_COLORS[entry.emotion]}`}>
                    {EMOTION_ICONS[entry.emotion]} {EMOTION_LABELS[entry.emotion]}
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {entry.context && (
                <div className="mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contexte</span>
                  <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">{entry.context}</p>
                </div>
              )}

              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contenu</span>
                <p className="text-gray-800 text-sm mt-1 whitespace-pre-wrap">{entry.content}</p>
              </div>

              {entry.info && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Info</span>
                  <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{entry.info}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingEntry ? "Modifier l'entrée" : 'Nouvelle entrée'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Entry ID */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID *
                </label>
                <input
                  type="text"
                  value={formData.entryId}
                  onChange={(e) => setFormData({ ...formData, entryId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="ex: CH1_KEY_01_02"
                  required
                />
              </div>

              {/* Emotion */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Émotion *
                </label>
                <select
                  value={formData.emotion}
                  onChange={(e) => setFormData({ ...formData, emotion: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>😊 Heureux</option>
                  <option value={2}>😡 En colère</option>
                  <option value={3}>😢 Triste</option>
                </select>
              </div>

              {/* Context */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contexte
                </label>
                <textarea
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Contexte de l'entrée..."
                />
              </div>

              {/* Content */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  placeholder="Contenu de l'entrée du journal..."
                  required
                />
              </div>

              {/* Info */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Info
                </label>
                <textarea
                  value={formData.info}
                  onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Informations complémentaires..."
                />
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
                  {editingEntry ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalManager;
