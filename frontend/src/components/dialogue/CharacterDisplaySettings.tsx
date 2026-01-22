import React from 'react';
import type { DialogueLine, Character, Mood } from '../../types/index';
import { getCharacterName, getCharacterColor, getMoodName } from '../../utils/characterUtils';

interface CharacterDisplaySettingsProps {
  line: DialogueLine;
  characters: Character[];
  moods: Mood[];
  isEditing: boolean;
  displaySettings: {
    displayMode: 'one' | 'two';
    displayedCharacterId: string;
    leftCharacterId: string;
    rightCharacterId: string;
    displayedMoodId: string;
    leftMoodId: string;
    rightMoodId: string;
  };
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onUpdateSettings: (settings: any) => void;
  onCreateMood: (name: string) => Promise<void>;
}

const CharacterDisplaySettings: React.FC<CharacterDisplaySettingsProps> = ({
  line,
  characters,
  moods,
  isEditing,
  displaySettings,
  onStartEdit,
  onSave,
  onCancel,
  onUpdateSettings,
  onCreateMood
}) => {
  const [newMoodName, setNewMoodName] = React.useState('');
  const [showNewMoodInput, setShowNewMoodInput] = React.useState<'displayed' | 'left' | 'right' | null>(null);

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
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      {showNewMoodInput === position ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newMoodName}
            onChange={(e) => setNewMoodName(e.target.value)}
            className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nom de l'émotion"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreateMood}
            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={() => {
              setShowNewMoodInput(null);
              setNewMoodName('');
            }}
            className="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-xs"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
            title="Ajouter une nouvelle émotion"
          >
            +
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="mb-3 p-3 bg-white rounded border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-gray-700">Affichage des personnages :</h4>
        {!isEditing ? (
          <button
            onClick={onStartEdit}
            className="text-xs text-blue-600 hover:text-blue-700 underline"
          >
            Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Enregistrer
            </button>
            <button
              onClick={onCancel}
              className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-2 text-sm">
          {line.leftCharacterId || line.rightCharacterId ? (
            <div>
              <span className="text-gray-600 font-medium mb-2 block">Deux personnages :</span>
              <div className="flex gap-3">
                <div className="flex-1 p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="text-xs text-gray-500 mb-1">Gauche</div>
                  <div className="flex items-center gap-2">
                    {line.leftCharacterId && (
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getCharacterColor(characters, line.leftCharacterId) }}
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {line.leftCharacterId ? getCharacterName(characters, line.leftCharacterId) : 'Aucun'}
                      </div>
                      {line.leftCharacterId && line.leftMoodId && (
                        <div className="text-xs text-gray-600 truncate">
                          {getMoodName(moods, line.leftMoodId)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-2 bg-green-50 rounded border border-green-200">
                  <div className="text-xs text-gray-500 mb-1">Droite</div>
                  <div className="flex items-center gap-2">
                    {line.rightCharacterId && (
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getCharacterColor(characters, line.rightCharacterId) }}
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {line.rightCharacterId ? getCharacterName(characters, line.rightCharacterId) : 'Aucun'}
                      </div>
                      {line.rightCharacterId && line.rightMoodId && (
                        <div className="text-xs text-gray-600 truncate">
                          {getMoodName(moods, line.rightMoodId)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-gray-600 font-medium mb-2 block">Un personnage :</span>
              <div className="p-2 bg-purple-50 rounded border border-purple-200">
                <div className="flex items-center gap-2">
                  {(line.displayedCharacterId || line.characterId) && (
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getCharacterColor(characters, line.displayedCharacterId || line.characterId || '') }}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {line.displayedCharacterId 
                        ? getCharacterName(characters, line.displayedCharacterId)
                        : line.characterId 
                        ? getCharacterName(characters, line.characterId) + ' (celui qui parle)'
                        : 'Aucun'}
                    </div>
                    {line.displayedCharacterId && line.displayedMoodId && (
                      <div className="text-xs text-gray-600 truncate">
                        {getMoodName(moods, line.displayedMoodId)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={displaySettings.displayMode === 'one'}
                onChange={(e) => {
                  if (e.target.checked) {
                    onUpdateSettings({ ...displaySettings, displayMode: 'one' });
                  }
                }}
                className="mr-2"
              />
              <span className="text-sm">Un personnage</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={displaySettings.displayMode === 'two'}
                onChange={(e) => {
                  if (e.target.checked) {
                    onUpdateSettings({ ...displaySettings, displayMode: 'two' });
                  }
                }}
                className="mr-2"
              />
              <span className="text-sm">Deux personnages</span>
            </label>
          </div>

          {displaySettings.displayMode === 'one' ? (
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Personnage affiché
                </label>
                <select
                  value={displaySettings.displayedCharacterId}
                  onChange={(e) => {
                    onUpdateSettings({ ...displaySettings, displayedCharacterId: e.target.value, displayedMoodId: '' });
                  }}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Celui qui parle (par défaut)</option>
                  {characters.map((character) => (
                    <option key={character.id} value={character.id}>
                      {character.name}
                    </option>
                  ))}
                </select>
              </div>
              {renderMoodSelector(
                displaySettings.displayedMoodId,
                (value) => onUpdateSettings({ ...displaySettings, displayedMoodId: value }),
                "Émotion du personnage",
                'displayed'
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Personnage de gauche
                  </label>
                  <select
                    value={displaySettings.leftCharacterId}
                    onChange={(e) => onUpdateSettings({ ...displaySettings, leftCharacterId: e.target.value, leftMoodId: '' })}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  displaySettings.leftMoodId,
                  (value) => onUpdateSettings({ ...displaySettings, leftMoodId: value }),
                  "Émotion du personnage de gauche",
                  'left'
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Personnage de droite
                  </label>
                  <select
                    value={displaySettings.rightCharacterId}
                    onChange={(e) => onUpdateSettings({ ...displaySettings, rightCharacterId: e.target.value, rightMoodId: '' })}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  displaySettings.rightMoodId,
                  (value) => onUpdateSettings({ ...displaySettings, rightMoodId: value }),
                  "Émotion du personnage de droite",
                  'right'
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterDisplaySettings;
