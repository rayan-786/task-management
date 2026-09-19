import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ArrowUpDown, Calendar, CheckCircle2 } from "lucide-react";
import API from "../api";
import { useWorkspace } from "../context/WorkspaceContext";
import { StatusBadge, PriorityBadge, IssueTypeBadge } from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import IssueFilters from "../components/issues/IssueFilters";
import IssueDetailDrawer from "../components/issues/IssueDetailDrawer";
import { TableSkeleton } from "../components/ui/Skeleton";

export default function ListView() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeWorkspace, activeProject } = useWorkspace();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssueKey, setSelectedIssueKey] = useState(
    searchParams.get("issueKey") || null
  );

  const [sortBy, setSortBy] = useState("order");
  const [sortOrder, setSortOrder] = useState("asc");

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    priority: "",
    assignee: "",
    sprint: "",
  });

  const [members, setMembers] = useState([]);
  const [sprints, setSprints] = useState([]);

  const fetchIssues = useCallback(async () => {
    const targetProjId = projectId || activeProject?._id;
    if (!targetProjId || !activeWorkspace?._id) return;

    try {
      const params = new URLSearchParams({
        projectId: targetProjId,
        sortBy,
        sortOrder,
      });
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
      console.error("Failed to load list issues:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, activeProject, activeWorkspace, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Load members and sprints
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
        console.error("Error loading list meta:", e);
      }
    };
    loadMeta();
  }, [projectId, activeProject, activeWorkspace]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const updateStatusInline = async (issueId, newStatus) => {
    try {
      await API.put(`/api/issues/${issueId}`, { status: newStatus });
      setIssues((prev) =>
        prev.map((i) => (i._id === issueId ? { ...i, status: newStatus } : i))
      );
    } catch (err) {
      console.error("Failed to update status inline:", err);
    }
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            {activeProject?.name || "Project"} — List View
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Compact tabular overview of all tasks with inline quick editing.
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

      {/* List Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-28">
                  <button
                    onClick={() => toggleSort("key")}
                    className="flex items-center gap-1 hover:text-slate-900 transition"
                  >
                    <span>Key</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    onClick={() => toggleSort("title")}
                    className="flex items-center gap-1 hover:text-slate-900 transition"
                  >
                    <span>Title</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th className="py-3 px-4 w-32">Status</th>
                <th className="py-3 px-4 w-28">Priority</th>
                <th className="py-3 px-4 w-24">Points</th>
                <th className="py-3 px-4 w-36">Assignee</th>
                <th className="py-3 px-4 w-32">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {issues.map((issue) => (
                <tr
                  key={issue._id}
                  className="hover:bg-slate-50/80 transition cursor-pointer group"
                  onClick={() => {
                    setSelectedIssueKey(issue.key);
                    setSearchParams({ issueKey: issue.key });
                  }}
                >
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">
                    <div className="flex items-center gap-1.5">
                      <IssueTypeBadge type={issue.type} />
                      <span>{issue.key}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 group-hover:text-blue-600 transition">
                    <span className="truncate block max-w-md">{issue.title}</span>
                  </td>
                  <td
                    className="py-3 px-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={issue.status}
                      onChange={(e) => updateStatusInline(issue._id, e.target.value)}
                      className="text-xs bg-transparent border border-transparent hover:border-slate-200 rounded px-1.5 py-0.5 outline-none font-medium cursor-pointer text-slate-700"
                    >
                      <option value="backlog">Backlog</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Done</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={issue.priority} size="xs" />
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 font-semibold">
                    {issue.storyPoints !== null ? `${issue.storyPoints} pts` : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Avatar user={issue.assignee} size="xs" />
                      <span className="truncate text-slate-700 font-medium">
                        {issue.assignee?.name || "Unassigned"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {issue.dueDate ? (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(issue.dueDate).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {issues.length === 0 && !loading && (
          <div className="p-12 text-center text-xs text-slate-400 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="font-bold text-slate-700">No issues found</p>
            <p>Try clearing or adjusting your search filters.</p>
          </div>
        )}
      </div>

      <IssueDetailDrawer
        issueKey={selectedIssueKey}
        isOpen={Boolean(selectedIssueKey)}
        onClose={() => {
          setSelectedIssueKey(null);
          setSearchParams({});
        }}
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
