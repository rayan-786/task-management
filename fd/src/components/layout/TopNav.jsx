import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  ChevronDown,
  Building2,
  Check,
  User,
  Settings,
  LogOut,
  Sparkles,
  Menu,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import Avatar from "../ui/Avatar";
import NotificationPopover from "./NotificationPopover";
import Modal from "../ui/Modal";
import { Input, Textarea } from "../ui/Input";
import Button from "../ui/Button";

export default function TopNav({ onOpenSearch, onOpenCreateIssue, onToggleMobileSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace } = useWorkspace();

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
      <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        {/* Left: Mobile Menu, Brand & Workspace Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo */}
          <div
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 cursor-pointer font-bold text-slate-900 text-base sm:text-lg tracking-tight select-none mr-1 sm:mr-2 shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/30">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="hidden xs:inline">TaskFlow</span>
          </div>

          {/* Workspace Switcher Dropdown */}
          <div className="relative" ref={wsRef}>
            <button
              onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-[140px]">
                {activeWorkspace?.name || "Workspace"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {wsDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-white border border-slate-200 shadow-xl z-50 p-1.5 animate-in zoom-in-95 duration-100">
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
                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition text-left"
                    >
                      <span className="truncate font-medium">{w.name}</span>
                      {activeWorkspace?._id === w._id && (
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-1.5 mt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setWsDropdownOpen(false);
                      setCreateWsModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition font-semibold text-left"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Trigger (Desktop) */}
        <div className="flex-1 max-w-md mx-3 hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/75 hover:bg-slate-100 text-slate-400 text-xs transition"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search issues, projects, or commands...</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white border border-slate-200 rounded shadow-2xs text-slate-500">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Create Button */}
          <button
            onClick={onOpenCreateIssue}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create</span>
          </button>

          {/* Notifications */}
          <NotificationPopover />

          {/* User Profile Menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-blue-500/20 transition"
            >
              <Avatar user={user} size="sm" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white border border-slate-200 shadow-xl z-50 p-1.5 animate-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
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
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition text-left font-medium"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Workspace Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/settings?tab=profile");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition text-left font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Profile Preferences</span>
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition text-left font-semibold"
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
