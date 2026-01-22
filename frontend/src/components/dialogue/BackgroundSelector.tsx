import React from 'react';
import type { Background } from '../../types/index';

interface BackgroundSelectorProps {
  currentBackgroundId: string | null;
  backgrounds: Background[];
  onSelect: (backgroundId: string | null) => void;
  onClose: () => void;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  currentBackgroundId,
  backgrounds,
  onSelect,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Sélectionner un background</h3>
        
        <div className="mb-4">
          <button
            onClick={() => onSelect(null)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-left"
          >
            <span className="text-gray-600">Aucun background</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {backgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => onSelect(bg.id)}
              className={`relative group overflow-hidden rounded-lg border-2 transition-all ${
                currentBackgroundId === bg.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <img
                src={bg.imageUrl}
                alt={bg.name}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100">
                  Sélectionner
                </span>
              </div>
              <div className="p-2 bg-white">
                <p className="text-sm font-medium text-gray-800 truncate">{bg.name}</p>
              </div>
              {currentBackgroundId === bg.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {backgrounds.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun background disponible. Créez-en un dans la section Backgrounds.
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundSelector;
