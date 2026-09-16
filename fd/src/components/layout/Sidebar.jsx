import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import Modal from "../ui/Modal";
import { Input, Textarea } from "../ui/Input";
import Button from "../ui/Button";

export default function Sidebar() {
  const navigate = useNavigate();
  const { activeWorkspace, activeProject, projects, switchProject, createProject } = useWorkspace();
  const [collapsed, setCollapsed] = useState(false);
  const [createProjModal, setCreateProjModal] = useState(false);
  const [projName, setProjName] = useState("");
  const [projKey, setProjKey] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projColor, setProjColor] = useState("#2563EB");
  const [creatingProj, setCreatingProj] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);

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
  const NavItem = ({ to, icon: Icon, label, badge }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
          isActive
            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
        }`
      }
      title={collapsed ? label : undefined}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && badge !== undefined && (
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {badge}
        </span>
      )}
    </NavLink>
  );

  return (
    <>
      <aside
        className={`h-[calc(100vh-3.5rem)] sticky top-14 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200 shrink-0 z-20 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Navigation Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Workspace Views */}
          <div className="space-y-1">
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/my-tasks" icon={CheckSquare} label="Assigned to Me" />
          </div>

          {/* Projects Section */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                <button
                  onClick={() => setProjectsExpanded(!projectsExpanded)}
                  className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition"
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
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
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
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition text-left ${
                          isSelected
                            ? "bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-100"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                        title={collapsed ? p.name : undefined}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.color || "#3B82F6" }}
                        />
                        {!collapsed && <span className="truncate flex-1">{p.name}</span>}
                        {!collapsed && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {p.key}
                          </span>
                        )}
                      </button>

                      {/* Active Project Views Submenu */}
                      {isSelected && !collapsed && (
                        <div className="ml-4 pl-2 my-1 border-l border-slate-200 dark:border-slate-800 space-y-0.5 animate-in fade-in duration-150">
                          <NavItem
                            to={`/projects/${p._id}/board`}
                            icon={Kanban}
                            label="Board"
                          />
                          <NavItem
                            to={`/projects/${p._id}/list`}
                            icon={ListFilter}
                            label="List"
                          />
                          <NavItem
                            to={`/projects/${p._id}/table`}
                            icon={Table}
                            label="Table"
                          />
                          <NavItem
                            to={`/projects/${p._id}/sprints`}
                            icon={Zap}
                            label="Sprints"
                          />
                          <NavItem
                            to={`/projects/${p._id}/calendar`}
                            icon={Calendar}
                            label="Calendar"
                          />
                          <NavItem
                            to={`/projects/${p._id}/reports`}
                            icon={BarChart3}
                            label="Reports"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Team & Admin */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Workspace
              </div>
            )}
            <NavItem to="/team" icon={Users} label="Members & Roles" />
            <NavItem to="/settings" icon={Settings} label="Settings" />
          </div>
        </div>

        {/* Bottom Collapse Toggle */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
