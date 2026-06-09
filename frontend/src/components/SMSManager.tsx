import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import { fr } from 'date-fns/locale/fr';
import { format } from 'date-fns';
import type { SMSConversation, Character, SMSMessage, SMSQuestion, SMSStreamEndpoint } from '../types/index';
import { smsService, type CreateSMSConversationRequest, type UpdateSMSConversationRequest, type CreateSMSMessageRequest } from '../services/smsService';
import { characterService } from '../services/characterService';
import { folderService } from '../services/folderService';
import FolderManager from './FolderManager';
import QuizQuestionEditor from './QuizQuestionEditor';
import '../styles/dialogueEditor.css';
import '../styles/datepicker.css';

registerLocale('fr', fr);

interface SMSManagerProps {
  projectId: string;
}

interface ConversationFormData {
  folderId: string;
  npcCharacterId: string;
}

interface MessageFormData {
  fromCpu: boolean;
  text: string;
  shortContent: string;
  timestamp: Date;
  isQuestion: boolean;
  answers: {
    content: string;
    shortContent: string;
    isCorrect: boolean;
    cpuResponse: string;
  }[];
}

interface EndpointFormData {
  timestamp: Date;
}

const SMSManager: React.FC<SMSManagerProps> = ({ projectId }) => {
  const [conversations, setConversations] = useState<SMSConversation[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<SMSConversation | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showFolderSidebar, setShowFolderSidebar] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConversationForm, setShowConversationForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [editingConversation, setEditingConversation] = useState<SMSConversation | null>(null);
  const [editingMessage, setEditingMessage] = useState<SMSMessage | null>(null);
  const [showMoveMenu, setShowMoveMenu] = useState<string | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [conversationFormData, setConversationFormData] = useState<ConversationFormData>({
    folderId: '', npcCharacterId: ''
  });
  const [messageFormData, setMessageFormData] = useState<MessageFormData>({
    fromCpu: false,
    text: '',
    shortContent: '',
    timestamp: new Date(),
    isQuestion: false,
    answers: [],
  });
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [editingQuestionMessageId, setEditingQuestionMessageId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<SMSQuestion | null>(null);
  const [showEndpointForm, setShowEndpointForm] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<SMSStreamEndpoint | null>(null);
  const [endpointFormData, setEndpointFormData] = useState<EndpointFormData>({ timestamp: new Date() });

  const messageEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Tapez votre message...' }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setMessageFormData(prev => ({ ...prev, text: html }));
    },
  });

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

  useEffect(() => { loadData(); }, [projectId]);

  const resetConversationForm = () => {
    setConversationFormData({ folderId: selectedFolderId || '', npcCharacterId: '' });
    setEditingConversation(null);
    setShowConversationForm(false);
  };

  const resetMessageForm = () => {
    setMessageFormData({
      fromCpu: false, text: '', shortContent: '', timestamp: new Date(),
      isQuestion: false, answers: []
    });
    messageEditor?.commands.setContent('');
    setEditingMessage(null);
    setShowMessageForm(false);
  };

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: CreateSMSConversationRequest = {
        projectId,
        folderId: conversationFormData.folderId || undefined,
        npcCharacterId: conversationFormData.npcCharacterId || undefined
      };
      await smsService.createSMSConversation(data);
      await loadData();
      resetConversationForm();
    } catch (err) {
      setError('Erreur lors de la création de la conversation');
    }
  };

  const handleUpdateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConversation) return;
    try {
      const data: UpdateSMSConversationRequest = {
        npcCharacterId: conversationFormData.npcCharacterId || null
      };
      await smsService.updateSMSConversation(editingConversation.id, data);
      await loadData();
      resetConversationForm();
    } catch (err) {
      setError('Erreur lors de la modification de la conversation');
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) return;
    try {
      await smsService.deleteSMSConversation(conversationId);
      await loadData();
      if (selectedConversation?.id === conversationId) setSelectedConversation(null);
    } catch (err) {
      setError('Erreur lors de la suppression de la conversation');
    }
  };

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation) return;
    try {
      if (editingMessage) {
        await smsService.updateSMSMessage(editingMessage.id, {
          fromCpu: messageFormData.fromCpu,
          text: messageFormData.text,
          shortContent: (!messageFormData.fromCpu && messageFormData.shortContent.trim()) ? messageFormData.shortContent.trim() : undefined,
          timestamp: messageFormData.timestamp
        });
      } else {
        const newMessage: CreateSMSMessageRequest = {
          fromCpu: messageFormData.fromCpu,
          text: messageFormData.text,
          shortContent: (!messageFormData.fromCpu && messageFormData.shortContent.trim()) ? messageFormData.shortContent.trim() : undefined,
          timestamp: messageFormData.timestamp
        };
        const createdMessage = await smsService.addSMSMessage(selectedConversation.id, newMessage);

        if (messageFormData.isQuestion) {
          await smsService.addSMSQuestion(createdMessage.id, {
            content: messageFormData.text,
            answers: messageFormData.answers
              .filter(a => a.content.trim())
              .map((a, i) => ({
                content: a.content,
                shortContent: a.shortContent.trim() || undefined,
                isCorrect: a.isCorrect,
                order: i,
                cpuResponse: a.cpuResponse.trim() || undefined
              }))
          });
        }
      }
      const updated = await smsService.getSMSConversation(selectedConversation.id);
      setSelectedConversation(updated);
      resetMessageForm();
    } catch (err) {
      setError("Erreur lors de l'ajout du message");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;
    if (!selectedConversation) return;
    try {
      await smsService.deleteSMSMessage(messageId);
      const updated = await smsService.getSMSConversation(selectedConversation.id);
      setSelectedConversation(updated);
    } catch (err) {
      setError('Erreur lors de la suppression du message');
    }
  };

  const resetEndpointForm = () => {
    setEndpointFormData({ timestamp: new Date() });
    setEditingEndpoint(null);
    setShowEndpointForm(false);
  };

  const openAddEndpointForm = (timestamp: Date) => {
    setEditingEndpoint(null);
    setEndpointFormData({ timestamp });
    setShowEndpointForm(true);
  };

  const handleCreateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation) return;
    try {
      await smsService.createStreamEndpoint(selectedConversation.id, endpointFormData.timestamp);
      const updated = await smsService.getSMSConversation(selectedConversation.id);
      setSelectedConversation(updated);
      resetEndpointForm();
    } catch (err) {
      setError("Erreur lors de la création de l'endpoint");
    }
  };

  const handleUpdateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEndpoint || !selectedConversation) return;
    try {
      await smsService.updateStreamEndpoint(editingEndpoint.id, { timestamp: endpointFormData.timestamp });
      const updated = await smsService.getSMSConversation(selectedConversation.id);
      setSelectedConversation(updated);
      resetEndpointForm();
    } catch (err) {
      setError("Erreur lors de la modification de l'endpoint");
    }
  };

  const handleDeleteEndpoint = async (endpointId: string) => {
    if (!confirm('Supprimer cet endpoint de stream ?')) return;
    if (!selectedConversation) return;
    try {
      await smsService.deleteStreamEndpoint(endpointId);
      const updated = await smsService.getSMSConversation(selectedConversation.id);
      setSelectedConversation(updated);
    } catch (err) {
      setError("Erreur lors de la suppression de l'endpoint");
    }
  };

  const startEditConversation = (conversation: SMSConversation) => {
    setEditingConversation(conversation);
    setConversationFormData({
      folderId: conversation.folderId || '',
      npcCharacterId: conversation.npcCharacterId || ''
    });
    setShowConversationForm(true);
  };

  const filteredConversations = selectedFolderId === null
    ? conversations
    : conversations.filter(c => c.folderId === selectedFolderId);

  const handleMoveConversation = async (conversationId: string, folderId: string | null) => {
    try {
      await folderService.moveSMS(conversationId, folderId);
      await loadData();
      setShowMoveMenu(null);
    } catch (err) {
      setError('Erreur lors du déplacement de la conversation');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Chargement des conversations SMS...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {showFolderSidebar && (
        <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
          <FolderManager
            projectId={projectId}
            type="sms"
            onFolderSelect={setSelectedFolderId}
            selectedFolderId={selectedFolderId}
          />
        </div>
      )}

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFolderSidebar(!showFolderSidebar)}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {showFolderSidebar ? '◀' : '▶'} Dossiers
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Conversations SMS</h2>
          </div>
          <button
            onClick={() => setShowConversationForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nouvelle conversation
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          {filteredConversations.map((conversation) => (
            <div key={conversation.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {conversation.npcCharacter?.name || <span className="text-gray-400 italic">Aucun personnage</span>}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>{conversation.messages?.length || 0} message(s)</span>
                    {conversation.streamEndpoints?.length > 0 && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-medium">
                        {conversation.streamEndpoints.length} endpoint(s)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 relative">
                  <button onClick={() => setSelectedConversation(conversation)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors">
                    Voir messages
                  </button>
                  <button onClick={() => startEditConversation(conversation)} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors">
                    Modifier
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowMoveMenu(showMoveMenu === conversation.id ? null : conversation.id)} className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm hover:bg-purple-200 transition-colors">
                      Déplacer
                    </button>
                    {showMoveMenu === conversation.id && (
                      <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        <div className="p-2">
                          <button onClick={() => handleMoveConversation(conversation.id, null)} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm">
                            Racine (aucun dossier)
                          </button>
                          {folders.map(folder => (
                            <button key={folder.id} onClick={() => handleMoveConversation(conversation.id, folder.id)} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm">
                              {folder.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleDeleteConversation(conversation.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors">
                    Supprimer
                  </button>
                </div>
              </div>

              {conversation.messages && conversation.messages.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                  {conversation.messages.slice(0, 3).map((message) => (
                    <div key={message.id} className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${message.fromCpu ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                        {message.fromCpu ? 'CPU' : 'Joueur'}
                      </span>
                      {message.text ? (
                        <div className="text-sm text-gray-600 truncate" dangerouslySetInnerHTML={{ __html: message.text }} />
                      ) : message.questions && message.questions.length > 0 ? (
                        <span className="text-sm text-gray-500 italic">❓ {message.questions[0].content}</span>
                      ) : null}
                    </div>
                  ))}
                  {conversation.messages.length > 3 && (
                    <div className="text-sm text-gray-400">... et {conversation.messages.length - 3} message(s) de plus</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredConversations.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            {selectedFolderId ? 'Aucune conversation SMS dans ce dossier.' : 'Aucune conversation SMS créée.'}
          </div>
        )}
      </div>

      {/* Modal formulaire conversation */}
      {showConversationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingConversation ? 'Modifier la conversation' : 'Nouvelle conversation SMS'}
            </h3>
            <form onSubmit={editingConversation ? handleUpdateConversation : handleCreateConversation}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Personnage NPC *</label>
                <select
                  value={conversationFormData.npcCharacterId}
                  onChange={(e) => setConversationFormData({ ...conversationFormData, npcCharacterId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un personnage</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={resetConversationForm} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Annuler
                </button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  {editingConversation ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal visualisation des messages */}
      {selectedConversation && !showMessageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold">
                  {selectedConversation.npcCharacter?.name || 'Conversation SMS'}
                </h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowMessageForm(true)} className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  + Ajouter un message
                </button>
                <button onClick={() => setSelectedConversation(null)} className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Fermer
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
              {(() => {
                const timeline = [
                  ...(selectedConversation.messages || []).map(m => ({ ...m, _kind: 'message' as const })),
                  ...(selectedConversation.streamEndpoints || []).map(e => ({ ...e, _kind: 'endpoint' as const }))
                ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                if (timeline.length === 0) {
                  return <div className="text-center py-8 text-gray-500">Aucun message dans cette conversation</div>;
                }

                const AddEndpointButton = ({ afterTimestamp, beforeTimestamp }: { afterTimestamp?: Date; beforeTimestamp?: Date }) => {
                  const ts = afterTimestamp && beforeTimestamp
                    ? new Date((new Date(afterTimestamp).getTime() + new Date(beforeTimestamp).getTime()) / 2)
                    : afterTimestamp
                      ? new Date(new Date(afterTimestamp).getTime() + 1000)
                      : new Date();
                  return (
                    <div className="flex items-center justify-center my-1 opacity-0 hover:opacity-100 transition-opacity group">
                      <button
                        onClick={() => openAddEndpointForm(ts)}
                        className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors"
                      >
                        + Endpoint ici
                      </button>
                    </div>
                  );
                };

                return (
                  <div className="space-y-1">
                    {timeline.map((item, idx) => {
                      const prevItem = idx > 0 ? timeline[idx - 1] : undefined;
                      const nextItem = idx < timeline.length - 1 ? timeline[idx + 1] : undefined;

                      if (item._kind === 'endpoint') {
                        return (
                          <div key={`ep-${item.id}`}>
                            <AddEndpointButton afterTimestamp={prevItem ? new Date(prevItem.timestamp) : undefined} beforeTimestamp={new Date(item.timestamp)} />
                            <div className="flex items-center gap-2 my-2">
                              <div className="flex-1 h-px bg-orange-300" />
                            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
                              <span className="text-xs text-orange-600">— limite de stream —</span>
                              <button
                                onClick={() => {
                                  setEditingEndpoint(item as unknown as SMSStreamEndpoint);
                                  setEndpointFormData({ timestamp: new Date(item.timestamp) });
                                  setShowEndpointForm(true);
                                }}
                                className="text-orange-500 hover:text-orange-700 text-xs"
                                title="Modifier la position"
                              >✏️</button>
                              <button
                                onClick={() => handleDeleteEndpoint(item.id)}
                                className="text-red-400 hover:text-red-600 text-xs"
                                title="Supprimer"
                              >🗑️</button>
                            </div>
                              <div className="flex-1 h-px bg-orange-300" />
                            </div>
                            {!nextItem && <AddEndpointButton afterTimestamp={new Date(item.timestamp)} />}
                          </div>
                        );
                      }

                      const message = item as typeof item & { fromCpu: boolean; text: string; questions?: any[] };
                      return (
                        <div key={`msg-${item.id}`}>
                          <AddEndpointButton afterTimestamp={prevItem ? new Date(prevItem.timestamp) : undefined} beforeTimestamp={new Date(item.timestamp)} />
                          <div className={`flex ${message.fromCpu ? 'justify-start' : 'justify-end'}`}>
                            <div className="max-w-[70%]">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${message.fromCpu ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {message.fromCpu ? (selectedConversation.npcCharacter?.name || 'CPU') : 'Joueur'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(message.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                </span>
                              </div>

                              <div className={`rounded-lg p-3 shadow-sm relative group ${message.fromCpu ? 'bg-white' : 'bg-blue-50'}`}>
                                {message.text && <div dangerouslySetInnerHTML={{ __html: message.text }} />}
                                {!message.fromCpu && (message as any).shortContent && (
                                  <div className="mt-1 text-xs text-gray-400 italic border-t border-gray-100 pt-1">
                                    Court : {(message as any).shortContent}
                                  </div>
                                )}
                                <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                                  <button
                                    onClick={() => {
                                      const msg = message as unknown as SMSMessage;
                                      setEditingMessage(msg);
                                        setMessageFormData({
                                          fromCpu: message.fromCpu,
                                          text: message.text || '',
                                          shortContent: msg.shortContent || '',
                                          timestamp: new Date(message.timestamp),
                                          isQuestion: false,
                                          answers: []
                                        });
                                      messageEditor?.commands.setContent(message.text || '');
                                      setShowMessageForm(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 bg-white shadow-sm px-2 py-1 rounded"
                                  >✏️</button>
                                  <button onClick={() => handleDeleteMessage(item.id)} className="text-red-600 hover:text-red-700 bg-white shadow-sm px-2 py-1 rounded">
                                    🗑️
                                  </button>
                                </div>
                              </div>

                              {message.questions && message.questions.length > 0 && (
                                <div className="space-y-2 mt-1">
                                  {message.questions.map((question: any) => (
                                    <div key={question.id} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-blue-500">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-gray-900 text-sm">Quiz</span>
                                        <div className="flex gap-1 ml-2">
                                          <button
                                            onClick={() => { setEditingQuestion(question); setEditingQuestionMessageId(item.id); setShowQuestionEditor(true); }}
                                            className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-sm"
                                          >✏️</button>
                                          <button
                                            onClick={async () => {
                                              if (confirm('Supprimer cette question ?')) {
                                                await smsService.deleteSMSQuestion(question.id);
                                                const updated = await smsService.getSMSConversation(selectedConversation.id);
                                                setSelectedConversation(updated);
                                              }
                                            }}
                                            className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-sm"
                                          >🗑️</button>
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        {question.answers.map((answer: any, idx: number) => (
                                          <div key={answer.id} className={`px-3 py-1.5 rounded text-sm ${answer.isCorrect ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-gray-50 border border-gray-200 text-gray-700'}`}>
                                            <div className="flex items-center gap-2">
                                              <span className={`font-medium flex-shrink-0 ${answer.isCorrect ? 'text-green-600' : 'text-gray-400'}`}>
                                                {answer.isCorrect ? '✓' : `${idx + 1}.`}
                                              </span>
                                              <span>{answer.content}</span>
                                            </div>
                                            {answer.shortContent && (
                                              <div className="mt-0.5 ml-5 text-xs text-blue-600 italic">
                                                Court : {answer.shortContent}
                                              </div>
                                            )}
                                            {answer.cpuResponse && (
                                              <div className="mt-1 ml-5 text-xs text-gray-500 italic border-l-2 border-gray-300 pl-2">
                                                CPU: {answer.cpuResponse}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          {idx === timeline.length - 1 && (
                            <AddEndpointButton afterTimestamp={new Date(item.timestamp)} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal formulaire message */}
      {showMessageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingMessage ? 'Modifier le message' : 'Ajouter un message'}</h3>

            <form onSubmit={handleAddMessage}>
              {/* fromCpu toggle */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Expéditeur</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMessageFormData({ ...messageFormData, fromCpu: false, isQuestion: false, answers: [] })}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${!messageFormData.fromCpu ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    Joueur
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageFormData({ ...messageFormData, fromCpu: true })}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${messageFormData.fromCpu ? 'border-gray-500 bg-gray-100 text-gray-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    {selectedConversation?.npcCharacter?.name || 'CPU'}
                  </button>
                </div>
              </div>

              {/* Timestamp */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date et heure *</label>
                <DatePicker
                  selected={messageFormData.timestamp}
                  onChange={(date) => setMessageFormData({ ...messageFormData, timestamp: date || new Date() })}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  locale="fr"
                  className="w-full"
                  required
                />
              </div>

              {/* Question toggle (only for new CPU messages) */}
              {!editingMessage && messageFormData.fromCpu && (
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={messageFormData.isQuestion}
                      onChange={(e) => setMessageFormData({ ...messageFormData, isQuestion: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Ce message est une question quiz</span>
                  </label>
                </div>
              )}

              {/* Text editor — always shown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {messageFormData.isQuestion ? 'Question *' : 'Message *'}
                </label>
                <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                  <div className="dialogue-editor-toolbar border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg">
                    <button type="button" onClick={() => messageEditor?.chain().focus().toggleBold().run()} className={`px-2 py-1 mx-1 rounded text-sm ${messageEditor?.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-white'}`}>G</button>
                    <button type="button" onClick={() => messageEditor?.chain().focus().toggleItalic().run()} className={`px-2 py-1 mx-1 rounded text-sm italic ${messageEditor?.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-white'}`}>I</button>
                    <button type="button" onClick={() => messageEditor?.chain().focus().toggleStrike().run()} className={`px-2 py-1 mx-1 rounded text-sm line-through ${messageEditor?.isActive('strike') ? 'bg-blue-500 text-white' : 'bg-white'}`}>S</button>
                  </div>
                  <EditorContent editor={messageEditor} className="dialogue-editor-content min-h-[100px] p-3" />
                </div>
              </div>

              {/* Short content (optional, player messages only) */}
              {!messageFormData.fromCpu && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Version courte (optionnel)</label>
                  <input
                    type="text"
                    value={messageFormData.shortContent}
                    onChange={(e) => setMessageFormData({ ...messageFormData, shortContent: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Version courte du message (optionnel)..."
                  />
                </div>
              )}

              {/* Quiz answers */}
              {!editingMessage && messageFormData.isQuestion && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Réponses *</label>
                    <button
                      type="button"
                      onClick={() => setMessageFormData({ ...messageFormData, answers: [...messageFormData.answers, { content: '', shortContent: '', isCorrect: false, cpuResponse: '' }] })}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <div className="space-y-3">
                    {messageFormData.answers.map((answer, index) => (
                      <div key={index} className={`rounded-lg border p-3 ${answer.isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex gap-2 items-start mb-2">
                          <div className="flex items-center mt-2">
                            <input
                              type="checkbox"
                              checked={answer.isCorrect}
                              onChange={(e) => {
                                const newAnswers = [...messageFormData.answers];
                                newAnswers[index] = { ...newAnswers[index], isCorrect: e.target.checked };
                                setMessageFormData({ ...messageFormData, answers: newAnswers });
                              }}
                              className="w-5 h-5"
                              title="Réponse correcte"
                            />
                          </div>
                          <input
                            type="text"
                            value={answer.content}
                            onChange={(e) => {
                              const newAnswers = [...messageFormData.answers];
                              newAnswers[index] = { ...newAnswers[index], content: e.target.value };
                              setMessageFormData({ ...messageFormData, answers: newAnswers });
                            }}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder={`Réponse ${index + 1}`}
                            required={messageFormData.isQuestion}
                          />
                          <button
                            type="button"
                            onClick={() => setMessageFormData({ ...messageFormData, answers: messageFormData.answers.filter((_, i) => i !== index) })}
                            className="text-red-600 hover:text-red-700 px-2 py-2"
                          >🗑️</button>
                        </div>
                        <div className="ml-7 space-y-2">
                          <input
                            type="text"
                            value={answer.shortContent}
                            onChange={(e) => {
                              const newAnswers = [...messageFormData.answers];
                              newAnswers[index] = { ...newAnswers[index], shortContent: e.target.value };
                              setMessageFormData({ ...messageFormData, answers: newAnswers });
                            }}
                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Réponse courte (optionnel)..."
                          />
                          <input
                            type="text"
                            value={answer.cpuResponse}
                            onChange={(e) => {
                              const newAnswers = [...messageFormData.answers];
                              newAnswers[index] = { ...newAnswers[index], cpuResponse: e.target.value };
                              setMessageFormData({ ...messageFormData, answers: newAnswers });
                            }}
                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Réaction du CPU *"
                            required={messageFormData.isQuestion}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={resetMessageForm} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Annuler
                </button>
                <button type="submit" className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  {editingMessage ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal endpoint de stream */}
      {showEndpointForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">
              {editingEndpoint ? 'Déplacer la limite de stream' : 'Nouvelle limite de stream'}
            </h3>
            <form onSubmit={editingEndpoint ? handleUpdateEndpoint : handleCreateEndpoint}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Position (date/heure)</label>
                <DatePicker
                  selected={endpointFormData.timestamp}
                  onChange={(date) => setEndpointFormData({ ...endpointFormData, timestamp: date || new Date() })}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={1}
                  dateFormat="dd/MM/yyyy HH:mm"
                  locale="fr"
                  className="w-full"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">La limite sera placée à cette position dans la chronologie des messages.</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={resetEndpointForm} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Annuler
                </button>
                <button type="submit" className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                  {editingEndpoint ? 'Déplacer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal édition question */}
      {showQuestionEditor && editingQuestionMessageId && (
        <QuizQuestionEditor
          messageId={editingQuestionMessageId}
          messageText={
            selectedConversation?.messages?.find(m => m.id === editingQuestionMessageId)?.text || ''
          }
          existingQuestion={editingQuestion || undefined}
          onClose={() => { setShowQuestionEditor(false); setEditingQuestionMessageId(null); setEditingQuestion(null); }}
          onSave={async () => {
            await loadData();
            const updated = await smsService.getSMSConversation(selectedConversation!.id);
            setSelectedConversation(updated);
          }}
        />
      )}
    </div>
  );
};

export default SMSManager;
