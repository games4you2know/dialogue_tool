import React from 'react';

const SMSPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages SMS</h1>
          <p className="text-gray-600 mt-2">
            Créez des conversations SMS réalistes pour vos jeux
          </p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle Conversation
        </button>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21l4-4 4 4M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Éditeur de Messages SMS</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Simulez des conversations SMS authentiques avec horodatage, 
            statuts de lecture et gestion des groupes.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Fonctionnalités prévues :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Interface style smartphone</li>
                <li>• Bulles de messages réalistes</li>
                <li>• Horodatage des messages</li>
                <li>• Statuts de lecture</li>
                <li>• Support emoji et images</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Types de conversation :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Conversations privées</li>
                <li>• Chats de groupe</li>
                <li>• Messages automatiques</li>
                <li>• Réponses préprogrammées</li>
                <li>• Export pour Unity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSPage;