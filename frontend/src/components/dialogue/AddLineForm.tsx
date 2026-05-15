import React, { useState } from 'react';
import type { Character, Mood } from '../../types/index';

interface LineFormData {
  characterId: string;
  text: string;
  order: number;
  mainCharacterMoodId: string;
  mainCharacterPosition: number; // 0=left, 1=middle, 2=right
  secondaryCharacterId: string;
  secondaryCharacterMoodId: string;
  secondaryCharacterPosition: number;
  triggerCameraShake: boolean;
  memory: string;
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

const POSITION_OPTIONS = [
  { value: 0, label: 'Gauche' },
  { value: 1, label: 'Milieu' },
  { value: 2, label: 'Droite' },
];

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
  const [showNewMoodInput, setShowNewMoodInput] = useState<'main' | 'secondary' | null>(null);

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
    position: 'main' | 'secondary'
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
            onClick={() => { setShowNewMoodInput(null); setNewMoodName(''); }}
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
              <option key={mood.id} value={mood.id}>{mood.name}</option>
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Ajouter une ligne de dialogue</h3>

        <form onSubmit={onSubmit}>
          {/* Speaker */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Personnage</label>
            <select
              value={formData.characterId}
              onChange={(e) => onUpdateFormData({ ...formData, characterId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Narrateur</option>
              {characters.map((character) => (
                <option key={character.id} value={character.id}>{character.name}</option>
              ))}
            </select>
          </div>

          {/* Text */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Texte *</label>
            <textarea
              value={formData.text}
              onChange={(e) => onUpdateFormData({ ...formData, text: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Texte de la ligne de dialogue"
              rows={4}
              required
            />
          </div>

          {/* Main character staging */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">Mise en scène — personnage principal</label>
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-2">Position</label>
              <select
                value={formData.mainCharacterPosition}
                onChange={(e) => onUpdateFormData({ ...formData, mainCharacterPosition: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {POSITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {renderMoodSelector(
              formData.mainCharacterMoodId,
              (value) => onUpdateFormData({ ...formData, mainCharacterMoodId: value }),
              "Émotion",
              'main'
            )}
          </div>

          {/* Secondary character */}
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">Personnage secondaire (optionnel)</label>
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-2">Personnage</label>
              <select
                value={formData.secondaryCharacterId}
                onChange={(e) => onUpdateFormData({ ...formData, secondaryCharacterId: e.target.value, secondaryCharacterMoodId: '' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Aucun</option>
                {characters.map((character) => (
                  <option key={character.id} value={character.id}>{character.name}</option>
                ))}
              </select>
            </div>
            {formData.secondaryCharacterId && (
              <>
                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-2">Position</label>
                  <select
                    value={formData.secondaryCharacterPosition}
                    onChange={(e) => onUpdateFormData({ ...formData, secondaryCharacterPosition: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {POSITION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                {renderMoodSelector(
                  formData.secondaryCharacterMoodId,
                  (value) => onUpdateFormData({ ...formData, secondaryCharacterMoodId: value }),
                  "Émotion",
                  'secondary'
                )}
              </>
            )}
          </div>

          {/* Camera shake */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.triggerCameraShake}
                onChange={(e) => onUpdateFormData({ ...formData, triggerCameraShake: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Déclencher camera shake</span>
            </label>
          </div>

          {/* Memory */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Memory (tag)</label>
            <input
              type="text"
              value={formData.memory}
              onChange={(e) => onUpdateFormData({ ...formData, memory: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tag mémoire"
            />
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
