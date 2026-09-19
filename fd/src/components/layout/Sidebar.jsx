import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Kanban,
  ListFilter,
  Table,
  Zap,
  Calendar,
  BarChart3,
  Users,
  Settings,
  Plus,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  X,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import Modal from "../ui/Modal";
import { Input, Textarea } from "../ui/Input";
import Button from "../ui/Button";

export default function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeWorkspace, activeProject, projects, switchProject, createProject } = useWorkspace();
  const [collapsed, setCollapsed] = useState(false);
  const [createProjModal, setCreateProjModal] = useState(false);
  const [projName, setProjName] = useState("");
  const [projKey, setProjKey] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projColor, setProjColor] = useState("#2563EB");
  const [creatingProj, setCreatingProj] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  // Close mobile drawer on route change
  useEffect(() => {
    onCloseMobile();
  }, [location.pathname]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projName.trim() || !projKey.trim()) return;

    setCreatingProj(true);
    try {
      const res = await createProject({
        name: projName.trim(),
        key: projKey.toUpperCase().trim(),
        description: projDesc.trim(),
        color: projColor,
      });
      setProjName("");
      setProjKey("");
      setProjDesc("");
      setCreateProjModal(false);
      if (res.project) {
        navigate(`/projects/${res.project._id}/board`);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setCreatingProj(false);
    }
  };

  // Nav item helper
  const NavItem = ({ to, icon: Icon, label, badge, isMobile = false }) => (
    <NavLink
      to={to}
      onClick={() => {
        if (isMobile) onCloseMobile();
      }}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
          isActive
            ? "bg-blue-50 text-blue-700 font-bold shadow-2xs"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium"
        }`
      }
      title={collapsed && !isMobile ? label : undefined}
    >
      <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-700" />
      {(!collapsed || isMobile) && <span className="truncate">{label}</span>}
      {(!collapsed || isMobile) && badge !== undefined && (
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
          {badge}
        </span>
      )}
    </NavLink>
  );

  const sidebarContent = (isMobile = false) => (
    <div className="flex-1 overflow-y-auto p-3 space-y-6">
      {/* Workspace Views */}
      <div className="space-y-1">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" isMobile={isMobile} />
        <NavItem to="/my-tasks" icon={CheckSquare} label="Assigned to Me" isMobile={isMobile} />
      </div>

      {/* Projects Section */}
      <div className="space-y-1">
        {(!collapsed || isMobile) && (
          <div className="flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            <button
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex items-center gap-1 hover:text-slate-700 transition"
            >
              {projectsExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              <span>Projects</span>
            </button>
            <button
              onClick={() => setCreateProjModal(true)}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition"
              title="Create Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {projectsExpanded && (
          <div className="space-y-1">
            {projects.map((p) => {
              const isSelected = activeProject?._id === p._id;
              return (
                <div key={p._id}>
                  <button
                    onClick={() => {
                      switchProject(p._id);
                      navigate(`/projects/${p._id}/board`);
                      if (isMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition text-left ${
                      isSelected
                        ? "bg-slate-100 font-bold text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                    }`}
                    title={collapsed && !isMobile ? p.name : undefined}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: p.color || "#2563EB" }}
                    />
                    {(!collapsed || isMobile) && (
                      <span className="truncate flex-1">{p.name}</span>
                    )}
                    {(!collapsed || isMobile) && (
                      <span className="text-[10px] font-mono font-semibold text-slate-400">
                        {p.key}
                      </span>
                    )}
                  </button>

                  {/* Active Project Views Submenu */}
                  {isSelected && (!collapsed || isMobile) && (
                    <div className="ml-4 pl-2 my-1 border-l border-slate-200 space-y-0.5 animate-in fade-in duration-150">
                      <NavItem
                        to={`/projects/${p._id}/board`}
                        icon={Kanban}
                        label="Board"
                        isMobile={isMobile}
                      />
                      <NavItem
                        to={`/projects/${p._id}/list`}
                        icon={ListFilter}
                        label="List"
                        isMobile={isMobile}
                      />
                      <NavItem
                        to={`/projects/${p._id}/table`}
                        icon={Table}
                        label="Table"
                        isMobile={isMobile}
                      />
                      <NavItem
                        to={`/projects/${p._id}/sprints`}
                        icon={Zap}
                        label="Sprints"
                        isMobile={isMobile}
                      />
                      <NavItem
                        to={`/projects/${p._id}/calendar`}
                        icon={Calendar}
                        label="Calendar"
                        isMobile={isMobile}
                      />
                      <NavItem
                        to={`/projects/${p._id}/reports`}
                        icon={BarChart3}
                        label="Reports"
                        isMobile={isMobile}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workspace Admin */}
      <div className="space-y-1">
        {(!collapsed || isMobile) && (
          <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Workspace
          </div>
        )}
        <NavItem to="/team" icon={Users} label="Members & Roles" isMobile={isMobile} />
        <NavItem to="/settings" icon={Settings} label="Settings" isMobile={isMobile} />
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside
        className={`hidden md:flex h-[calc(100vh-3.5rem)] sticky top-14 bg-white border-r border-slate-200 flex-col transition-all duration-200 shrink-0 z-20 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent(false)}

        {/* Bottom Collapse Toggle (Desktop only) */}
        <div className="p-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs transition"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span className="font-medium text-slate-600">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* 2. Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />

          {/* Off-canvas Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Mobile Drawer Header */}
            <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/80">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>TaskFlow</span>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            {sidebarContent(true)}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={createProjModal}
        onClose={() => setCreateProjModal(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name *"
            placeholder="e.g. Mobile Client, Cloud API"
            value={projName}
            onChange={(e) => {
              setProjName(e.target.value);
              if (!projKey) {
                const words = e.target.value.trim().split(" ");
                const keySuggestion = words
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 4);
                if (keySuggestion.length >= 2) setProjKey(keySuggestion);
              }
            }}
            required
          />

          <Input
            label="Project Key * (2-6 uppercase characters)"
            placeholder="e.g. MOB, ENG, DEV"
            value={projKey}
            onChange={(e) => setProjKey(e.target.value.toUpperCase())}
            required
            maxLength={6}
          />

          <Textarea
            label="Description"
            placeholder="What is the mission of this project?"
            rows={3}
            value={projDesc}
            onChange={(e) => setProjDesc(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Theme Color
            </label>
            <div className="flex items-center gap-3">
              {["#2563EB", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4"].map(
                (color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setProjColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      projColor === color ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => setCreateProjModal(false)}
              disabled={creatingProj}
            >
              Cancel
            </Button>
            <Button type="submit" loading={creatingProj}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
