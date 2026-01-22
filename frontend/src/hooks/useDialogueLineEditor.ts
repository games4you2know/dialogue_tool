import { useState, useCallback } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import type { DialogueLine } from '../types/index';
import { dialogueService, type UpdateDialogueLineRequest } from '../services/dialogueService';

export const useDialogueLineEditor = (
  selectedLine: DialogueLine | null,
  onUpdate: () => void
) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Écrivez le texte du dialogue...',
      }),
      CharacterCount.configure({
        limit: 1000,
      }),
    ],
    content: selectedLine?.text || '',
    onUpdate: ({ editor }) => {
      if (selectedLine && !isUpdating) {
        const newText = editor.getHTML();
        handleUpdateLineText(selectedLine.id, newText);
      }
    },
  });

  const handleUpdateLineText = useCallback(
    async (lineId: string, newText: string) => {
      const line = selectedLine;
      if (!line) return;

      setIsUpdating(true);
      try {
        const updateData: UpdateDialogueLineRequest = {
          characterId: line.characterId,
          text: newText,
          order: line.order
        };

        await dialogueService.updateDialogueLine(lineId, updateData);
        onUpdate();
      } catch (err) {
        console.error('Erreur lors de la mise à jour de la ligne:', err);
      } finally {
        setIsUpdating(false);
      }
    },
    [selectedLine, onUpdate]
  );

  return { editor, isUpdating };
};
