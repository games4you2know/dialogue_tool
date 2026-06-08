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
  projectId: string;
  name: string;
  tag: string;
  createdAt: Date;
  updatedAt: Date;
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
  tag: string;
  imageUrl: string;
}

export interface DialogueLine {
  id: string;
  characterId?: string;
  character?: Character;
  text: string;
  order: number;
  secondaryCharacterId?: string;
  mainCharacterMoodId?: string;
  mainCharacterPosition?: number; // 0=left, 1=middle, 2=right
  secondaryCharacterMoodId?: string;
  secondaryCharacterPosition?: number; // 0=left, 1=middle, 2=right
  triggerCameraShake?: boolean;
  memory?: string;
  choices?: DialogueChoice[];
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
  tag: string;
  description?: string;
  doFadeAtEnd: boolean;
  characters: Character[];
  lines: DialogueLine[];
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
  cpuResponse?: string;
}

export interface SMSQuestion {
  id: string;
  messageId: string;
  content: string;
  answers: SMSAnswer[];
  createdAt: Date;
}

export interface SMSMessage {
  id: string;
  characterId?: string;
  fromCpu: boolean;
  text: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'image' | 'emoji';
  attachmentUrl?: string;
  questions?: SMSQuestion[];
}

export interface SMSStreamEndpoint {
  id: string;
  conversationId: string;
  timestamp: Date;
}

export interface SMSConversation {
  id: string;
  projectId: string;
  folderId?: string;
  npcCharacterId?: string;
  npcCharacter?: Character;
  participants: { id: string; character: Character }[];
  messages: SMSMessage[];
  streamEndpoints: SMSStreamEndpoint[];
  isGroupChat: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Call {
  id: string;
  projectId: string;
  characterId?: string;
  character?: Character;
  callDate: Date;
  duration: number;
  status: number; // 0=missed, 1=incoming, 2=outgoing
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntry {
  id: string;
  projectId: string;
  entryId: string;
  context: string;
  emotion: number; // 1=heureux, 2=en colère, 3=triste
  content: string;
  info: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialPost {
  id: string;
  projectId: string;
  content: string;
  reportReason?: number | null; // null=aucun, 0=menaces, 1=injure, 2=atteinte à la vie privée
  createdAt: Date;
  updatedAt: Date;
}

export interface BankTransaction {
  id: string;
  projectId: string;
  type: number;        // 0=dépense, 1=recette
  name: string;
  paymentType: number; // 0=carte, 1=virement, 2=prélèvement
  amount: number;
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