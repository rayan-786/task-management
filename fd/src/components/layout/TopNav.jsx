import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Moon,
  Sun,
  ChevronDown,
  Building2,
  Check,
  User,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useTheme } from "../../context/ThemeContext";
import Avatar from "../ui/Avatar";
import NotificationPopover from "./NotificationPopover";
import Modal from "../ui/Modal";
import { Input, Textarea } from "../ui/Input";
import Button from "../ui/Button";

export default function TopNav({ onOpenSearch, onOpenCreateIssue }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace } = useWorkspace();
  const { isDark, toggleTheme } = useTheme();

  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [createWsModal, setCreateWsModal] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [newWsDesc, setNewWsDesc] = useState("");
  const [creatingWs, setCreatingWs] = useState(false);

  const wsRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (wsRef.current && !wsRef.current.contains(e.target)) {
        setWsDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    setCreatingWs(true);
    try {
      await createWorkspace(newWsName.trim(), newWsDesc.trim());
      setNewWsName("");
      setNewWsDesc("");
      setCreateWsModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setCreatingWs(false);
    }
  };

  return (
    <>
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Brand & Workspace Switcher */}
        <div className="flex items-center gap-3">
          {/* Brand Logo */}
          <div
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 cursor-pointer font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight select-none mr-2"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>TaskFlow</span>
          </div>

          {/* Workspace Switcher Dropdown */}
          <div className="relative" ref={wsRef}>
            <button
              onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[130px]">
                {activeWorkspace?.name || "Select Workspace"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {wsDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-1.5 animate-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Workspaces
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {workspaces.map((w) => (
                    <button
                      key={w._id}
                      onClick={() => {
                        switchWorkspace(w._id);
                        setWsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition text-left"
                    >
                      <span className="truncate font-medium">{w.name}</span>
                      {activeWorkspace?._id === w._id && (
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setWsDropdownOpen(false);
                      setCreateWsModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition font-medium text-left"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Trigger (Linear style) */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-400 text-xs transition"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search issues, projects, or commands...</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Create Button */}
          <button
            onClick={onOpenCreateIssue}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create</span>
          </button>

          {/* Notifications */}
          <NotificationPopover />

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile Menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-blue-500/30 transition"
            >
              <Avatar user={user} size="sm" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-1.5 animate-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="pt-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/settings");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Workspace Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/settings?tab=profile");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition text-left"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Profile Preferences</span>
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Create Workspace Modal */}
      <Modal
        isOpen={createWsModal}
        onClose={() => setCreateWsModal(false)}
        title="Create New Workspace"
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <Input
            label="Workspace Name *"
            placeholder="e.g. Acme Corp, Engineering, Marketing"
            value={newWsName}
            onChange={(e) => setNewWsName(e.target.value)}
            required
          />
          <Textarea
            label="Description (Optional)"
            placeholder="Brief purpose of this workspace..."
            rows={3}
            value={newWsDesc}
            onChange={(e) => setNewWsDesc(e.target.value)}
          />
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => setCreateWsModal(false)}
              disabled={creatingWs}
            >
              Cancel
            </Button>
            <Button type="submit" loading={creatingWs}>
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
