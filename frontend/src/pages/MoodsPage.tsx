import React from 'react';
import { useParams } from 'react-router-dom';
import { MoodManager } from '../components/MoodManager';

export const MoodsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          Erreur: ID du projet manquant
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Gestion des Émotions
          </h1>
          <MoodManager projectId={projectId} />
        </div>
      </div>
    </div>
  );
};
