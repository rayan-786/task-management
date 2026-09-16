import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { User, Building2, CreditCard, Shield, Check, AlertTriangle, KeyRound } from "lucide-react";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import Button from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import Avatar from "../components/ui/Avatar";

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, updateProfile } = useAuth();
  const { activeWorkspace, userRole, refreshWorkspaces } = useWorkspace();

  const activeTab = searchParams.get("tab") || "profile";
  const setTab = (t) => setSearchParams({ tab: t });

  // Profile Form
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  // Workspace Settings Form
  const [wsName, setWsName] = useState(activeWorkspace?.name || "");
  const [wsDesc, setWsDesc] = useState(activeWorkspace?.description || "");
  const [savingWs, setSavingWs] = useState(false);
  const [wsMsg, setWsMsg] = useState("");

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      setProfileMsg("Profile updated successfully!");
      setTimeout(() => setProfileMsg(""), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setSavingPassword(true);
    setPasswordMsg({ type: "", text: "" });
    try {
      const res = await API.put("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        setPasswordMsg({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordMsg({ type: "", text: "" }), 3000);
      }
    } catch (err) {
      setPasswordMsg({
        type: "error",
        text: err.response?.data?.msg || "Failed to update password",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleWorkspaceSave = async (e) => {
    e.preventDefault();
    if (!activeWorkspace) return;

    setSavingWs(true);
    setWsMsg("");
    try {
      const res = await API.put(`/api/workspaces/${activeWorkspace._id}`, {
        name: wsName.trim(),
        description: wsDesc.trim(),
      });
      if (res.data.success) {
        setWsMsg("Workspace updated successfully!");
        refreshWorkspaces();
        setTimeout(() => setWsMsg(""), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to update workspace");
    } finally {
      setSavingWs(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace) return;
    if (
      !window.confirm(
        `DANGER: Are you sure you want to permanently delete workspace '${activeWorkspace.name}' and all its projects and tickets? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await API.delete(`/api/workspaces/${activeWorkspace._id}`);
      if (res.data.success) {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to delete workspace");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Account & Workspace Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage profile preferences, workspace configurations, and subscription plan limits.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px text-xs font-semibold">
        <button
          onClick={() => setTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => setTab("workspace")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
            activeTab === "workspace"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Workspace</span>
        </button>

        <button
          onClick={() => setTab("billing")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
            activeTab === "billing"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Plans & Limits</span>
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === "profile" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Personal Info Card */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Personal Information
            </h3>

            <div className="flex items-center gap-4">
              <Avatar user={user} size="lg" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>

            {profileMsg && (
              <div className="p-3 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email"
                value={user?.email || ""}
                disabled
                helperText="Email cannot be changed"
              />

              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10 digit phone"
              />

              <Button type="submit" loading={savingProfile} size="sm">
                Save Profile
              </Button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4 max-w-lg">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-500" />
              <span>Change Password</span>
            </h3>

            {passwordMsg.text && (
              <div
                className={`p-3 text-xs rounded-lg border ${
                  passwordMsg.type === "error"
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-800"
                    : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-800"
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" loading={savingPassword} size="sm">
                Update Password
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Workspace Settings */}
      {activeTab === "workspace" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Workspace Profile
            </h3>

            {wsMsg && (
              <div className="p-3 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                {wsMsg}
              </div>
            )}

            <form onSubmit={handleWorkspaceSave} className="space-y-4">
              <Input
                label="Workspace Name"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                disabled={!["owner", "admin"].includes(userRole)}
                required
              />

              <Input
                label="Workspace Slug (URL key)"
                value={activeWorkspace?.slug || ""}
                disabled
                helperText="Generated unique slug for this tenant"
              />

              <Textarea
                label="Description"
                value={wsDesc}
                onChange={(e) => setWsDesc(e.target.value)}
                disabled={!["owner", "admin"].includes(userRole)}
                rows={3}
              />

              {["owner", "admin"].includes(userRole) && (
                <Button type="submit" loading={savingWs} size="sm">
                  Save Changes
                </Button>
              )}
            </form>
          </div>

          {/* Danger Zone */}
          {userRole === "owner" && (
            <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 shadow-2xs space-y-3 max-w-xl">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Danger Zone</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Deleting this workspace permanently deletes all projects, issues, sprints, and team
                memberships.
              </p>
              <button
                onClick={handleDeleteWorkspace}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition"
              >
                Delete Workspace
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Plans & Entitlements */}
      {activeTab === "billing" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Tier */}
            <div
              className={`p-6 rounded-2xl border ${
                activeWorkspace?.plan === "free"
                  ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              } shadow-2xs space-y-4`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">Free</h4>
                {activeWorkspace?.plan === "free" && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                $0 <span className="text-xs font-normal text-slate-400">/ forever</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Up to 10 Workspace Members</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Up to 5 Projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Kanban & List Views</span>
                </li>
              </ul>
            </div>

            {/* Pro Tier */}
            <div
              className={`p-6 rounded-2xl border ${
                activeWorkspace?.plan === "pro"
                  ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              } shadow-2xs space-y-4`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">Pro</h4>
                {activeWorkspace?.plan === "pro" && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                $12 <span className="text-xs font-normal text-slate-400">/ user / mo</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited Workspace Members</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited Projects & Sprints</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Advanced Velocity & Cycle Time</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Socket.IO Real-Time Streaming</span>
                </li>
              </ul>
            </div>

            {/* Enterprise */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">Enterprise</h4>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                Custom
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dedicated Multi-Region Database</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Custom SAML SSO & SCIM</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Audit Log Compliance Export</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
