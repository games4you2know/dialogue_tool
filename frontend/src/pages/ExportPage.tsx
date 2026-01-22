import React from 'react';

const ExportPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Unity</h1>
        <p className="text-gray-600">
          Exportez vos dialogues et conversations au format JSON compatible avec Unity
        </p>
      </div>

      {/* Export Options */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900">Export Dialogues</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Exportez tous les dialogues d'un projet au format JSON avec la structure des personnages, 
            choix et embranchements.
          </p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
            Exporter les Dialogues
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21l4-4 4 4M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900">Export SMS</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Exportez toutes les conversations SMS avec horodatage, participants et 
            métadonnées pour l'intégration Unity.
          </p>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
            Exporter les SMS
          </button>
        </div>
      </div>

      {/* Export Settings */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres d'Export</h3>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-gray-700">Inclure les métadonnées du projet</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-gray-700">Minifier le JSON</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-gray-700">Inclure les timestamps de création</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-gray-700">Exporter uniquement les éléments validés</span>
            </label>
          </div>
        </div>
      </div>

      {/* Export Preview */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu de la Structure JSON</h3>
        
        <div className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-800">
{`{
  "metadata": {
    "projectName": "Mon Projet",
    "exportDate": "2024-10-26T10:30:00Z",
    "version": "1.0.0"
  },
  "characters": [
    {
      "id": "char_001",
      "name": "Héros",
      "color": "#3B82F6",
      "avatar": "hero_avatar.png"
    }
  ],
  "dialogues": [
    {
      "id": "dialogue_001",
      "name": "Dialogue d'introduction",
      "lines": [
        {
          "id": "line_001",
          "characterId": "char_001",
          "text": "Bonjour !",
          "order": 1,
          "choices": []
        }
      ]
    }
  ]
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;