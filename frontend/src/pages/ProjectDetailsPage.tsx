import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Project, Dialogue } from '../types/index';
import { projectService } from '../services/projectService';
import CharacterManager from '../components/CharacterManager';
import DialogueManager from '../components/DialogueManager';
import SMSManager from '../components/SMSManager';
import DialogueEditor from '../components/DialogueEditor';
import BackgroundManager from '../components/BackgroundManager';
import MoodManager from '../components/MoodManager';

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'characters' | 'backgrounds' | 'moods' | 'dialogues' | 'sms' | 'calls'>('characters');
  const [editingDialogue, setEditingDialogue] = useState<Dialogue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProject = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const fetchedProject = await projectService.getById(projectId);
      setProject(fetchedProject);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement du projet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const handleEditDialogue = (dialogue: Dialogue) => {
    setEditingDialogue(dialogue);
  };

  const handleCloseDialogueEditor = () => {
    setEditingDialogue(null);
  };

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        ID de projet manquant
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement du projet...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        {error}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        Projet introuvable
      </div>
    );
  }

  if (editingDialogue) {
    return (
      <DialogueEditor
        dialogue={editingDialogue}
        projectId={projectId}
        onClose={handleCloseDialogueEditor}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header du projet */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 mt-1">{project.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.href = `/projects/${projectId}/members`}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Gérer les membres
            </button>
            <button
              onClick={() => projectService.exportProject(projectId)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Exporter JSON
            </button>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('characters')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'characters'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Personnages
          </button>
          <button
            onClick={() => setActiveTab('backgrounds')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'backgrounds'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Backgrounds
          </button>
          <button
            onClick={() => setActiveTab('moods')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'moods'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Émotions
          </button>
          <button
            onClick={() => setActiveTab('dialogues')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'dialogues'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dialogues
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'sms'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            SMS
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'calls'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Calls
          </button>
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'characters' && (
          <CharacterManager projectId={projectId} />
        )}
        {activeTab === 'backgrounds' && (
          <BackgroundManager projectId={projectId} />
        )}
        {activeTab === 'moods' && (
          <MoodManager projectId={projectId} />
        )}
        {activeTab === 'dialogues' && (
          <DialogueManager 
            projectId={projectId}
            onEditDialogue={handleEditDialogue}
          />
        )}
        {activeTab === 'sms' && (
          <SMSManager projectId={projectId} />
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsPage;