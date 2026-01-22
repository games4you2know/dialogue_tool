import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import type { Dialogue, Character, Background } from '../types/index';
import { dialogueService, type CreateDialogueRequest, type UpdateDialogueRequest } from '../services/dialogueService';
import { characterService } from '../services/characterService';
import { backgroundService } from '../services/backgroundService';
import { folderService } from '../services/folderService';
import FolderManager from './FolderManager';
import '../styles/dialogueEditor.css';

interface DialogueManagerProps {
  projectId: string;
  onEditDialogue?: (dialogue: Dialogue) => void;
}

interface DialogueFormData {
  name: string;
  description: string;
  isStartDialogue: boolean;
  folderId: string;
  backgroundId: string;
}

const DialogueManager: React.FC<DialogueManagerProps> = ({ projectId, onEditDialogue }) => {
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDialogue, setEditingDialogue] = useState<Dialogue | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showFolderSidebar, setShowFolderSidebar] = useState(true);
  const [showMoveMenu, setShowMoveMenu] = useState<string | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [formData, setFormData] = useState<DialogueFormData>({
    name: '',
    description: '',
    isStartDialogue: false,
    folderId: '',
    backgroundId: ''
  });

  const descriptionEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Description du dialogue...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData(prev => ({ ...prev, description: html }));
    },
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedDialogues, fetchedCharacters, fetchedBackgrounds, fetchedFolders] = await Promise.all([
        dialogueService.getDialoguesByProject(projectId),
        characterService.getCharactersByProject(projectId),
        backgroundService.getBackgroundsByProject(projectId),
        folderService.getFoldersByProject(projectId, 'dialogue')
      ]);
      setDialogues(fetchedDialogues);
      setCharacters(fetchedCharacters);
      setBackgrounds(fetchedBackgrounds);
      setFolders(fetchedFolders);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const resetForm = () => {
    setFormData({ name: '', description: '', isStartDialogue: false, folderId: selectedFolderId || '', backgroundId: '' });
    if (descriptionEditor) {
      descriptionEditor.commands.setContent('');
    }
    setEditingDialogue(null);
    setShowForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newDialogue: CreateDialogueRequest = {
        projectId,
        name: formData.name,
        description: formData.description || undefined,
        isStartDialogue: formData.isStartDialogue,
        folderId: formData.folderId || undefined,
        backgroundId: formData.backgroundId || undefined
      };
      
      await dialogueService.createDialogue(newDialogue);
      await loadData();
      resetForm();
    } catch (err) {
      setError('Erreur lors de la création du dialogue');
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDialogue) return;
    
    try {
      const updateData: UpdateDialogueRequest = {
        name: formData.name,
        description: formData.description || undefined,
        isStartDialogue: formData.isStartDialogue,
        backgroundId: formData.backgroundId || undefined
      };
      
      await dialogueService.updateDialogue(editingDialogue.id, updateData);
      await loadData();
      resetForm();
    } catch (err) {
      setError('Erreur lors de la modification du dialogue');
      console.error(err);
    }
  };

  const handleDelete = async (dialogueId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dialogue ?')) return;
    
    try {
      await dialogueService.deleteDialogue(dialogueId);
      await loadData();
    } catch (err) {
      setError('Erreur lors de la suppression du dialogue');
      console.error(err);
    }
  };

  const startEdit = (dialogue: Dialogue) => {
    setEditingDialogue(dialogue);
    const description = dialogue.description || '';
    setFormData({
      name: dialogue.name,
      description: description,
      isStartDialogue: dialogue.isStartDialogue || false,
      folderId: dialogue.folderId || '',
      backgroundId: dialogue.backgroundId || ''
    });
    if (descriptionEditor) {
      descriptionEditor.commands.setContent(description);
    }
    setShowForm(true);
  };

  const filteredDialogues = selectedFolderId === null
    ? dialogues
    : dialogues.filter(d => d.folderId === selectedFolderId);

  const handleMoveDialogue = async (dialogueId: string, folderId: string | null) => {
    try {
      await folderService.moveDialogue(dialogueId, folderId);
      await loadData();
      setShowMoveMenu(null);
    } catch (err) {
      setError('Erreur lors du déplacement du dialogue');
      console.error(err);
    }
  };

  const getCharacterName = (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    return character?.name || 'Inconnu';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des dialogues...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar des dossiers */}
      {showFolderSidebar && (
        <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
          <FolderManager
            projectId={projectId}
            type="dialogue"
            onFolderSelect={setSelectedFolderId}
            selectedFolderId={selectedFolderId}
          />
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFolderSidebar(!showFolderSidebar)}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              title={showFolderSidebar ? 'Masquer les dossiers' : 'Afficher les dossiers'}
            >
              {showFolderSidebar ? '◀' : '▶'} Dossiers
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Dialogues</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nouveau dialogue
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Liste des dialogues */}
        <div className="grid gap-4">
          {filteredDialogues.map((dialogue) => (
          <div key={dialogue.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800">{dialogue.name}</h3>
                  {dialogue.isStartDialogue && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Dialogue de départ
                    </span>
                  )}
                </div>
                {dialogue.description && (
                  <div className="text-gray-600 text-sm mb-2" dangerouslySetInnerHTML={{ __html: dialogue.description }} />
                )}
                <div className="text-sm text-gray-500">
                  {dialogue.lines?.length || 0} ligne(s) • {dialogue.characters?.length || 0} personnage(s)
                </div>
              </div>
              
              <div className="flex gap-2 relative">
                {onEditDialogue && (
                  <button
                    onClick={() => onEditDialogue(dialogue)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                  >
                    Éditer
                  </button>
                )}
                <button
                  onClick={() => startEdit(dialogue)}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Modifier
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowMoveMenu(showMoveMenu === dialogue.id ? null : dialogue.id)}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm hover:bg-purple-200 transition-colors"
                  >
                    Déplacer
                  </button>
                  {showMoveMenu === dialogue.id && (
                    <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                      <div className="p-2">
                        <button
                          onClick={() => handleMoveDialogue(dialogue.id, null)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                        >
                          Racine (aucun dossier)
                        </button>
                        {folders.map(folder => (
                          <button
                            key={folder.id}
                            onClick={() => handleMoveDialogue(dialogue.id, folder.id)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                          >
                            {folder.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(dialogue.id)}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>

            {/* Aperçu des lignes */}
            {dialogue.lines && dialogue.lines.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu :</h4>
                <div className="space-y-1">
                  {dialogue.lines.slice(0, 3).map((line) => (
                    <div key={line.id} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="font-medium text-gray-800">
                        {line.characterId ? getCharacterName(line.characterId) : 'Narrateur'}:
                      </span>
                      <span className="truncate">{line.text}</span>
                    </div>
                  ))}
                  {dialogue.lines.length > 3 && (
                    <div className="text-sm text-gray-400">
                      ... et {dialogue.lines.length - 3} ligne(s) de plus
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

        {filteredDialogues.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            {selectedFolderId
              ? 'Aucun dialogue dans ce dossier.'
              : 'Aucun dialogue créé. Commencez par ajouter votre premier dialogue !'}
          </div>
        )}
      </div>

      {/* Modal de formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingDialogue ? 'Modifier le dialogue' : 'Nouveau dialogue'}
            </h3>
            
            <form onSubmit={editingDialogue ? handleUpdate : handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du dialogue"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                  <div className="dialogue-editor-toolbar border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg">
                    <button
                      type="button"
                      onClick={() => descriptionEditor?.chain().focus().toggleBold().run()}
                      className={`px-2 py-1 mx-1 rounded text-sm ${
                        descriptionEditor?.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-white'
                      }`}
                    >
                      G
                    </button>
                    <button
                      type="button"
                      onClick={() => descriptionEditor?.chain().focus().toggleItalic().run()}
                      className={`px-2 py-1 mx-1 rounded text-sm italic ${
                        descriptionEditor?.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-white'
                      }`}
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => descriptionEditor?.chain().focus().toggleStrike().run()}
                      className={`px-2 py-1 mx-1 rounded text-sm line-through ${
                        descriptionEditor?.isActive('strike') ? 'bg-blue-500 text-white' : 'bg-white'
                      }`}
                    >
                      S
                    </button>
                  </div>
                  <EditorContent 
                    editor={descriptionEditor} 
                    className="dialogue-editor-content min-h-[100px] p-3"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background
                </label>
                <select
                  value={formData.backgroundId}
                  onChange={(e) => setFormData({ ...formData, backgroundId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Aucun background</option>
                  {backgrounds.map((bg) => (
                    <option key={bg.id} value={bg.id}>
                      {bg.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isStartDialogue}
                    onChange={(e) => setFormData({ ...formData, isStartDialogue: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Dialogue de départ</span>
                </label>
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
                  {editingDialogue ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DialogueManager;