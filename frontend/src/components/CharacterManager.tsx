import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import type { Character } from '../types/index';
import { characterService, type CreateCharacterRequest, type UpdateCharacterRequest } from '../services/characterService';
import '../styles/dialogueEditor.css';

interface CharacterManagerProps {
  projectId: string;
}

interface CharacterFormData {
  name: string;
  tag: string;
  color: string;
  description: string;
}

const CharacterManager: React.FC<CharacterManagerProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState<CharacterFormData>({
    name: '',
    tag: '',
    color: '#3B82F6',
    description: ''
  });

  const descriptionEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Description du personnage...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData(prev => ({ ...prev, description: html }));
    },
  });

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const fetchedCharacters = await characterService.getCharactersByProject(projectId);
      setCharacters(fetchedCharacters);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des personnages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, [projectId]);

  const resetForm = () => {
    setFormData({ name: '', tag: '', color: '#3B82F6', description: '' });
    if (descriptionEditor) {
      descriptionEditor.commands.setContent('');
    }
    setEditingCharacter(null);
    setShowForm(false);
  };



  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCharacter: CreateCharacterRequest = {
        projectId,
        name: formData.name,
        tag: formData.tag,
        color: formData.color || undefined,
        description: formData.description || undefined
      };
      
      await characterService.createCharacter(newCharacter);
      await loadCharacters();
      resetForm();
    } catch (err) {
      setError('Erreur lors de la création du personnage');
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCharacter) return;
    
    try {
      const updateData: UpdateCharacterRequest = {
        name: formData.name,
        tag: formData.tag,
        color: formData.color || undefined,
        description: formData.description || undefined
      };
      
      await characterService.updateCharacter(editingCharacter.id, updateData);
      await loadCharacters();
      resetForm();
    } catch (err) {
      setError('Erreur lors de la modification du personnage');
      console.error(err);
    }
  };

  const handleDelete = async (characterId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce personnage ?')) return;
    
    try {
      await characterService.deleteCharacter(characterId);
      await loadCharacters();
    } catch (err) {
      setError('Erreur lors de la suppression du personnage');
      console.error(err);
    }
  };

  const startEdit = async (character: Character) => {
    setEditingCharacter(character);
    const description = (character as any).description || '';
    setFormData({
      name: character.name,
      tag: character.tag || '',
      color: character.color || '#3B82F6',
      description: description
    });
    if (descriptionEditor) {
      descriptionEditor.commands.setContent(description);
    }
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des personnages...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Personnages</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouveau personnage
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Liste des personnages */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {characters.map((character) => (
          <div key={character.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-3">
              <div 
                className="w-10 h-10 rounded-full mr-3"
                style={{ backgroundColor: character.color || '#3B82F6' }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{character.name}</h3>
                {(character as any).description && (
                  <div className="text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: (character as any).description }} />
                )}
              </div>
            </div>

            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate(`/projects/${projectId}/characters/${character.id}`)}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors font-medium"
              >
                Voir les détails
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(character)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(character.id)}
                  className="flex-1 bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {characters.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Aucun personnage créé. Commencez par ajouter votre premier personnage !
        </div>
      )}

      {/* Modal de formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingCharacter ? 'Modifier le personnage' : 'Nouveau personnage'}
            </h3>
            
            <form onSubmit={editingCharacter ? handleUpdate : handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du personnage"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag *
                </label>
                <input
                  type="text"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tag du personnage"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-10"
                />
              </div>

              <div className="mb-6">
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
                  {editingCharacter ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterManager;