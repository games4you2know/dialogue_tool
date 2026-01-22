import React, { useState, useEffect } from 'react';
import type { Dialogue, DialogueLine } from '../types/index';
import { dialogueService, type CreateDialogueLineRequest, type UpdateDialogueLineRequest, type CreateDialogueChoiceRequest } from '../services/dialogueService';
import { moodService } from '../services/moodService';
import { useDialogueData } from '../hooks/useDialogueData';
import { useDialogueLineEditor } from '../hooks/useDialogueLineEditor';
import DialogueHeader from './dialogue/DialogueHeader';
import DialogueLinesList from './dialogue/DialogueLinesList';
import LineEditorPanel from './dialogue/LineEditorPanel';
import AddLineForm from './dialogue/AddLineForm';
import AddChoiceForm from './dialogue/AddChoiceForm';
import BackgroundSelector from './dialogue/BackgroundSelector';
import '../styles/dialogueEditor.css';

interface DialogueEditorProps {
  dialogue: Dialogue;
  projectId: string;
  onClose: () => void;
}

interface LineFormData {
  characterId: string;
  text: string;
  order: number;
  displayMode: 'one' | 'two';
  displayedCharacterId: string;
  leftCharacterId: string;
  rightCharacterId: string;
  displayedMoodId: string;
  leftMoodId: string;
  rightMoodId: string;
}

const DialogueEditor: React.FC<DialogueEditorProps> = ({ dialogue, projectId, onClose }) => {
  const { currentDialogue, characters, backgrounds, moods, loading, error, reload, setError } = useDialogueData(dialogue.id, projectId);
  const [selectedLine, setSelectedLine] = useState<DialogueLine | null>(null);
  const [showAddLineForm, setShowAddLineForm] = useState(false);
  const [showAddChoiceForm, setShowAddChoiceForm] = useState(false);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [editingDisplaySettings, setEditingDisplaySettings] = useState(false);
  const [lineFormData, setLineFormData] = useState<LineFormData>({
    characterId: '',
    text: '',
    order: 0,
    displayMode: 'one',
    displayedCharacterId: '',
    leftCharacterId: '',
    rightCharacterId: '',
    displayedMoodId: '',
    leftMoodId: '',
    rightMoodId: ''
  });
  const [choiceText, setChoiceText] = useState('');
  const [displaySettings, setDisplaySettings] = useState<{
    displayMode: 'one' | 'two';
    displayedCharacterId: string;
    leftCharacterId: string;
    rightCharacterId: string;
    displayedMoodId: string;
    leftMoodId: string;
    rightMoodId: string;
  }>({
    displayMode: 'one',
    displayedCharacterId: '',
    leftCharacterId: '',
    rightCharacterId: '',
    displayedMoodId: '',
    leftMoodId: '',
    rightMoodId: ''
  });

  const { editor } = useDialogueLineEditor(selectedLine, reload);

  useEffect(() => {
    if (editor && selectedLine) {
      editor.commands.setContent(selectedLine.text || '');
    }
  }, [selectedLine, editor]);

  const handleAddLine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDialogue) return;
    
    try {
      const newLine: CreateDialogueLineRequest = {
        characterId: lineFormData.characterId || undefined,
        text: lineFormData.text,
        order: currentDialogue.lines?.length || 0,
        displayedCharacterId: lineFormData.displayMode === 'one' ? (lineFormData.displayedCharacterId || lineFormData.characterId || undefined) : undefined,
        leftCharacterId: lineFormData.displayMode === 'two' ? (lineFormData.leftCharacterId || undefined) : undefined,
        rightCharacterId: lineFormData.displayMode === 'two' ? (lineFormData.rightCharacterId || undefined) : undefined,
        displayedMoodId: lineFormData.displayMode === 'one' ? (lineFormData.displayedMoodId || undefined) : undefined,
        leftMoodId: lineFormData.displayMode === 'two' ? (lineFormData.leftMoodId || undefined) : undefined,
        rightMoodId: lineFormData.displayMode === 'two' ? (lineFormData.rightMoodId || undefined) : undefined
      };

      await dialogueService.addDialogueLine(currentDialogue.id, newLine);
      await reload();
      setLineFormData({ characterId: '', text: '', order: 0, displayMode: 'one', displayedCharacterId: '', leftCharacterId: '', rightCharacterId: '', displayedMoodId: '', leftMoodId: '', rightMoodId: '' });
      setShowAddLineForm(false);
    } catch (err) {
      setError('Erreur lors de l\'ajout de la ligne');
      console.error(err);
    }
  };

  const handleDeleteLine = async (lineId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ligne ?')) return;

    try {
      await dialogueService.deleteDialogueLine(lineId);
      await reload();
      if (selectedLine?.id === lineId) {
        setSelectedLine(null);
      }
    } catch (err) {
      setError('Erreur lors de la suppression de la ligne');
      console.error(err);
    }
  };

  const handleAddChoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLine) return;

    try {
      const newChoice: CreateDialogueChoiceRequest = {
        text: choiceText
      };

      await dialogueService.addDialogueChoice(selectedLine.id, newChoice);
      await reload();
      setChoiceText('');
      setShowAddChoiceForm(false);
    } catch (err) {
      setError('Erreur lors de l\'ajout du choix');
      console.error(err);
    }
  };

  const handleDeleteChoice = async (choiceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce choix ?')) return;

    try {
      await dialogueService.deleteDialogueChoice(choiceId);
      await reload();
    } catch (err) {
      setError('Erreur lors de la suppression du choix');
      console.error(err);
    }
  };

  const handleCreateMood = async (name: string) => {
    try {
      await moodService.createMood(projectId, name);
      await reload();
    } catch (err) {
      setError('Erreur lors de la création de l\'émotion');
      console.error(err);
    }
  };

  const handleUpdateBackground = async (backgroundId: string | null) => {
    if (!currentDialogue) return;
    
    try {
      await dialogueService.updateDialogue(currentDialogue.id, {
        name: currentDialogue.name,
        description: currentDialogue.description,
        isStartDialogue: currentDialogue.isStartDialogue,
        backgroundId: backgroundId || undefined
      });
      await reload();
      setShowBackgroundSelector(false);
    } catch (err) {
      setError('Erreur lors de la mise à jour du background');
      console.error(err);
    }
  };

  const handleUpdateDisplaySettings = async () => {
    if (!selectedLine) return;
    
    try {
      const updateData: UpdateDialogueLineRequest = {
        characterId: selectedLine.characterId,
        text: selectedLine.text,
        order: selectedLine.order,
        displayedCharacterId: displaySettings.displayMode === 'one' ? (displaySettings.displayedCharacterId || undefined) : undefined,
        leftCharacterId: displaySettings.displayMode === 'two' ? (displaySettings.leftCharacterId || undefined) : undefined,
        rightCharacterId: displaySettings.displayMode === 'two' ? (displaySettings.rightCharacterId || undefined) : undefined,
        displayedMoodId: displaySettings.displayMode === 'one' ? (displaySettings.displayedMoodId || undefined) : undefined,
        leftMoodId: displaySettings.displayMode === 'two' ? (displaySettings.leftMoodId || undefined) : undefined,
        rightMoodId: displaySettings.displayMode === 'two' ? (displaySettings.rightMoodId || undefined) : undefined
      };
      
      await dialogueService.updateDialogueLine(selectedLine.id, updateData);
      await reload();
      setEditingDisplaySettings(false);
    } catch (err) {
      setError('Erreur lors de la mise à jour des paramètres d\'affichage');
      console.error(err);
    }
  };

  const startEditingDisplaySettings = () => {
    if (!selectedLine) return;
    
    const hasTwo = selectedLine.leftCharacterId || selectedLine.rightCharacterId;
    setDisplaySettings({
      displayMode: hasTwo ? 'two' : 'one',
      displayedCharacterId: selectedLine.displayedCharacterId || selectedLine.characterId || '',
      leftCharacterId: selectedLine.leftCharacterId || '',
      rightCharacterId: selectedLine.rightCharacterId || '',
      displayedMoodId: selectedLine.displayedMoodId || '',
      leftMoodId: selectedLine.leftMoodId || '',
      rightMoodId: selectedLine.rightMoodId || ''
    });
    setEditingDisplaySettings(true);
  };

  if (loading || !currentDialogue) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement de l'éditeur...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <DialogueHeader
          dialogue={currentDialogue}
          onAddLine={() => setShowAddLineForm(true)}
          onClose={onClose}
        />

        {/* Background Section */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Background :</span>
          {currentDialogue.background ? (
            <div className="flex items-center gap-2">
              <div className="relative group">
                <img
                  src={currentDialogue.background.imageUrl}
                  alt={currentDialogue.background.name}
                  className="w-20 h-12 object-cover rounded border border-gray-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded flex items-center justify-center">
                  <span className="text-white text-xs opacity-0 group-hover:opacity-100">Aperçu</span>
                </div>
              </div>
              <span className="text-sm text-gray-600">{currentDialogue.background.name}</span>
              <button
                onClick={() => setShowBackgroundSelector(true)}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Changer
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowBackgroundSelector(true)}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Sélectionner un background
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
          {error}
        </div>
      )}

      <div className="flex-1 flex">
        <DialogueLinesList
          lines={currentDialogue.lines || []}
          characters={characters}
          selectedLine={selectedLine}
          onSelectLine={setSelectedLine}
          onDeleteLine={handleDeleteLine}
        />

        {/* Main editor */}
        <div className="flex-1 flex flex-col">
          {selectedLine ? (
            <LineEditorPanel
              line={selectedLine}
              characters={characters}
              moods={moods}
              editor={editor}
              editingDisplaySettings={editingDisplaySettings}
              displaySettings={displaySettings}
              onStartEditDisplaySettings={startEditingDisplaySettings}
              onSaveDisplaySettings={handleUpdateDisplaySettings}
              onCancelDisplaySettings={() => setEditingDisplaySettings(false)}
              onUpdateDisplaySettings={setDisplaySettings}
              onAddChoice={() => setShowAddChoiceForm(true)}
              onDeleteChoice={handleDeleteChoice}
              onCreateMood={handleCreateMood}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Sélectionnez une ligne de dialogue pour l'éditer
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout de ligne */}
      {showAddLineForm && (
        <AddLineForm
          characters={characters}
          moods={moods}
          formData={lineFormData}
          onUpdateFormData={setLineFormData}
          onSubmit={handleAddLine}
          onClose={() => setShowAddLineForm(false)}
          onCreateMood={handleCreateMood}
        />
      )}

      {/* Modal d'ajout de choix */}
      {showAddChoiceForm && (
        <AddChoiceForm
          choiceText={choiceText}
          onUpdateText={setChoiceText}
          onSubmit={handleAddChoice}
          onClose={() => setShowAddChoiceForm(false)}
        />
      )}

      {/* Modal de sélection de background */}
      {showBackgroundSelector && (
        <BackgroundSelector
          currentBackgroundId={currentDialogue.backgroundId || null}
          backgrounds={backgrounds}
          onSelect={handleUpdateBackground}
          onClose={() => setShowBackgroundSelector(false)}
        />
      )}
    </div>
  );
};

export default DialogueEditor;
