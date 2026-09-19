import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FolderKanban, Plus, ArrowRight, X } from "lucide-react";
import API from "../../api";
import { useWorkspace } from "../../context/WorkspaceContext";
import { StatusBadge, PriorityBadge } from "../ui/Badge";

export default function CommandPalette({ isOpen, onClose, onOpenCreateIssue }) {
  const navigate = useNavigate();
  const { activeWorkspace, activeProject, switchProject } = useWorkspace();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ issues: [], projects: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(false);
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults({ issues: [], projects: [] });
      return;
    }

    if (!query.trim()) {
      setResults({ issues: [], projects: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await API.get(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.data.success) {
          setResults(res.data.results);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search issues, projects, or commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 outline-none text-xs sm:text-sm font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-80 sm:max-h-96 overflow-y-auto p-2">
          {/* Quick Actions */}
          {!query && (
            <div className="p-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-2">
                Quick Actions
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateIssue();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg text-left transition font-medium"
              >
                <Plus className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Create New Issue</span>
                <span className="ml-auto text-[10px] font-mono text-slate-400">Press 'C'</span>
              </button>
            </div>
          )}

          {/* Projects Results */}
          {results.projects?.length > 0 && (
            <div className="p-1.5 border-t border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-2">
                Projects
              </div>
              {results.projects.map((p) => (
                <button
                  key={p._id}
                  onClick={() => {
                    switchProject(p._id);
                    navigate(`/projects/${p._id}/board`);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg text-left transition font-medium"
                >
                  <FolderKanban
                    className="w-4 h-4 shrink-0"
                    style={{ color: p.color || "#3B82F6" }}
                  />
                  <span className="font-semibold text-slate-900 truncate">{p.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">[{p.key}]</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </button>
              ))}
            </div>
          )}

          {/* Issues Results */}
          {results.issues?.length > 0 && (
            <div className="p-1.5 border-t border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-2">
                Issues
              </div>
              {results.issues.map((i) => (
                <button
                  key={i._id}
                  onClick={() => {
                    navigate(`/projects/${i.project?._id || activeProject?._id}/board?issueKey=${i.key}`);
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg text-left transition font-medium"
                >
                  <span className="font-mono font-bold text-blue-600 shrink-0">
                    {i.key}
                  </span>
                  <span className="truncate flex-1 text-slate-800">{i.title}</span>
                  <StatusBadge status={i.status} size="xs" />
                  <PriorityBadge priority={i.priority} showLabel={false} size="xs" />
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query && !loading && results.issues?.length === 0 && results.projects?.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No results found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
