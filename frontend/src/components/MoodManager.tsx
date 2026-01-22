import React, { useState, useEffect } from 'react';
import { moodService } from '../services/moodService';
import type { Mood } from '../types';

interface MoodManagerProps {
  projectId: string;
}

export const MoodManager: React.FC<MoodManagerProps> = ({ projectId }) => {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMood, setEditingMood] = useState<Mood | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    loadMoods();
  }, [projectId]);

  const loadMoods = async () => {
    try {
      setLoading(true);
      const data = await moodService.getMoods(projectId);
      setMoods(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des émotions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditingMood(null);
    setShowForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Veuillez entrer un nom');
      return;
    }

    try {
      setError(null);
      await moodService.createMood(projectId, formData.name.trim());
      resetForm();
      await loadMoods();
    } catch (err) {
      setError('Erreur lors de la création de l\'émotion');
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMood) return;

    if (!formData.name.trim()) {
      setError('Veuillez entrer un nom');
      return;
    }

    try {
      setError(null);
      await moodService.updateMood(editingMood.id, formData.name.trim());
      resetForm();
      await loadMoods();
    } catch (err) {
      setError('Erreur lors de la modification de l\'émotion');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette émotion ?')) {
      return;
    }

    try {
      await moodService.deleteMood(id);
      await loadMoods();
    } catch (err) {
      setError('Erreur lors de la suppression de l\'émotion');
      console.error(err);
    }
  };

  const startEdit = (mood: Mood) => {
    setEditingMood(mood);
    setFormData({ name: mood.name });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des émotions...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Émotions</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouvelle émotion
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Liste des émotions */}
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {moods.map((mood) => (
          <div key={mood.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-2">
              <h3 className="font-semibold text-gray-800 text-sm truncate">{mood.name}</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(mood)}
                className="flex-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(mood.id)}
                className="flex-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {moods.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Aucune émotion créée. Commencez par ajouter votre première émotion !
        </div>
      )}

      {/* Modal de formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingMood ? 'Modifier l\'émotion' : 'Nouvelle émotion'}
            </h3>
            
            <form onSubmit={editingMood ? handleUpdate : handleCreate}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'émotion *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Joyeux, Triste, En colère..."
                  required
                  autoFocus
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
                  {editingMood ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodManager;
