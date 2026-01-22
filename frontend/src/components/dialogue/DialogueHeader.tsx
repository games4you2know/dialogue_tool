import React from 'react';
import type { Dialogue } from '../../types/index';

interface DialogueHeaderProps {
  dialogue: Dialogue;
  onAddLine: () => void;
  onClose: () => void;
}

const DialogueHeader: React.FC<DialogueHeaderProps> = ({
  dialogue,
  onAddLine,
  onClose
}) => {
  return (
    <div className="flex justify-between items-start mb-3">
      <div>
        <h2 className="text-xl font-bold text-gray-800">{dialogue.name}</h2>
        {dialogue.description && (
          <p className="text-gray-600 text-sm">{dialogue.description}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onAddLine}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
        >
          + Ajouter une ligne
        </button>
        <button
          onClick={onClose}
          className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

export default DialogueHeader;
