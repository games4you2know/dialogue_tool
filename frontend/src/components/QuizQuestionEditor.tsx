import React, { useState, useEffect } from 'react';
import type { SMSQuestion, SMSReactions } from '../types/index';
import { smsService, type CreateSMSQuestionRequest } from '../services/smsService';

interface QuizQuestionEditorProps {
  messageId: string;
  existingQuestion?: SMSQuestion;
  onClose: () => void;
  onSave: () => void;
}

interface AnswerFormData {
  content: string;
  isCorrect: boolean;
  order: number;
}

const QuizQuestionEditor: React.FC<QuizQuestionEditorProps> = ({
  messageId,
  existingQuestion,
  onClose,
  onSave,
}) => {
  const [questionContent, setQuestionContent] = useState(existingQuestion?.content || '');
  const [answers, setAnswers] = useState<AnswerFormData[]>(
    existingQuestion?.answers.map(a => ({
      content: a.content,
      isCorrect: a.isCorrect,
      order: a.order
    })) || [
      { content: '', isCorrect: true, order: 0 },
      { content: '', isCorrect: false, order: 1 },
    ]
  );
  const [positiveReactions, setPositiveReactions] = useState<string[]>(
    existingQuestion?.reactions.positive || ['Bravo !', 'Excellente réponse !']
  );
  const [negativeReactions, setNegativeReactions] = useState<string[]>(
    existingQuestion?.reactions.negative || ['Dommage...', 'Essaie encore !']
  );
  const [newPositiveReaction, setNewPositiveReaction] = useState('');
  const [newNegativeReaction, setNewNegativeReaction] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addAnswer = () => {
    setAnswers([...answers, { content: '', isCorrect: false, order: answers.length }]);
  };

  const removeAnswer = (index: number) => {
    if (answers.length <= 2) {
      setError('Il faut au moins 2 réponses');
      return;
    }
    setAnswers(answers.filter((_, i) => i !== index).map((a, i) => ({ ...a, order: i })));
  };

  const updateAnswer = (index: number, field: keyof AnswerFormData, value: any) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setAnswers(newAnswers);
  };

  const addPositiveReaction = () => {
    if (newPositiveReaction.trim()) {
      setPositiveReactions([...positiveReactions, newPositiveReaction.trim()]);
      setNewPositiveReaction('');
    }
  };

  const removePositiveReaction = (index: number) => {
    setPositiveReactions(positiveReactions.filter((_, i) => i !== index));
  };

  const addNegativeReaction = () => {
    if (newNegativeReaction.trim()) {
      setNegativeReactions([...negativeReactions, newNegativeReaction.trim()]);
      setNewNegativeReaction('');
    }
  };

  const removeNegativeReaction = (index: number) => {
    setNegativeReactions(negativeReactions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionContent.trim()) {
      setError('La question est requise');
      return;
    }

    if (answers.some(a => !a.content.trim())) {
      setError('Toutes les réponses doivent avoir un contenu');
      return;
    }

    if (!answers.some(a => a.isCorrect)) {
      setError('Au moins une réponse doit être correcte');
      return;
    }

    if (positiveReactions.length === 0) {
      setError('Au moins une réaction positive est requise');
      return;
    }

    if (negativeReactions.length === 0) {
      setError('Au moins une réaction négative est requise');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const questionData: CreateSMSQuestionRequest = {
        content: questionContent.trim(),
        answers: answers.map(a => ({
          content: a.content.trim(),
          isCorrect: a.isCorrect,
          order: a.order
        })),
        reactions: {
          positive: positiveReactions,
          negative: negativeReactions
        }
      };

      if (existingQuestion) {
        await smsService.updateSMSQuestion(existingQuestion.id, questionData);
      } else {
        await smsService.addSMSQuestion(messageId, questionData);
      }

      onSave();
      onClose();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de la question');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">
            {existingQuestion ? 'Modifier la question' : 'Ajouter une question'}
          </h3>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Question */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question *
              </label>
              <input
                type="text"
                value={questionContent}
                onChange={(e) => setQuestionContent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Quelle est la question ?"
                required
              />
            </div>

            {/* Réponses */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Réponses (minimum 2)
                </label>
                <button
                  type="button"
                  onClick={addAnswer}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                >
                  + Ajouter une réponse
                </button>
              </div>
              <div className="space-y-3">
                {answers.map((answer, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={answer.isCorrect}
                        onChange={(e) => updateAnswer(index, 'isCorrect', e.target.checked)}
                        className="w-5 h-5"
                        title="Réponse correcte"
                      />
                    </div>
                    <input
                      type="text"
                      value={answer.content}
                      onChange={(e) => updateAnswer(index, 'content', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Réponse ${index + 1}`}
                      required
                    />
                    {answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeAnswer(index)}
                        className="text-red-600 hover:text-red-700 px-2 py-2"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Cochez les cases pour indiquer les réponses correctes
              </p>
            </div>

            {/* Réactions positives */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Réactions positives (réponse correcte)
              </label>
              <div className="space-y-2 mb-2">
                {positiveReactions.map((reaction, index) => (
                  <div key={index} className="flex gap-2 items-center bg-green-50 rounded-lg px-3 py-2">
                    <span className="flex-1 text-sm">{reaction}</span>
                    <button
                      type="button"
                      onClick={() => removePositiveReaction(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPositiveReaction}
                  onChange={(e) => setNewPositiveReaction(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPositiveReaction())}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ajouter une réaction positive"
                />
                <button
                  type="button"
                  onClick={addPositiveReaction}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Réactions négatives */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Réactions négatives (réponse incorrecte)
              </label>
              <div className="space-y-2 mb-2">
                {negativeReactions.map((reaction, index) => (
                  <div key={index} className="flex gap-2 items-center bg-red-50 rounded-lg px-3 py-2">
                    <span className="flex-1 text-sm">{reaction}</span>
                    <button
                      type="button"
                      onClick={() => removeNegativeReaction(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNegativeReaction}
                  onChange={(e) => setNewNegativeReaction(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNegativeReaction())}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ajouter une réaction négative"
                />
                <button
                  type="button"
                  onClick={addNegativeReaction}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionEditor;
