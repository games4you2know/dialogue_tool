import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import type { Character, Mood } from '../types/index';
import { characterService, type UpdateCharacterRequest } from '../services/characterService';
import '../styles/dialogueEditor.css';

const CharacterDetailsPage: React.FC = () => {
  const { projectId, characterId } = useParams<{ projectId: string; characterId: string }>();
  const navigate = useNavigate();
  
  const [character, setCharacter] = useState<Character | null>(null);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    color: '#3B82F6',
    description: ''
  });
  const [newMoodName, setNewMoodName] = useState('');
  const [editingMood, setEditingMood] = useState<{ id: string; name: string } | null>(null);

  const descriptionEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Description du personnage...',
      }),
    ],
    content: '',
    editable: isEditing,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData(prev => ({ ...prev, description: html }));
    },
  });

  const loadCharacter = async () => {
    if (!characterId) return;
    
    try {
      setLoading(true);
      const data = await characterService.getCharacter(characterId);
      setCharacter(data);
      setFormData({
        name: data.name,
        tag: data.tag || '',
        color: data.color || '#3B82F6',
        description: (data as any).description || ''
      });
      if (descriptionEditor) {
        descriptionEditor.commands.setContent((data as any).description || '');
      }
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement du personnage');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoods = async () => {
    if (!characterId) return;
    
    try {
      const data = await characterService.getMoods(characterId);
      setMoods(data);
    } catch (err) {
      console.error('Error loading moods:', err);
    }
  };

  useEffect(() => {
    loadCharacter();
    loadMoods();
  }, [characterId]);

  const handleSave = async () => {
    if (!characterId) return;
    
    try {
      const updateData: UpdateCharacterRequest = {
        name: formData.name,
        tag: formData.tag,
        color: formData.color || undefined,
        description: formData.description || undefined
      };
      
      await characterService.updateCharacter(characterId, updateData);
      setIsEditing(false);
      await loadCharacter();
    } catch (err) {
      setError('Erreur lors de la modification du personnage');
      console.error(err);
    }
  };

  const handleCreateMood = async () => {
    if (!characterId || !newMoodName.trim()) return;
    
    try {
      await characterService.createMood(characterId, newMoodName.trim());
      setNewMoodName('');
      await loadMoods();
    } catch (err) {
      console.error('Error creating mood:', err);
    }
  };

  const handleUpdateMood = async (moodId: string, newName: string) => {
    if (!characterId || !newName.trim()) return;
    
    try {
      await characterService.updateMood(characterId, moodId, newName.trim());
      setEditingMood(null);
      await loadMoods();
    } catch (err) {
      console.error('Error updating mood:', err);
    }
  };

  const handleDeleteMood = async (moodId: string) => {
    if (!characterId || !confirm('Êtes-vous sûr de vouloir supprimer cette humeur ?')) return;
    
    try {
      await characterService.deleteMood(characterId, moodId);
      await loadMoods();
    } catch (err) {
      console.error('Error deleting mood:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Personnage introuvable
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="text-blue-600 hover:text-blue-700 flex items-center"
        >
          ← Retour au projet
        </button>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Character Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div 
                className="w-16 h-16 rounded-full mr-4"
                style={{ backgroundColor: isEditing ? formData.color : character.color || '#3B82F6' }}
              />
              {isEditing ? (
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-2xl font-bold border border-gray-300 rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full text-sm text-gray-600 border border-gray-300 rounded px-2 py-1"
                    placeholder="Tag"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-800">{character.name}</h1>
                  <p className="text-gray-600">{character.tag}</p>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-32 h-10 border border-gray-300 rounded"
                />
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              {isEditing ? (
                <div className="border border-gray-300 rounded-lg">
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
                  </div>
                  <EditorContent 
                    editor={descriptionEditor} 
                    className="dialogue-editor-content min-h-[150px] p-3"
                  />
                </div>
              ) : (
                <div 
                  className="text-gray-700 prose"
                  dangerouslySetInnerHTML={{ __html: (character as any).description || '<p class="text-gray-400 italic">Aucune description</p>' }}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics Card (for future implementation) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Dialogues : <span className="font-semibold">À venir</span></p>
              <p>SMS : <span className="font-semibold">À venir</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetailsPage;
