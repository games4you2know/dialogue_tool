import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectMemberService, type ProjectMember } from "../services/projectMemberService";
import { useAuth } from "../contexts/AuthContext";

export default function ProjectMembersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");
  const [addingMember, setAddingMember] = useState(false);

  const currentUserMember = members.find((m) => m.userId === user?.id);
  const canManageMembers = currentUserMember?.role === "owner" || currentUserMember?.role === "admin";

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  const loadMembers = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const data = await projectMemberService.getMembers(projectId);
      setMembers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    setError("");
    setSuccess("");
    setAddingMember(true);

    try {
      const newMember = await projectMemberService.addMember(projectId, newMemberEmail, newMemberRole);
      setMembers([...members, newMember]);
      setSuccess("Membre ajouté avec succès");
      setShowAddModal(false);
      setNewMemberEmail("");
      setNewMemberRole("member");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingMember(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    setError("");
    setSuccess("");

    try {
      const updatedMember = await projectMemberService.updateMemberRole(memberId, newRole);
      setMembers(members.map((m) => (m.id === memberId ? updatedMember : m)));
      setSuccess("Rôle modifié avec succès");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir retirer ce membre du projet ?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await projectMemberService.removeMember(memberId);
      setMembers(members.filter((m) => m.id !== memberId));
      setSuccess("Membre retiré avec succès");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-600";
      case "admin":
        return "bg-blue-600";
      case "member":
        return "bg-green-600";
      case "viewer":
        return "bg-gray-600";
      default:
        return "bg-gray-600";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Propriétaire";
      case "admin":
        return "Administrateur";
      case "member":
        return "Membre";
      case "viewer":
        return "Observateur";
      default:
        return role;
    }
  };

  if (loading) {
    return <div className="text-white p-8">Chargement...</div>;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Membres du projet</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/projects/${projectId}`)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Retour au projet
            </button>
            {canManageMembers && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Ajouter un membre
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Rôle</th>
                {canManageMembers && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 text-white">{member.user.name}</td>
                  <td className="px-6 py-4 text-gray-400">{member.user.email}</td>
                  <td className="px-6 py-4">
                    {canManageMembers && member.role !== "owner" ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                      >
                        <option value="admin">Administrateur</option>
                        <option value="member">Membre</option>
                        <option value="viewer">Observateur</option>
                      </select>
                    ) : (
                      <span className={`${getRoleBadgeColor(member.role)} text-white px-3 py-1 rounded text-sm`}>
                        {getRoleLabel(member.role)}
                      </span>
                    )}
                  </td>
                  {canManageMembers && (
                    <td className="px-6 py-4 text-right">
                      {member.role !== "owner" && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Retirer
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal d'ajout de membre */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-white mb-4">Ajouter un membre</h2>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rôle</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="admin">Administrateur</option>
                    <option value="member">Membre</option>
                    <option value="viewer">Observateur</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewMemberEmail("");
                      setNewMemberRole("member");
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={addingMember}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {addingMember ? "Ajout..." : "Ajouter"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
