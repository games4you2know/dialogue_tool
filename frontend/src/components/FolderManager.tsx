import React, { useState, useEffect } from 'react';
import type { Folder } from '../types';
import { folderService } from '../services/folderService';

interface FolderManagerProps {
  projectId: string;
  type: 'dialogue' | 'sms';
  onFolderSelect?: (folderId: string | null) => void;
  selectedFolderId?: string | null;
}

const FolderManager: React.FC<FolderManagerProps> = ({ 
  projectId,
  type,
  onFolderSelect,
  selectedFolderId 
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
  });

  useEffect(() => {
    loadFolders();
  }, [projectId]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const data = await folderService.getFoldersByProject(projectId, type);
      setFolders(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des dossiers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', parentId: '' });
    setEditingFolder(null);
    setShowForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await folderService.createFolder({
        projectId,
        name: formData.name,
        description: formData.description || undefined,
        type: type,
        parentId: formData.parentId || undefined,
      });
      await loadFolders();
      resetForm();
    } catch (err) {
      setError('Erreur lors de la création du dossier');
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolder) return;

    try {
      await folderService.updateFolder(editingFolder.id, {
        name: formData.name,
        description: formData.description || undefined,
        parentId: formData.parentId || undefined,
      });
      await loadFolders();
      resetForm();
    } catch (err) {
      setError('Erreur lors de la modification du dossier');
      console.error(err);
    }
  };

  const handleDelete = async (folderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dossier ? Son contenu sera déplacé à la racine.')) {
      return;
    }

    try {
      await folderService.deleteFolder(folderId);
      await loadFolders();
      if (selectedFolderId === folderId && onFolderSelect) {
        onFolderSelect(null);
      }
    } catch (err) {
      setError('Erreur lors de la suppression du dossier');
      console.error(err);
    }
  };

  const startEdit = (folder: Folder) => {
    setEditingFolder(folder);
    setFormData({
      name: folder.name,
      description: folder.description || '',
      parentId: folder.parentId || '',
    });
    setShowForm(true);
  };

  const buildFolderTree = (folders: Folder[], parentId: string | null = null): Folder[] => {
    return folders
      .filter(f => f.parentId === parentId)
      .map(folder => ({
        ...folder,
        children: buildFolderTree(folders, folder.id),
      }));
  };

  const renderFolder = (folder: Folder, depth: number = 0) => {
    const isSelected = selectedFolderId === folder.id;
    const hasContent = (folder._count?.dialogues || 0) + (folder._count?.smsConversations || 0) > 0;
    
    return (
      <div key={folder.id} style={{ marginLeft: `${depth * 20}px` }}>
        <div
          className={`flex items-center justify-between p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
            isSelected
              ? 'bg-blue-100 border-2 border-blue-500'
              : 'bg-white border border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => onFolderSelect && onFolderSelect(folder.id)}
        >
          <div className="flex items-center flex-1">
            <div
              className="w-8 h-8 rounded mr-3 flex items-center justify-center bg-blue-500"
            >
              <span className="text-white text-sm">📁</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{folder.name}</h4>
              {folder.description && (
                <p className="text-sm text-gray-600">{folder.description}</p>
              )}
              {hasContent && (
                <p className="text-xs text-gray-500 mt-1">
                  {folder._count?.dialogues || 0} dialogue(s), {folder._count?.smsConversations || 0} SMS
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => startEdit(folder)}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
            >
              ✎
            </button>
            <button
              onClick={() => handleDelete(folder.id)}
              className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
            >
              🗑
            </button>
          </div>
        </div>
        {folder.children && folder.children.length > 0 && (
          <div>
            {folder.children.map(child => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm">Chargement des dossiers...</span>
      </div>
    );
  }

  const folderTree = buildFolderTree(folders);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Dossiers</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          + Nouveau dossier
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <div
        className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
          selectedFolderId === null
            ? 'bg-blue-100 border-2 border-blue-500'
            : 'bg-white border border-gray-200 hover:bg-gray-50'
        }`}
        onClick={() => onFolderSelect && onFolderSelect(null)}
      >
        <div className="w-8 h-8 rounded mr-3 flex items-center justify-center bg-gray-400">
          <span className="text-white text-sm">📂</span>
        </div>
        <span className="font-semibold text-gray-800">Tous les éléments</span>
      </div>

      <div>
        {folderTree.map(folder => renderFolder(folder, 0))}
      </div>

      {folders.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Aucun dossier créé. Créez-en un pour organiser vos dialogues et SMS !
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingFolder ? 'Modifier le dossier' : 'Nouveau dossier'}
            </h3>

            <form onSubmit={editingFolder ? handleUpdate : handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du dossier"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description du dossier"
                  rows={3}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dossier parent
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Aucun (racine)</option>
                  {folders
                    .filter(f => !editingFolder || f.id !== editingFolder.id)
                    .map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                </select>
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
                  {editingFolder ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderManager;
