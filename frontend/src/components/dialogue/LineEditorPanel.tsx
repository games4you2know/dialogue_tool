import React from 'react';
import type { DialogueLine, Character, Mood } from '../../types/index';
import { getCharacterName, getCharacterColor } from '../../utils/characterUtils';
import CharacterDisplaySettings from './CharacterDisplaySettings';
import { EditorContent, Editor } from '@tiptap/react';

interface LineEditorPanelProps {
  line: DialogueLine;
  characters: Character[];
  moods: Mood[];
  editor: Editor | null;
  editingDisplaySettings: boolean;
  displaySettings: {
    displayMode: 'one' | 'two';
    displayedCharacterId: string;
    leftCharacterId: string;
    rightCharacterId: string;
    displayedMoodId: string;
    leftMoodId: string;
    rightMoodId: string;
  };
  onStartEditDisplaySettings: () => void;
  onSaveDisplaySettings: () => void;
  onCancelDisplaySettings: () => void;
  onUpdateDisplaySettings: (settings: any) => void;
  onAddChoice: () => void;
  onDeleteChoice: (choiceId: string) => void;
  onCreateMood: (name: string) => Promise<void>;
}

const LineEditorPanel: React.FC<LineEditorPanelProps> = ({
  line,
  characters,
  moods,
  editor,
  editingDisplaySettings,
  displaySettings,
  onStartEditDisplaySettings,
  onSaveDisplaySettings,
  onCancelDisplaySettings,
  onUpdateDisplaySettings,
  onAddChoice,
  onDeleteChoice,
  onCreateMood
}) => {
  return (
    <>
      {/* Informations sur la ligne */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 mb-3">
          {line.characterId && (
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: getCharacterColor(characters, line.characterId) }}
            />
          )}
          <span className="font-medium">
            {line.characterId ? getCharacterName(characters, line.characterId) : 'Narrateur'}
          </span>
        </div>

        {/* Affichage des personnages */}
        <CharacterDisplaySettings
          line={line}
          characters={characters}
          moods={moods}
          isEditing={editingDisplaySettings}
          displaySettings={displaySettings}
          onStartEdit={onStartEditDisplaySettings}
          onSave={onSaveDisplaySettings}
          onCancel={onCancelDisplaySettings}
          onUpdateSettings={onUpdateDisplaySettings}
          onCreateMood={onCreateMood}
        />
        
        {line.choices && line.choices.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Choix disponibles :</h4>
            <div className="space-y-1">
              {line.choices.map((choice) => (
                <div key={choice.id} className="flex justify-between items-center bg-white rounded px-3 py-2 text-sm">
                  <span>{choice.text}</span>
                  <button
                    onClick={() => onDeleteChoice(choice.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={onAddChoice}
              className="mt-2 bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              + Ajouter un choix
            </button>
          </div>
        )}

        {(!line.choices || line.choices.length === 0) && (
          <button
            onClick={onAddChoice}
            className="mt-2 bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
          >
            + Ajouter un choix
          </button>
        )}
      </div>

      {/* Éditeur TipTap */}
      <div className="flex-1 p-4">
        <div className="h-full border border-gray-300 rounded-lg">
          <EditorContent
            editor={editor}
            className="h-full p-4 focus:outline-none"
          />
        </div>
        
        {editor && (
          <div className="mt-2 text-sm text-gray-500 text-right">
            {editor.storage.characterCount.characters()}/1000 caractères
          </div>
        )}
      </div>
    </>
  );
};

export default LineEditorPanel;
