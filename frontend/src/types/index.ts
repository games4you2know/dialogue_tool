// Types de base pour l'application Game Dialog Editor

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  dialogues: Dialogue[];
  smsConversations: SMSConversation[];
  folders?: Folder[];
}

export interface Folder {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  type: 'dialogue' | 'sms';
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  children?: Folder[];
  parent?: Folder;
  _count?: {
    dialogues: number;
    smsConversations: number;
    children: number;
  };
}

export interface Mood {
  id: string;
  name: string;
  characterId: string;
}

export interface Character {
  id: string;
  name: string;
  tag: string;
  color?: string;
  moods?: Mood[];
}

export interface Background {
  id: string;
  projectId: string;
  name: string;
  imageUrl: string;
}

export interface DialogueLine {
  id: string;
  characterId: string;
  text: string;
  order: number;
  displayedCharacterId?: string; // Pour un seul personnage affiché (optionnel, par défaut celui qui parle)
  leftCharacterId?: string; // Pour deux personnages : celui de gauche
  rightCharacterId?: string; // Pour deux personnages : celui de droite
  displayedMoodId?: string; // Mood pour le personnage affiché (mode un personnage)
  leftMoodId?: string; // Mood pour le personnage de gauche (mode deux personnages)
  rightMoodId?: string; // Mood pour le personnage de droite (mode deux personnages)
  choices?: DialogueChoice[];
  conditions?: string[];
  actions?: string[];
}

export interface DialogueChoice {
  id: string;
  text: string;
  nextDialogueId?: string;
  nextLineId?: string;
  conditions?: string[];
  actions?: string[];
}

export interface Dialogue {
  id: string;
  projectId: string;
  folderId?: string;
  backgroundId?: string;
  background?: Background;
  name: string;
  description?: string;
  characters: Character[];
  lines: DialogueLine[];
  isStartDialogue?: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SMSAnswer {
  id: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
  order: number;
}

export interface SMSReactions {
  positive: string[];
  negative: string[];
}

export interface SMSQuestion {
  id: string;
  messageId: string;
  content: string;
  answers: SMSAnswer[];
  reactions: SMSReactions;
  createdAt: Date;
}

export interface SMSMessage {
  id: string;
  characterId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'image' | 'emoji';
  attachmentUrl?: string;
  questions?: SMSQuestion[];
}

export interface SMSConversation {
  id: string;
  projectId: string;
  folderId?: string;
  name: string;
  participants: Character[];
  messages: SMSMessage[];
  isGroupChat: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnityDialogueExport {
  dialogues: Dialogue[];
  characters: Character[];
  metadata: {
    projectName: string;
    exportDate: Date;
    version: string;
  };
}

export interface UnitySMSExport {
  conversations: SMSConversation[];
  characters: Character[];
  metadata: {
    projectName: string;
    exportDate: Date;
    version: string;
  };
}

export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
}

export type EditorMode = 'dialogue' | 'sms';

export interface EditorState {
  mode: EditorMode;
  activeProjectId?: string;
  activeDialogueId?: string;
  activeSMSConversationId?: string;
  isPreviewMode: boolean;
}