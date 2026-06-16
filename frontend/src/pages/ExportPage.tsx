import React from 'react';
import { useNavigate } from 'react-router-dom';

const ExportPage: React.FC = () => {
  const navigate = useNavigate();

  const files = [
    {
      name: 'Narration.json',
      color: 'blue',
      iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      description: 'Tous les dialogues du projet avec leurs lignes, le staging des personnages (humeur, position, caméra) et les tags de background.',
      keys: ['dialogues', 'tag', 'backgroundTag', 'lines', 'characterTag', 'mainCharacterStaging', 'secondaryCharacterStaging', 'triggerCameraShake', 'memory'],
    },
    {
      name: 'Journal.json',
      color: 'amber',
      iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      description: 'Toutes les entrées du journal du joueur avec leur identifiant, contexte, émotion, contenu et informations complémentaires.',
      keys: ['ID', 'Context', 'Emotion', 'Content', 'Info'],
    },
    {
      name: 'PhoneData.json',
      color: 'green',
      iconPath: 'M12 18h.01M8 21l4-4 4 4M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z',
      description: 'Toutes les données de l\'interface téléphone : conversations SMS (avec streams et quiz), appels, transactions bancaires et posts de réseaux sociaux.',
      keys: ['smsConversations', 'calls', 'bankTransactions', 'socialPosts'],
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
    blue:  { bg: 'border-blue-200 bg-blue-50',  icon: 'text-blue-600',  badge: 'bg-blue-100 text-blue-700' },
    amber: { bg: 'border-amber-200 bg-amber-50', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
    green: { bg: 'border-green-200 bg-green-50', icon: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Unity</h1>
        <p className="text-gray-600">
          L'export génère 3 fichiers JSON distincts, prêts à être intégrés dans Unity.
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        {files.map((file) => {
          const colors = colorMap[file.color];
          return (
            <div
              key={file.name}
              className={`rounded-xl border-2 ${colors.bg} p-6`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 p-2 rounded-lg bg-white shadow-sm`}>
                  <svg className={`w-7 h-7 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={file.iconPath} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{file.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{file.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {file.keys.map((key) => (
                      <span key={key} className={`text-xs font-mono font-medium px-2 py-0.5 rounded ${colors.badge}`}>
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-semibold text-gray-800">Comment exporter ?</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          L'export se déclenche depuis la page d'un projet. Ouvrez votre projet et cliquez sur le bouton <strong>Exporter JSON</strong> — les 3 fichiers seront téléchargés automatiquement.
        </p>
        <button
          onClick={() => navigate('/projects')}
          className="bg-gray-900 hover:bg-gray-700 text-white py-2 px-5 rounded-lg font-medium text-sm transition-colors"
        >
          Aller aux projets
        </button>
      </div>
    </div>
  );
};

export default ExportPage;
