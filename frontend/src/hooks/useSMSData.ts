import { useState, useEffect } from 'react';
import type { SMSConversation, Character } from '../types/index';
import { smsService } from '../services/smsService';
import { characterService } from '../services/characterService';
import { folderService } from '../services/folderService';

export const useSMSData = (projectId: string) => {
  const [conversations, setConversations] = useState<SMSConversation[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedConversations, fetchedCharacters, fetchedFolders] = await Promise.all([
        smsService.getSMSConversationsByProject(projectId),
        characterService.getCharactersByProject(projectId),
        folderService.getFoldersByProject(projectId, 'sms')
      ]);
      setConversations(fetchedConversations);
      setCharacters(fetchedCharacters);
      setFolders(fetchedFolders);
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
  }, [projectId]);

  return {
    conversations,
    characters,
    folders,
    loading,
    error,
    reload: loadData,
    setError
  };
};
