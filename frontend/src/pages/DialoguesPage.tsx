import React from 'react';

const DialoguesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Éditeur de Dialogues</h1>
          <p className="text-gray-600 mt-2">
            Créez et gérez les dialogues de vos personnages
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Dialogue
        </button>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Éditeur de Dialogues</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Cette section permettra de créer des dialogues interactifs avec des embranchements, 
            des choix multiples et des conditions.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Fonctionnalités prévues :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Création de personnages</li>
                <li>• Éditeur de dialogues avec TipTap</li>
                <li>• Système de choix multiples</li>
                <li>• Conditions et actions</li>
                <li>• Prévisualisation temps réel</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Structure :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Dialogues arborescents</li>
                <li>• Liens entre dialogues</li>
                <li>• Tags et catégories</li>
                <li>• Export JSON Unity</li>
                <li>• Collaboration temps réel</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialoguesPage;