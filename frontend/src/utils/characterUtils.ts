import type { Character, Mood } from '../types/index';

export const getCharacterName = (characters: Character[], characterId: string): string => {
  const character = characters.find(c => c.id === characterId);
  return character?.name || 'Inconnu';
};

export const getCharacterColor = (characters: Character[], characterId: string): string => {
  const character = characters.find(c => c.id === characterId);
  return character?.color || '#3B82F6';
};

export const getMoodName = (moods: Mood[], moodId: string): string => {
  const mood = moods.find(m => m.id === moodId);
  return mood?.name || '';
};
