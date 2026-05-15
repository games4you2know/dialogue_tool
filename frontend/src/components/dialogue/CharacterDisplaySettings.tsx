import React from 'react';
import type { DialogueLine, Character, Mood } from '../../types/index';
import { getCharacterName, getCharacterColor, getMoodName } from '../../utils/characterUtils';

const POSITION_LABELS: Record<number, string> = { 0: 'Gauche', 1: 'Milieu', 2: 'Droite' };
const POSITION_OPTIONS = [
  { value: 0, label: 'Gauche' },
  { value: 1, label: 'Milieu' },
  { value: 2, label: 'Droite' },
];

interface StagingSettings {
  mainCharacterMoodId: string;
  mainCharacterPosition: number;
  secondaryCharacterId: string;
  secondaryCharacterMoodId: string;
  secondaryCharacterPosition: number;
  triggerCameraShake: boolean;
  memory: string;
}

interface CharacterDisplaySettingsProps {
  line: DialogueLine;
  characters: Character[];
  moods: Mood[];
  isEditing: boolean;
  displaySettings: StagingSettings;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onUpdateSettings: (settings: StagingSettings) => void;
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
  const [showNewMoodInput, setShowNewMoodInput] = React.useState<'main' | 'secondary' | null>(null);

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
          <button type="button" onClick={handleCreateMood} className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs">✓</button>
          <button type="button" onClick={() => { setShowNewMoodInput(null); setNewMoodName(''); }} className="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-xs">✕</button>
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
              <option key={mood.id} value={mood.id}>{mood.name}</option>
            ))}
          </select>
          <button type="button" onClick={() => setShowNewMoodInput(position)} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs" title="Ajouter une nouvelle émotion">+</button>
        </div>
      )}
    </div>
  );

  // ── Read-only view ──────────────────────────────────────────────────────────
  const readonlyView = () => {
    const mainCharId = line.characterId;
    const mainMoodId = line.mainCharacterMoodId;
    const mainPos = line.mainCharacterPosition ?? 1;
    const secCharId = line.secondaryCharacterId;
    const secMoodId = line.secondaryCharacterMoodId;
    const secPos = line.secondaryCharacterPosition ?? 1;

    return (
      <div className="space-y-2 text-sm">
        {/* Main character */}
        <div className="p-2 bg-blue-50 rounded border border-blue-200">
          <div className="text-xs text-gray-500 mb-1">Principal · {POSITION_LABELS[mainPos] ?? mainPos}</div>
          <div className="flex items-center gap-2">
            {mainCharId && (
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: getCharacterColor(characters, mainCharId) }} />
            )}
            <div className="min-w-0">
              <div className="font-medium truncate">
                {mainCharId ? getCharacterName(characters, mainCharId) : 'Narrateur'}
              </div>
              {mainMoodId && (
                <div className="text-xs text-gray-600 truncate">{getMoodName(moods, mainMoodId)}</div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary character */}
        {secCharId ? (
          <div className="p-2 bg-green-50 rounded border border-green-200">
            <div className="text-xs text-gray-500 mb-1">Secondaire · {POSITION_LABELS[secPos] ?? secPos}</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: getCharacterColor(characters, secCharId) }} />
              <div className="min-w-0">
                <div className="font-medium truncate">{getCharacterName(characters, secCharId)}</div>
                {secMoodId && (
                  <div className="text-xs text-gray-600 truncate">{getMoodName(moods, secMoodId)}</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic">Pas de personnage secondaire</div>
        )}

        {/* Camera shake & memory */}
        <div className="flex flex-wrap gap-3 pt-1">
          {line.triggerCameraShake && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Camera shake</span>
          )}
          {line.memory && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Memory: {line.memory}</span>
          )}
        </div>
      </div>
    );
  };

  // ── Edit view ───────────────────────────────────────────────────────────────
  const editView = () => (
    <div className="space-y-3">
      {/* Main character staging */}
      <div className="p-2 bg-blue-50 rounded border border-blue-200">
        <label className="block text-xs font-medium text-gray-700 mb-2">Mise en scène — principal</label>
        <div className="mb-2">
          <label className="block text-xs text-gray-600 mb-1">Position</label>
          <select
            value={displaySettings.mainCharacterPosition}
            onChange={(e) => onUpdateSettings({ ...displaySettings, mainCharacterPosition: Number(e.target.value) })}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {POSITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {renderMoodSelector(
          displaySettings.mainCharacterMoodId,
          (value) => onUpdateSettings({ ...displaySettings, mainCharacterMoodId: value }),
          "Émotion",
          'main'
        )}
      </div>

      {/* Secondary character */}
      <div className="p-2 bg-green-50 rounded border border-green-200">
        <label className="block text-xs font-medium text-gray-700 mb-2">Personnage secondaire (optionnel)</label>
        <div className="mb-2">
          <label className="block text-xs text-gray-600 mb-1">Personnage</label>
          <select
            value={displaySettings.secondaryCharacterId}
            onChange={(e) => onUpdateSettings({ ...displaySettings, secondaryCharacterId: e.target.value, secondaryCharacterMoodId: '' })}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Aucun</option>
            {characters.map((character) => (
              <option key={character.id} value={character.id}>{character.name}</option>
            ))}
          </select>
        </div>
        {displaySettings.secondaryCharacterId && (
          <>
            <div className="mb-2">
              <label className="block text-xs text-gray-600 mb-1">Position</label>
              <select
                value={displaySettings.secondaryCharacterPosition}
                onChange={(e) => onUpdateSettings({ ...displaySettings, secondaryCharacterPosition: Number(e.target.value) })}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {POSITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {renderMoodSelector(
              displaySettings.secondaryCharacterMoodId,
              (value) => onUpdateSettings({ ...displaySettings, secondaryCharacterMoodId: value }),
              "Émotion",
              'secondary'
            )}
          </>
        )}
      </div>

      {/* Camera shake */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={displaySettings.triggerCameraShake}
          onChange={(e) => onUpdateSettings({ ...displaySettings, triggerCameraShake: e.target.checked })}
          className="w-3.5 h-3.5"
        />
        <span className="text-xs text-gray-700">Déclencher camera shake</span>
      </label>

      {/* Memory */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">Memory (tag)</label>
        <input
          type="text"
          value={displaySettings.memory}
          onChange={(e) => onUpdateSettings({ ...displaySettings, memory: e.target.value })}
          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tag mémoire"
        />
      </div>
    </div>
  );

  return (
    <div className="mb-3 p-3 bg-white rounded border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-gray-700">Mise en scène :</h4>
        {!isEditing ? (
          <button onClick={onStartEdit} className="text-xs text-blue-600 hover:text-blue-700 underline">Modifier</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={onSave} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Enregistrer</button>
            <button onClick={onCancel} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300">Annuler</button>
          </div>
        )}
      </div>

      {!isEditing ? readonlyView() : editView()}
    </div>
  );
};

export default CharacterDisplaySettings;
