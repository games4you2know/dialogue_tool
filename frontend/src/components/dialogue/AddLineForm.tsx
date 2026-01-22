import React, { useState } from 'react';
import type { Character, Mood } from '../../types/index';

interface LineFormData {
  characterId: string;
  text: string;
  order: number;
  displayMode: 'one' | 'two';
  displayedCharacterId: string;
  leftCharacterId: string;
  rightCharacterId: string;
  displayedMoodId: string;
  leftMoodId: string;
  rightMoodId: string;
}

interface AddLineFormProps {
  characters: Character[];
  moods: Mood[];
  formData: LineFormData;
  onUpdateFormData: (data: LineFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onCreateMood: (name: string) => Promise<void>;
}

const AddLineForm: React.FC<AddLineFormProps> = ({
  characters,
  moods,
  formData,
  onUpdateFormData,
  onSubmit,
  onClose,
  onCreateMood
}) => {
  const [newMoodName, setNewMoodName] = useState('');
  const [showNewMoodInput, setShowNewMoodInput] = useState<'displayed' | 'left' | 'right' | null>(null);

  const handleCreateMood = async () => {
    if (!newMoodName.trim()) return;
    
    await onCreateMood(newMoodName.trim());
    setNewMoodName('');
    setShowNewMoodInput(null);
  };

  const renderMoodSelector = (
    value: string,
    onChange: (value: string) => void,
    label: string,
    position: 'displayed' | 'left' | 'right'
  ) => (
    <div>
      <label className="block text-sm text-gray-600 mb-2">{label}</label>
      {showNewMoodInput === position ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newMoodName}
            onChange={(e) => setNewMoodName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nom de l'émotion"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreateMood}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={() => {
              setShowNewMoodInput(null);
              setNewMoodName('');
            }}
            className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Aucune émotion</option>
            {moods.map((mood) => (
              <option key={mood.id} value={mood.id}>
                {mood.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewMoodInput(position)}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            title="Ajouter une nouvelle émotion"
          >
            +
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Ajouter une ligne de dialogue</h3>
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personnage
            </label>
            <select
              value={formData.characterId}
              onChange={(e) => onUpdateFormData({ ...formData, characterId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {characters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texte *
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => onUpdateFormData({ ...formData, text: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Texte de la ligne de dialogue"
              rows={4}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Affichage des personnages
            </label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.displayMode === 'one'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onUpdateFormData({ ...formData, displayMode: 'one' });
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">Un personnage</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.displayMode === 'two'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onUpdateFormData({ ...formData, displayMode: 'two' });
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">Deux personnages</span>
              </label>
            </div>

            {formData.displayMode === 'one' ? (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Personnage affiché (par défaut : celui qui parle)
                  </label>
                  <select
                    value={formData.displayedCharacterId}
                    onChange={(e) => onUpdateFormData({ ...formData, displayedCharacterId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Celui qui parle</option>
                    {characters.map((character) => (
                      <option key={character.id} value={character.id}>
                        {character.name}
                      </option>
                    ))}
                  </select>
                </div>
                {renderMoodSelector(
                  formData.displayedMoodId,
                  (value) => onUpdateFormData({ ...formData, displayedMoodId: value }),
                  "Émotion du personnage",
                  'displayed'
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Personnage de gauche
                  </label>
                  <select
                    value={formData.leftCharacterId}
                    onChange={(e) => onUpdateFormData({ ...formData, leftCharacterId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucun</option>
                    {characters.map((character) => (
                      <option key={character.id} value={character.id}>
                        {character.name}
                      </option>
                    ))}
                  </select>
                </div>
                {renderMoodSelector(
                  formData.leftMoodId,
                  (value) => onUpdateFormData({ ...formData, leftMoodId: value }),
                  "Émotion personnage gauche",
                  'left'
                )}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Personnage de droite
                  </label>
                  <select
                    value={formData.rightCharacterId}
                    onChange={(e) => onUpdateFormData({ ...formData, rightCharacterId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucun</option>
                    {characters.map((character) => (
                      <option key={character.id} value={character.id}>
                        {character.name}
                      </option>
                    ))}
                  </select>
                </div>
                {renderMoodSelector(
                  formData.rightMoodId,
                  (value) => onUpdateFormData({ ...formData, rightMoodId: value }),
                  "Émotion personnage droite",
                  'right'
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLineForm;
