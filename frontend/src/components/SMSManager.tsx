import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import { fr } from 'date-fns/locale/fr';
import { format } from 'date-fns';
import type { SMSConversation, Character, SMSMessage, SMSQuestion } from '../types/index';
import { smsService, type CreateSMSConversationRequest, type UpdateSMSConversationRequest, type CreateSMSMessageRequest, type UpdateSMSMessageRequest } from '../services/smsService';
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
  name: string;
  folderId: string;
}

interface MessageFormData {
  characterId: string;
  text: string;
  timestamp: Date;
  isQuestion: boolean;
  questionContent: string;
  answers: {
    content: string;
    isCorrect: boolean;
  }[];
  positiveReactions: string[];
  negativeReactions: string[];
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
  const [conversationFormData, setConversationFormData] = useState<ConversationFormData>({ name: '', folderId: '' });
  const [messageFormData, setMessageFormData] = useState<MessageFormData>({
    characterId: '',
    text: '',
    timestamp: new Date(),
    isQuestion: false,
    questionContent: '',
    answers: [],
    positiveReactions: [],
    negativeReactions: []
  });
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [editingQuestionMessageId, setEditingQuestionMessageId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<SMSQuestion | null>(null);

  const messageEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Tapez votre message...',
      }),
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

  useEffect(() => {
    loadData();
  }, [projectId]);

  const resetConversationForm = () => {
    setConversationFormData({ name: '', folderId: selectedFolderId || '' });
    setEditingConversation(null);
    setShowConversationForm(false);
  };

  const resetMessageForm = () => {
    const emptyFormData: MessageFormData = {
      characterId: '',
      text: '',
      timestamp: new Date(),
      isQuestion: false,
      questionContent: '',
      answers: [],
      positiveReactions: [],
      negativeReactions: []
    };
    setMessageFormData(emptyFormData);
    if (messageEditor) {
      messageEditor.commands.setContent('');
    }
    setShowMessageForm(false);
  };

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newConversation: CreateSMSConversationRequest = {
        projectId,
        name: conversationFormData.name,
        folderId: conversationFormData.folderId || undefined
      };
      
      await smsService.createSMSConversation(newConversation);
      await loadData();
      resetConversationForm();
    } catch (err) {
      setError('Erreur lors de la création de la conversation');
      console.error(err);
    }
  };

  const handleUpdateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConversation) return;
    
    try {
      const updateData: UpdateSMSConversationRequest = {
        name: conversationFormData.name
      };
      
      await smsService.updateSMSConversation(editingConversation.id, updateData);
      await loadData();
      resetConversationForm();
    } catch (err) {
      setError('Erreur lors de la modification de la conversation');
      console.error(err);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) return;
    
    try {
      await smsService.deleteSMSConversation(conversationId);
      await loadData();
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (err) {
      setError('Erreur lors de la suppression de la conversation');
      console.error(err);
    }
  };

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation) return;
    
    try {
      if (editingMessage) {
        // Modifier le message existant
        const updateData: UpdateSMSMessageRequest = {
          characterId: messageFormData.characterId || undefined,
          text: messageFormData.text,
          timestamp: messageFormData.timestamp
        };
        
        await smsService.updateSMSMessage(editingMessage.id, updateData);
      } else {
        // Créer le message
        const newMessage: CreateSMSMessageRequest = {
          characterId: messageFormData.characterId || undefined,
          text: messageFormData.isQuestion ? '' : messageFormData.text, // Pas de texte si c'est une question pure
          timestamp: messageFormData.timestamp
        };
        
        const createdMessage = await smsService.addSMSMessage(selectedConversation.id, newMessage);
        
        // Si c'est une question, créer la question associée
        if (messageFormData.isQuestion && messageFormData.questionContent.trim()) {
          await smsService.addSMSQuestion(createdMessage.id, {
            content: messageFormData.questionContent,
            answers: messageFormData.answers.filter(a => a.content.trim()),
            reactions: {
              positive: messageFormData.positiveReactions,
              negative: messageFormData.negativeReactions
            }
          });
        }
      }
      
      const updatedConversation = await smsService.getSMSConversation(selectedConversation.id);
      setSelectedConversation(updatedConversation);
      
      resetMessageForm();
    } catch (err) {
      setError('Erreur lors de l\'ajout du message');
      console.error(err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;
    if (!selectedConversation) return;
    
    try {
      await smsService.deleteSMSMessage(messageId);
      const updatedConversation = await smsService.getSMSConversation(selectedConversation.id);
      setSelectedConversation(updatedConversation);
    } catch (err) {
      setError('Erreur lors de la suppression du message');
      console.error(err);
    }
  };

  const startEditConversation = (conversation: SMSConversation) => {
    setEditingConversation(conversation);
    setConversationFormData({ name: conversation.name, folderId: conversation.folderId || '' });
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
      console.error(err);
    }
  };

  const getCharacterName = (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    return character?.name || 'Inconnu';
  };

  const getCharacterColor = (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    return character?.color || '#3B82F6';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des conversations SMS...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar des dossiers */}
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

      {/* Contenu principal */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFolderSidebar(!showFolderSidebar)}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              title={showFolderSidebar ? 'Masquer les dossiers' : 'Afficher les dossiers'}
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

        {/* Liste des conversations */}
        <div className="grid gap-4">
          {filteredConversations.map((conversation) => (
            <div key={conversation.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{conversation.name}</h3>
                  <div className="text-sm text-gray-500">
                    {conversation.messages?.length || 0} message(s)
                  </div>
                </div>
                
                <div className="flex gap-2 relative">
                  <button
                    onClick={() => setSelectedConversation(conversation)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                  >
                    Voir messages
                  </button>
                  <button
                    onClick={() => startEditConversation(conversation)}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    Modifier
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowMoveMenu(showMoveMenu === conversation.id ? null : conversation.id)}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm hover:bg-purple-200 transition-colors"
                    >
                    Déplacer
                    </button>
                    {showMoveMenu === conversation.id && (
                      <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        <div className="p-2">
                          <button
                            onClick={() => handleMoveConversation(conversation.id, null)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                          >
                            Racine (aucun dossier)
                          </button>
                          {folders.map(folder => (
                            <button
                              key={folder.id}
                              onClick={() => handleMoveConversation(conversation.id, folder.id)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                            >
                              {folder.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteConversation(conversation.id)}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Aperçu des messages */}
              {conversation.messages && conversation.messages.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu :</h4>
                  <div className="space-y-2">
                    {conversation.messages.slice(0, 3).map((message) => (
                      <div key={message.id} className="flex items-start gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                          style={{ backgroundColor: message.characterId ? getCharacterColor(message.characterId) : '#6B7280' }}
                        >
                          {message.characterId ? getCharacterName(message.characterId).charAt(0) : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800 text-sm">
                              {message.characterId ? getCharacterName(message.characterId) : 'Système'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(message.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr })}
                            </span>
                          </div>
                          {message.text && (
                            <div className="text-sm text-gray-600 truncate" dangerouslySetInnerHTML={{ __html: message.text }} />
                          )}
                          {message.questions && message.questions.length > 0 && (
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <span className="font-medium">{message.questions[0].content}</span>
                              {message.questions.length > 1 && (
                                <span className="text-xs text-gray-400">+{message.questions.length - 1}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {conversation.messages.length > 3 && (
                      <div className="text-sm text-gray-400">
                        ... et {conversation.messages.length - 3} message(s) de plus
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredConversations.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            {selectedFolderId
              ? 'Aucune conversation SMS dans ce dossier.'
              : 'Aucune conversation SMS créée. Commencez par ajouter votre première conversation !'}
          </div>
        )}
      </div>

      {/* Modal de formulaire conversation */}
      {showConversationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingConversation ? 'Modifier la conversation' : 'Nouvelle conversation SMS'}
            </h3>
            
            <form onSubmit={editingConversation ? handleUpdateConversation : handleCreateConversation}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={conversationFormData.name}
                  onChange={(e) => setConversationFormData({ ...conversationFormData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom de la conversation"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetConversationForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingConversation ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de visualisation des messages */}
      {selectedConversation && !showMessageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedConversation.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMessageForm(true)}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Ajouter un message
                </button>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
              {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                <div className="space-y-3">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start gap-3"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                        style={{ backgroundColor: message.characterId ? getCharacterColor(message.characterId) : '#6B7280' }}
                      >
                        {message.characterId ? getCharacterName(message.characterId).charAt(0) : '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-800">
                            {message.characterId ? getCharacterName(message.characterId) : 'Système'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(message.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </span>
                        </div>
                        
                        {/* Message text */}
                        {message.text && (
                          <div className="bg-white rounded-lg p-3 shadow-sm mb-2 relative">
                            <div dangerouslySetInnerHTML={{ __html: message.text }} />
                            <div className="absolute top-2 right-2 flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingMessage(message);
                                  setMessageFormData({
                                    characterId: message.characterId || '',
                                    text: message.text || '',
                                    timestamp: new Date(message.timestamp),
                                    isQuestion: false,
                                    questionContent: '',
                                    answers: [],
                                    positiveReactions: [],
                                    negativeReactions: []
                                  });
                                  messageEditor?.commands.setContent(message.text || '');
                                  setShowMessageForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors bg-white shadow-sm"
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors bg-white shadow-sm"
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Questions */}
                        {message.questions && message.questions.length > 0 && (
                          <div className="space-y-2">
                            {message.questions.map((question) => (
                              <div key={question.id} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-blue-500">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-2 flex-1">
                                    <span className="font-medium text-gray-900">{question.content}</span>
                                  </div>
                                  <div className="flex gap-2 ml-3">
                                    <button
                                      onClick={() => {
                                        setEditingQuestion(question);
                                        setEditingQuestionMessageId(message.id);
                                        setShowQuestionEditor(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                      title="Modifier"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (confirm('Supprimer cette question ?')) {
                                          await smsService.deleteSMSQuestion(question.id);
                                          await loadData();
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                      title="Supprimer"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="space-y-2 mb-3">
                                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Réponses</div>
                                  {question.answers.map((answer, index) => (
                                    <div
                                      key={answer.id}
                                      className={`flex items-start gap-2 px-3 py-2 rounded-md transition-colors ${
                                        answer.isCorrect
                                          ? 'bg-green-50 border border-green-200'
                                          : 'bg-gray-50 border border-gray-200'
                                      }`}
                                    >
                                      <span className={`flex-shrink-0 font-medium ${
                                        answer.isCorrect ? 'text-green-600' : 'text-gray-400'
                                      }`}>
                                        {answer.isCorrect ? '✓' : `${index + 1}.`}
                                      </span>
                                      <span className={
                                        answer.isCorrect ? 'text-green-800' : 'text-gray-700'
                                      }>
                                        {answer.content}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                      Réactions positives
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {question.reactions.positive.map((reaction, idx) => (
                                        <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                          {reaction}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                      Réactions négatives
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {question.reactions.negative.map((reaction, idx) => (
                                        <span key={idx} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                          {reaction}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucun message dans cette conversation
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de formulaire message */}
      {showMessageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingMessage ? 'Modifier le message' : 'Ajouter un message'}</h3>
            
            <form onSubmit={handleAddMessage}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personnage
                </label>
                <select
                  value={messageFormData.characterId}
                  onChange={(e) => setMessageFormData({ ...messageFormData, characterId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Système / Narrateur</option>
                  {characters.map((character) => (
                    <option key={character.id} value={character.id}>
                      {character.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date et heure d'envoi *
                </label>
                <DatePicker
                  selected={messageFormData.timestamp}
                  onChange={(date) => setMessageFormData({ ...messageFormData, timestamp: date || new Date() })}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  locale="fr"
                  className="w-full"
                  placeholderText="Sélectionnez la date et l'heure"
                  required
                />
              </div>

              {/* Toggle Question/Message */}
              {!editingMessage && (
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={messageFormData.isQuestion}
                      onChange={(e) => setMessageFormData({ ...messageFormData, isQuestion: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Ce message contient une question (quiz)</span>
                  </label>
                </div>
              )}

              {!messageFormData.isQuestion ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                    <div className="dialogue-editor-toolbar border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg">
                      <button
                        type="button"
                        onClick={() => messageEditor?.chain().focus().toggleBold().run()}
                        className={`px-2 py-1 mx-1 rounded text-sm ${
                          messageEditor?.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-white'
                        }`}
                      >
                        G
                      </button>
                      <button
                        type="button"
                        onClick={() => messageEditor?.chain().focus().toggleItalic().run()}
                        className={`px-2 py-1 mx-1 rounded text-sm italic ${
                          messageEditor?.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-white'
                        }`}
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => messageEditor?.chain().focus().toggleStrike().run()}
                        className={`px-2 py-1 mx-1 rounded text-sm line-through ${
                          messageEditor?.isActive('strike') ? 'bg-blue-500 text-white' : 'bg-white'
                        }`}
                      >
                        S
                      </button>
                    </div>
                    <EditorContent 
                      editor={messageEditor} 
                      className="dialogue-editor-content min-h-[100px] p-3"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Question Content */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question *
                    </label>
                    <input
                      type="text"
                      value={messageFormData.questionContent}
                      onChange={(e) => setMessageFormData({ ...messageFormData, questionContent: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Quelle est la question ?"
                      required={messageFormData.isQuestion}
                    />
                  </div>

                  {/* Answers */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Réponses *
                      </label>
                      <button
                        type="button"
                        onClick={() => setMessageFormData({ 
                          ...messageFormData, 
                          answers: [...messageFormData.answers, { content: '', isCorrect: false }] 
                        })}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                      >
                        + Ajouter
                      </button>
                    </div>
                    <div className="space-y-2">
                      {messageFormData.answers.map((answer, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex items-center mt-2">
                            <input
                              type="checkbox"
                              checked={answer.isCorrect}
                              onChange={(e) => {
                                const newAnswers = [...messageFormData.answers];
                                newAnswers[index].isCorrect = e.target.checked;
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
                              newAnswers[index].content = e.target.value;
                              setMessageFormData({ ...messageFormData, answers: newAnswers });
                            }}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Réponse ${index + 1}`}
                            required={messageFormData.isQuestion}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newAnswers = messageFormData.answers.filter((_, i) => i !== index);
                              setMessageFormData({ ...messageFormData, answers: newAnswers });
                            }}
                            className="text-red-600 hover:text-red-700 px-2 py-2"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Cochez les cases pour indiquer les réponses correctes
                    </p>
                  </div>

                  {/* Reactions */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Réactions positives
                      </label>
                      <div className="space-y-1 mb-2">
                        {messageFormData.positiveReactions.map((reaction, index) => (
                          <div key={index} className="flex gap-2 items-center bg-green-50 rounded px-2 py-1">
                            <span className="flex-1 text-sm">{reaction}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newReactions = messageFormData.positiveReactions.filter((_, i) => i !== index);
                                setMessageFormData({ ...messageFormData, positiveReactions: newReactions });
                              }}
                              className="text-red-600 hover:text-red-700 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Nouvelle réaction positive"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              setMessageFormData({ 
                                ...messageFormData, 
                                positiveReactions: [...messageFormData.positiveReactions, input.value.trim()] 
                              });
                              input.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Réactions négatives
                      </label>
                      <div className="space-y-1 mb-2">
                        {messageFormData.negativeReactions.map((reaction, index) => (
                          <div key={index} className="flex gap-2 items-center bg-red-50 rounded px-2 py-1">
                            <span className="flex-1 text-sm">{reaction}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newReactions = messageFormData.negativeReactions.filter((_, i) => i !== index);
                                setMessageFormData({ ...messageFormData, negativeReactions: newReactions });
                              }}
                              className="text-red-600 hover:text-red-700 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Nouvelle réaction négative"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              setMessageFormData({ 
                                ...messageFormData, 
                                negativeReactions: [...messageFormData.negativeReactions, input.value.trim()] 
                              });
                              input.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetMessageForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingMessage ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition de question */}
      {showQuestionEditor && editingQuestionMessageId && (
        <QuizQuestionEditor
          messageId={editingQuestionMessageId}
          existingQuestion={editingQuestion || undefined}
          onClose={() => {
            setShowQuestionEditor(false);
            setEditingQuestionMessageId(null);
            setEditingQuestion(null);
          }}
          onSave={async () => {
            await loadData();
            const updatedConv = await smsService.getSMSConversation(selectedConversation!.id);
            setSelectedConversation(updatedConv);
          }}
        />
      )}
    </div>
  );
};

export default SMSManager;