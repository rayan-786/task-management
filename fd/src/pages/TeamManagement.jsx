import { useState, useEffect, useCallback } from "react";
import { Users, UserPlus, Mail, Trash2, Check, X, Shield } from "lucide-react";
import API from "../api";
import { useWorkspace } from "../context/WorkspaceContext";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import Select from "../components/ui/Select";
import { TableSkeleton } from "../components/ui/Skeleton";

export default function TeamManagement() {
  const { user } = useAuth();
  const { activeWorkspace, userRole } = useWorkspace();

  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const fetchTeam = useCallback(async () => {
    if (!activeWorkspace?._id) return;
    try {
      // 1. Members
      const res = await API.get(`/api/workspaces/${activeWorkspace._id}`);
      if (res.data.success) {
        setMembers(res.data.members || []);
      }

      // 2. Pending Invitations (if admin/owner)
      if (["owner", "admin"].includes(userRole)) {
        const invRes = await API.get(`/api/workspaces/${activeWorkspace._id}/invitations`);
        if (invRes.data.success) {
          setInvitations(invRes.data.invitations || []);
        }
      }
    } catch (err) {
      console.error("Failed to load team data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace, userRole]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setInviteError("");
    setInviteSuccess("");

    try {
      const res = await API.post(`/api/workspaces/${activeWorkspace._id}/invite`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      if (res.data.success) {
        setInviteSuccess(`Invitation sent to ${inviteEmail.trim()}`);
        setInviteEmail("");
        fetchTeam();
        setTimeout(() => {
          setInviteModal(false);
          setInviteSuccess("");
        }, 1500);
      }
    } catch (err) {
      setInviteError(err.response?.data?.msg || "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const res = await API.put(
        `/api/workspaces/${activeWorkspace._id}/members/${memberId}`,
        { role: newRole }
      );
      if (res.data.success) {
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
        );
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to update role");
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      return;
    }

    try {
      const res = await API.delete(
        `/api/workspaces/${activeWorkspace._id}/members/${memberId}`
      );
      if (res.data.success) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to remove member");
    }
  };

  const handleCancelInvitation = async (inviteId) => {
    try {
      const res = await API.delete(
        `/api/workspaces/${activeWorkspace._id}/invitations/${inviteId}`
      );
      if (res.data.success) {
        setInvitations((prev) => prev.filter((i) => i._id !== inviteId));
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to cancel invitation");
    }
  };

  const canManageMembers = ["owner", "admin"].includes(userRole);

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Team Members & Access
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage members, roles (Owner, Admin, Member, Viewer), and invitations for{" "}
            <strong>{activeWorkspace?.name}</strong>.
          </p>
        </div>

        {canManageMembers && (
          <Button onClick={() => setInviteModal(true)} size="sm">
            <UserPlus className="w-3.5 h-3.5 mr-1" />
            <span>Invite Member</span>
          </Button>
        )}
      </div>

      {/* Members Directory Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/75">
          <h3 className="text-sm font-bold text-slate-900">
            Workspace Members ({members.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined Date</th>
                {canManageMembers && <th className="py-3 px-4 w-20">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => {
                const isCurrentUser = m.user?._id === user?._id;
                const isOwner = m.role === "owner";

                return (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar user={m.user} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900">
                            {m.user?.name} {isCurrentUser && "(You)"}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            @{m.user?.username || m.user?.email?.split("@")[0]}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {m.user?.email}
                    </td>

                    <td className="py-3 px-4">
                      {isOwner || !canManageMembers || isCurrentUser ? (
                        <span
                          className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                            isOwner
                              ? "bg-purple-100 text-purple-700"
                              : m.role === "admin"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {m.role}
                        </span>
                      ) : (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.id, e.target.value)}
                          className="px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs font-semibold outline-none cursor-pointer shadow-2xs hover:border-slate-400"
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </td>

                    {canManageMembers && (
                      <td className="py-3 px-4">
                        {!isOwner && !isCurrentUser && (
                          <button
                            onClick={() => handleRemoveMember(m.id, m.user?.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition"
                            title="Remove from workspace"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations Section */}
      {canManageMembers && invitations.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/75">
            <h3 className="text-sm font-bold text-slate-900">
              Pending Invitations ({invitations.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {invitations.map((inv) => (
              <div
                key={inv._id}
                className="p-3.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{inv.email}</p>
                    <p className="text-[11px] text-slate-500">
                      Role: <span className="capitalize font-semibold text-slate-700">{inv.role}</span> • Invited by{" "}
                      {inv.invitedBy?.name || "Admin"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleCancelInvitation(inv._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition"
                    title="Cancel Invitation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModal}
        onClose={() => setInviteModal(false)}
        title={`Invite Member to ${activeWorkspace?.name}`}
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          {inviteError && (
            <div className="p-3 rounded-xl text-xs bg-rose-50 text-rose-700 border border-rose-200 font-medium">
              {inviteError}
            </div>
          )}

          {inviteSuccess && (
            <div className="p-3 rounded-xl text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{inviteSuccess}</span>
            </div>
          )}

          <Input
            label="Email Address *"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <Select
            label="Role *"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            options={[
              { value: "member", label: "Member (Can create, edit, move issues)" },
              { value: "admin", label: "Admin (Can manage projects, settings, invite members)" },
              { value: "viewer", label: "Viewer (Read-only access across workspace)" },
            ]}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setInviteModal(false)}
              disabled={inviting}
            >
              Cancel
            </Button>
            <Button type="submit" loading={inviting}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
