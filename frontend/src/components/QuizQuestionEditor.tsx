import React, { useState } from 'react';
import type { SMSQuestion } from '../types/index';
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
  cpuResponse: string;
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
      order: a.order,
      cpuResponse: a.cpuResponse || ''
    })) || [
      { content: '', isCorrect: true, order: 0, cpuResponse: '' },
      { content: '', isCorrect: false, order: 1, cpuResponse: '' },
    ]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addAnswer = () => {
    setAnswers([...answers, { content: '', isCorrect: false, order: answers.length, cpuResponse: '' }]);
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

    try {
      setSaving(true);
      setError(null);

      const questionData: CreateSMSQuestionRequest = {
        content: questionContent.trim(),
        answers: answers.map(a => ({
          content: a.content.trim(),
          isCorrect: a.isCorrect,
          order: a.order,
          cpuResponse: (!a.isCorrect && a.cpuResponse.trim()) ? a.cpuResponse.trim() : undefined
        }))
      };

      if (existingQuestion) {
        await smsService.updateSMSQuestion(existingQuestion.id, questionData);
      } else {
        await smsService.addSMSQuestion(messageId, questionData);
      }

      onSave();
      onClose();
    } catch (err) {
      setError("Erreur lors de l'enregistrement de la question");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
              <input
                type="text"
                value={questionContent}
                onChange={(e) => setQuestionContent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Quelle est la question ?"
                required
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">Réponses (minimum 2)</label>
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
                  <div
                    key={index}
                    className={`rounded-lg border p-3 ${answer.isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <div className="flex gap-2 items-start mb-2">
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
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder={answer.isCorrect ? `Bonne réponse ${index + 1}` : `Mauvaise réponse ${index + 1}`}
                        required
                      />
                      {answers.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeAnswer(index)}
                          className="text-red-600 hover:text-red-700 px-2 py-2"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    {!answer.isCorrect && (
                      <div className="ml-7">
                        <input
                          type="text"
                          value={answer.cpuResponse}
                          onChange={(e) => updateAnswer(index, 'cpuResponse', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Réponse du CPU si cette mauvaise réponse est choisie..."
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Cochez pour indiquer les bonnes réponses. Renseignez la contre-réponse CPU pour les mauvaises.
              </p>
            </div>

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
