import { useState, useEffect } from 'react';
import type { Dialogue, Character, Background, Mood } from '../types/index';
import { dialogueService } from '../services/dialogueService';
import { characterService } from '../services/characterService';
import { backgroundService } from '../services/backgroundService';
import { moodService } from '../services/moodService';

export const useDialogueData = (dialogueId: string, projectId: string) => {
  const [currentDialogue, setCurrentDialogue] = useState<Dialogue | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [updatedDialogue, fetchedCharacters, fetchedBackgrounds, fetchedMoods] = await Promise.all([
        dialogueService.getDialogue(dialogueId),
        characterService.getCharactersByProject(projectId),
        backgroundService.getBackgroundsByProject(projectId),
        moodService.getMoods(projectId)
      ]);
      setCurrentDialogue(updatedDialogue);
      setCharacters(fetchedCharacters);
      setBackgrounds(fetchedBackgrounds);
      setMoods(fetchedMoods);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dialogueId, projectId]);

  return {
    currentDialogue,
    characters,
    backgrounds,
    moods,
    loading,
    error,
    reload: loadData,
    setError
  };
};
