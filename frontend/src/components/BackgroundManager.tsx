import React, { useState, useEffect } from 'react';
import { backgroundService } from '../services/backgroundService';
import type { Background } from '../types';

interface BackgroundManagerProps {
  projectId: string;
}

export const BackgroundManager: React.FC<BackgroundManagerProps> = ({ projectId }) => {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingBackground, setEditingBackground] = useState<Background | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadBackgrounds();
  }, [projectId]);

  const loadBackgrounds = async () => {
    try {
      setLoading(true);
      const data = await backgroundService.getBackgroundsByProject(projectId);
      setBackgrounds(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des backgrounds');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingBackground(null);
    setShowForm(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !formData.name.trim()) {
      setError('Veuillez sélectionner une image et entrer un nom');
      return;
    }

    try {
      setUploading(true);
      setError(null);
    
      const uploadResult = await backgroundService.uploadImage(selectedFile);
      const fullImageUrl = `http://localhost:4000${uploadResult.url}`;
      await backgroundService.createBackground({
        projectId,
        name: formData.name.trim(),
        imageUrl: fullImageUrl,
      });

      resetForm();
      
      await loadBackgrounds();
    } catch (err) {
      setError('Erreur lors de la création du background');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBackground) return;

    try {
      setUploading(true);
      setError(null);

      let imageUrl = editingBackground.imageUrl;

      if (selectedFile) {
        const uploadResult = await backgroundService.uploadImage(selectedFile);
        imageUrl = `http://localhost:4000${uploadResult.url}`;
      }

      await backgroundService.updateBackground(editingBackground.id, {
        name: formData.name.trim(),
        imageUrl,
      });

      resetForm();
      await loadBackgrounds();
    } catch (err) {
      setError('Erreur lors de la modification du background');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce background ?')) {
      return;
    }

    try {
      await backgroundService.deleteBackground(id);
      await loadBackgrounds();
    } catch (err) {
      setError('Erreur lors de la suppression du background');
      console.error(err);
    }
  };

  const startEdit = (background: Background) => {
    setEditingBackground(background);
    setFormData({ name: background.name });
    setPreviewUrl(background.imageUrl);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des backgrounds...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Backgrounds</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouveau background
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Liste des backgrounds */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {backgrounds.map((background) => (
          <div key={background.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <img
              src={background.imageUrl}
              alt={background.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">{background.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(background)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(background.id)}
                  className="flex-1 bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {backgrounds.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Aucun background créé. Commencez par ajouter votre premier background !
        </div>
      )}

      {/* Modal de formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingBackground ? 'Modifier le background' : 'Nouveau background'}
            </h3>
            
            <form onSubmit={editingBackground ? handleUpdate : handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du background"
                  required
                  disabled={uploading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image {editingBackground ? '' : '*'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!editingBackground}
                  disabled={uploading}
                />
                {editingBackground && !selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Laisser vide pour conserver l'image actuelle
                  </p>
                )}
              </div>

              {previewUrl && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aperçu
                  </label>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-64 object-contain border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={uploading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {uploading ? 'En cours...' : (editingBackground ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundManager;