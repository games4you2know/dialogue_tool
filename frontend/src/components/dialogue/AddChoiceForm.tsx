import React from 'react';

interface AddChoiceFormProps {
  choiceText: string;
  onUpdateText: (text: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const AddChoiceForm: React.FC<AddChoiceFormProps> = ({
  choiceText,
  onUpdateText,
  onSubmit,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Ajouter un choix</h3>
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texte du choix *
            </label>
            <input
              type="text"
              value={choiceText}
              onChange={(e) => onUpdateText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Texte du choix"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChoiceForm;
