import React from 'react';
import type { DialogueLine, Character } from '../../types/index';
import { getCharacterName, getCharacterColor } from '../../utils/characterUtils';

interface DialogueLinesListProps {
  lines: DialogueLine[];
  characters: Character[];
  selectedLine: DialogueLine | null;
  onSelectLine: (line: DialogueLine) => void;
  onDeleteLine: (lineId: string) => void;
}

const DialogueLinesList: React.FC<DialogueLinesListProps> = ({
  lines,
  characters,
  selectedLine,
  onSelectLine,
  onDeleteLine
}) => {
  return (
    <div className="w-1/3 border-r border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Lignes de dialogue</h3>
      
      <div className="space-y-2">
        {lines.map((line, index) => (
          <div
            key={line.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedLine?.id === line.id
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => onSelectLine(line)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">#{index + 1}</span>
                {line.characterId && (
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getCharacterColor(characters, line.characterId) }}
                  />
                )}
                <span className="text-sm font-medium">
                  {line.characterId ? getCharacterName(characters, line.characterId) : 'Narrateur'}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLine(line.id);
                }}
                className="text-gray-400 hover:text-red-600 text-xs"
              >
                🗑️
              </button>
            </div>
            <div className="text-sm text-gray-600 truncate">
              {line.text?.replace(/<[^>]*>/g, '') || 'Texte vide'}
            </div>
            {line.choices && line.choices.length > 0 && (
              <div className="mt-2 text-xs text-blue-600">
                {line.choices.length} choix
              </div>
            )}
          </div>
        ))}
      </div>

      {lines.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Aucune ligne de dialogue. Commencez par en ajouter une !
        </div>
      )}
    </div>
  );
};

export default DialogueLinesList;
