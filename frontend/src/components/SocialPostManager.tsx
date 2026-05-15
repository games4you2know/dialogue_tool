import React, { useState, useEffect } from 'react';
import type { SocialPost } from '../types/index';
import { socialPostService, type CreateSocialPostRequest, type UpdateSocialPostRequest } from '../services/socialPostService';

interface SocialPostManagerProps {
  projectId: string;
}

interface PostFormData {
  content: string;
  reportReason: string; // '' = none, '0'/'1'/'2' for selection
}

const REPORT_REASON_LABELS: Record<number, string> = {
  0: 'Menaces',
  1: 'Injure',
  2: 'Atteinte à la vie privée',
};

const REPORT_REASON_COLORS: Record<number, string> = {
  0: 'bg-red-100 text-red-700 border-red-200',
  1: 'bg-orange-100 text-orange-700 border-orange-200',
  2: 'bg-purple-100 text-purple-700 border-purple-200',
};

const SocialPostManager: React.FC<SocialPostManagerProps> = ({ projectId }) => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [formData, setFormData] = useState<PostFormData>({
    content: '',
    reportReason: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const fetched = await socialPostService.getByProject(projectId);
      setPosts(fetched);
      setError(null);
    } catch {
      setError('Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const resetForm = () => {
    setFormData({ content: '', reportReason: '' });
    setEditingPost(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reportReason = formData.reportReason !== '' ? Number(formData.reportReason) : null;
    try {
      if (editingPost) {
        const updateData: UpdateSocialPostRequest = {
          content: formData.content,
          reportReason,
        };
        await socialPostService.update(editingPost.id, updateData);
      } else {
        const createData: CreateSocialPostRequest = {
          projectId,
          content: formData.content,
          reportReason,
        };
        await socialPostService.create(createData);
      }
      await loadData();
      resetForm();
    } catch {
      setError("Erreur lors de l'enregistrement du post");
    }
  };

  const handleEdit = (post: SocialPost) => {
    setEditingPost(post);
    setFormData({
      content: post.content,
      reportReason: post.reportReason !== null && post.reportReason !== undefined ? String(post.reportReason) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Supprimer ce post ?')) return;
    try {
      await socialPostService.delete(postId);
      await loadData();
    } catch {
      setError('Erreur lors de la suppression du post');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Chargement des posts...</span>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Réseaux sociaux</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouveau post
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">📱</div>
          <p>Aucun post enregistré</p>
          <p className="text-sm mt-1">Cliquez sur "+ Nouveau post" pour commencer</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                  {post.reportReason !== null && post.reportReason !== undefined && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${REPORT_REASON_COLORS[post.reportReason]}`}>
                        🚩 {REPORT_REASON_LABELS[post.reportReason]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(post)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">
              {editingPost ? 'Modifier le post' : 'Nouveau post'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Content */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  placeholder="Contenu du post..."
                  required
                />
              </div>

              {/* Report reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison de signalement
                </label>
                <select
                  value={formData.reportReason}
                  onChange={(e) => setFormData({ ...formData, reportReason: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Aucune</option>
                  <option value="0">🚩 Menaces</option>
                  <option value="1">🚩 Injure</option>
                  <option value="2">🚩 Atteinte à la vie privée</option>
                </select>
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
                  {editingPost ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialPostManager;
