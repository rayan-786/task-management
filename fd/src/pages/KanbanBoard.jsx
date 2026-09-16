import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Plus, MoreHorizontal, AlertCircle } from "lucide-react";
import API from "../api";
import { useWorkspace } from "../context/WorkspaceContext";
import { useSocket } from "../context/SocketContext";
import IssueCard from "../components/issues/IssueCard";
import IssueFilters from "../components/issues/IssueFilters";
import IssueDetailDrawer from "../components/issues/IssueDetailDrawer";

const COLUMNS = [
  { id: "backlog", title: "Backlog", dot: "bg-slate-400" },
  { id: "todo", title: "To Do", dot: "bg-blue-500" },
  { id: "in_progress", title: "In Progress", dot: "bg-amber-500" },
  { id: "in_review", title: "In Review", dot: "bg-purple-500" },
  { id: "done", title: "Done", dot: "bg-emerald-500" },
];

export default function KanbanBoard() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeWorkspace, activeProject } = useWorkspace();
  const { socket } = useSocket();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssueKey, setSelectedIssueKey] = useState(
    searchParams.get("issueKey") || null
  );

  // Quick inline add card per column
  const [quickAddCol, setQuickAddCol] = useState(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickLoading, setQuickLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    priority: "",
    assignee: "",
    sprint: "",
  });

  const [members, setMembers] = useState([]);
  const [sprints, setSprints] = useState([]);

  // Fetch issues
  const fetchBoardIssues = useCallback(async () => {
    const targetProjId = projectId || activeProject?._id;
    if (!targetProjId || !activeWorkspace?._id) return;

    try {
      const params = new URLSearchParams({ projectId: targetProjId });
      if (filters.search) params.append("search", filters.search);
      if (filters.type) params.append("type", filters.type);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.assignee) params.append("assignee", filters.assignee);
      if (filters.sprint) params.append("sprint", filters.sprint);

      const res = await API.get(`/api/issues?${params.toString()}`);
      if (res.data.success) {
        setIssues(res.data.issues || []);
      }
    } catch (err) {
      console.error("Failed to fetch board issues:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, activeProject, activeWorkspace, filters]);

  useEffect(() => {
    fetchBoardIssues();
  }, [fetchBoardIssues]);

  // Load project metadata
  useEffect(() => {
    const targetProjId = projectId || activeProject?._id;
    if (!targetProjId || !activeWorkspace?._id) return;

    const loadMeta = async () => {
      try {
        const wsRes = await API.get(`/api/workspaces/${activeWorkspace._id}`);
        if (wsRes.data.success) setMembers(wsRes.data.members || []);

        const spRes = await API.get(`/api/sprints/project/${targetProjId}`);
        if (spRes.data.success) setSprints(spRes.data.sprints || []);
      } catch (e) {
        console.error("Error loading board meta:", e);
      }
    };
    loadMeta();
  }, [projectId, activeProject, activeWorkspace]);

  // Socket.IO event listeners for live board updates
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (newIssue) => {
      setIssues((prev) => {
        if (prev.some((i) => i._id === newIssue._id)) return prev;
        return [...prev, newIssue];
      });
    };

    const handleUpdated = (updated) => {
      setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
    };

    const handleMoved = ({ issueId, status, order, updatedIssue }) => {
      setIssues((prev) =>
        prev.map((i) => (i._id === issueId ? { ...i, status, order, ...(updatedIssue || {}) } : i))
      );
    };

    const handleDeleted = ({ issueId }) => {
      setIssues((prev) => prev.filter((i) => i._id !== issueId));
    };

    socket.on("issue:created", handleCreated);
    socket.on("issue:updated", handleUpdated);
    socket.on("issue:moved", handleMoved);
    socket.on("issue:deleted", handleDeleted);

    const onGlobalCreate = () => fetchBoardIssues();
    window.addEventListener("taskflow:issue-created", onGlobalCreate);

    return () => {
      socket.off("issue:created", handleCreated);
      socket.off("issue:updated", handleUpdated);
      socket.off("issue:moved", handleMoved);
      socket.off("issue:deleted", handleDeleted);
      window.removeEventListener("taskflow:issue-created", onGlobalCreate);
    };
  }, [socket, fetchBoardIssues]);

  // URL sync with issue key
  useEffect(() => {
    const paramKey = searchParams.get("issueKey");
    if (paramKey && paramKey !== selectedIssueKey) {
      setSelectedIssueKey(paramKey);
    }
  }, [searchParams]);

  const openDrawer = (issue) => {
    setSelectedIssueKey(issue.key);
    setSearchParams({ issueKey: issue.key });
  };

  const closeDrawer = () => {
    setSelectedIssueKey(null);
    setSearchParams({});
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData("text/plain");
    if (!issueId) return;

    const currentIssue = issues.find((i) => i._id === issueId);
    if (!currentIssue || currentIssue.status === targetStatus) return;

    // Optimistic update
    const previousStatus = currentIssue.status;
    setIssues((prev) =>
      prev.map((i) => (i._id === issueId ? { ...i, status: targetStatus } : i))
    );

    try {
      await API.put(`/api/issues/${issueId}/move`, { status: targetStatus });
    } catch (err) {
      console.error("Failed to move issue on server:", err);
      // Rollback on failure
      setIssues((prev) =>
        prev.map((i) => (i._id === issueId ? { ...i, status: previousStatus } : i))
      );
      alert("Failed to update status on server. Reverted.");
    }
  };

  // Quick Add Issue
  const handleQuickAdd = async (status) => {
    if (!quickTitle.trim()) return;
    const targetProjId = projectId || activeProject?._id;
    if (!targetProjId) return;

    setQuickLoading(true);
    try {
      const res = await API.post("/api/issues", {
        projectId: targetProjId,
        title: quickTitle.trim(),
        status,
      });
      if (res.data.success) {
        setIssues((prev) => [...prev, res.data.issue]);
        setQuickTitle("");
        setQuickAddCol(null);
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create issue");
    } finally {
      setQuickLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {activeProject?.name || "Project Board"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage issues, track progress, and drag cards across development stages.
          </p>
        </div>
      </div>

      <IssueFilters
        filters={filters}
        onChange={(k, v) => setFilters((prev) => ({ ...prev, [k]: v }))}
        onClear={() =>
          setFilters({ search: "", type: "", priority: "", assignee: "", sprint: "" })
        }
        members={members}
        sprints={sprints}
      />

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start pb-6">
        {COLUMNS.map((col) => {
          const colIssues = issues.filter((i) => i.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 p-3 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase">
                    {col.title}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                    {colIssues.length}
                  </span>
                </div>
                <button
                  onClick={() => setQuickAddCol(quickAddCol === col.id ? null : col.id)}
                  className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 transition"
                  title="Quick add issue"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Add Input */}
              {quickAddCol === col.id && (
                <div className="mb-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-400 shadow-sm animate-in fade-in duration-150">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Issue title... (Enter to save)"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleQuickAdd(col.id);
                      if (e.key === "Escape") setQuickAddCol(null);
                    }}
                    className="w-full text-xs bg-transparent outline-none text-slate-900 dark:text-slate-100 mb-2"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setQuickAddCol(null)}
                      className="px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleQuickAdd(col.id)}
                      disabled={quickLoading || !quickTitle.trim()}
                      className="px-2.5 py-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Cards Container */}
              <div className="flex-1 space-y-2.5 overflow-y-auto">
                {colIssues.map((issue) => (
                  <IssueCard
                    key={issue._id}
                    issue={issue}
                    onClick={openDrawer}
                  />
                ))}

                {colIssues.length === 0 && (
                  <div className="h-24 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800/80 rounded-lg text-[11px] text-slate-400 select-none">
                    Drop cards here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-Over Issue Detail Drawer */}
      <IssueDetailDrawer
        issueKey={selectedIssueKey}
        isOpen={Boolean(selectedIssueKey)}
        onClose={closeDrawer}
        onUpdated={(updated) => {
          setIssues((prev) =>
            prev.map((i) => (i._id === updated._id ? updated : i))
          );
        }}
        onDeleted={(deletedId) => {
          setIssues((prev) => prev.filter((i) => i._id !== deletedId));
        }}
      />
    </div>
  );
}
