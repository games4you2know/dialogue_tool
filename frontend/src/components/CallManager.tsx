import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import { fr } from 'date-fns/locale/fr';
import { format } from 'date-fns';
import type { Call, Character } from '../types/index';
import { callService, type CreateCallRequest, type UpdateCallRequest } from '../services/callService';
import { characterService } from '../services/characterService';
import '../styles/datepicker.css';

registerLocale('fr', fr);

interface CallManagerProps {
  projectId: string;
}

interface CallFormData {
  characterId: string;
  callDate: Date;
  duration: number;
  status: number;
}

const STATUS_LABELS: Record<number, string> = {
  0: 'Manqué',
  1: 'Entrant',
  2: 'Sortant',
};

const STATUS_COLORS: Record<number, string> = {
  0: 'bg-red-100 text-red-700',
  1: 'bg-green-100 text-green-700',
  2: 'bg-blue-100 text-blue-700',
};

const STATUS_ICONS: Record<number, string> = {
  0: '📵',
  1: '📲',
  2: '📞',
};

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const CallManager: React.FC<CallManagerProps> = ({ projectId }) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCall, setEditingCall] = useState<Call | null>(null);
  const [formData, setFormData] = useState<CallFormData>({
    characterId: '',
    callDate: new Date(),
    duration: 0,
    status: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedCalls, fetchedCharacters] = await Promise.all([
        callService.getCallsByProject(projectId),
        characterService.getCharactersByProject(projectId),
      ]);
      setCalls(fetchedCalls);
      setCharacters(fetchedCharacters);
      setError(null);
    } catch {
      setError('Erreur lors du chargement des appels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const resetForm = () => {
    setFormData({ characterId: '', callDate: new Date(), duration: 0, status: 0 });
    setEditingCall(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCall) {
        const updateData: UpdateCallRequest = {
          characterId: formData.characterId || undefined,
          callDate: formData.callDate,
          duration: formData.duration,
          status: formData.status,
        };
        await callService.updateCall(editingCall.id, updateData);
      } else {
        const createData: CreateCallRequest = {
          projectId,
          characterId: formData.characterId || undefined,
          callDate: formData.callDate,
          duration: formData.duration,
          status: formData.status,
        };
        await callService.createCall(createData);
      }
      await loadData();
      resetForm();
    } catch {
      setError("Erreur lors de l'enregistrement de l'appel");
    }
  };

  const handleEdit = (call: Call) => {
    setEditingCall(call);
    setFormData({
      characterId: call.characterId || '',
      callDate: new Date(call.callDate),
      duration: call.duration,
      status: call.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (callId: string) => {
    if (!confirm('Supprimer cet appel ?')) return;
    try {
      await callService.deleteCall(callId);
      await loadData();
    } catch {
      setError("Erreur lors de la suppression de l'appel");
    }
  };

  const getCharacterName = (characterId: string) => {
    return characters.find(c => c.id === characterId)?.name || 'Inconnu';
  };

  const getCharacterColor = (characterId: string) => {
    return characters.find(c => c.id === characterId)?.color || '#6B7280';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Chargement des appels...</span>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Appels</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouvel appel
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {calls.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">📵</div>
          <p>Aucun appel enregistré</p>
          <p className="text-sm mt-1">Cliquez sur "+ Nouvel appel" pour commencer</p>
        </div>
      ) : (
        <div className="space-y-3">
          {calls.map((call) => (
            <div key={call.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center gap-4">
              {/* Status icon */}
              <div className="text-2xl flex-shrink-0">{STATUS_ICONS[call.status]}</div>

              {/* Contact */}
              <div className="flex items-center gap-2 w-48 flex-shrink-0">
                {call.characterId && (
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getCharacterColor(call.characterId) }}
                  />
                )}
                <span className="font-medium text-gray-800 truncate">
                  {call.characterId ? getCharacterName(call.characterId) : 'Contact inconnu'}
                </span>
              </div>

              {/* Status badge */}
              <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${STATUS_COLORS[call.status]}`}>
                {STATUS_LABELS[call.status]}
              </span>

              {/* Date */}
              <span className="text-sm text-gray-600 flex-shrink-0">
                {format(new Date(call.callDate), 'dd/MM/yyyy HH:mm')}
              </span>

              {/* Duration */}
              <span className="text-sm text-gray-500 flex-shrink-0">
                ⏱ {formatDuration(call.duration)}
              </span>

              {/* Actions */}
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => handleEdit(call)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                  title="Modifier"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(call.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingCall ? 'Modifier l\'appel' : 'Nouvel appel'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Contact */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact
                </label>
                <select
                  value={formData.characterId}
                  onChange={(e) => setFormData({ ...formData, characterId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Contact inconnu</option>
                  {characters.map((character) => (
                    <option key={character.id} value={character.id}>
                      {character.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'appel
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>📵 Manqué</option>
                  <option value={1}>📲 Entrant</option>
                  <option value={2}>📞 Sortant</option>
                </select>
              </div>

              {/* Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date et heure *
                </label>
                <DatePicker
                  selected={formData.callDate}
                  onChange={(date) => setFormData({ ...formData, callDate: date || new Date() })}
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

              {/* Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée (secondes)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Math.max(0, Number(e.target.value)) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: 120"
                />
                {formData.duration > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    → {formatDuration(formData.duration)}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCall ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallManager;
