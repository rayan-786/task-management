import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckSquare, Calendar, Filter } from "lucide-react";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { StatusBadge, PriorityBadge, IssueTypeBadge } from "../components/ui/Badge";
import IssueDetailDrawer from "../components/issues/IssueDetailDrawer";

export default function MyTasks() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIssueKey, setSelectedIssueKey] = useState(
    searchParams.get("issueKey") || null
  );

  const fetchMyTasks = useCallback(async () => {
    if (!activeWorkspace?._id || !user) return;
    try {
      const res = await API.get(`/api/issues?assignee=${user._id || user.id}&limit=200`);
      if (res.data.success) {
        setIssues(res.data.issues || []);
      }
    } catch (err) {
      console.error("Failed to load my tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace, user]);

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  const filteredIssues =
    statusFilter === "all"
      ? issues
      : statusFilter === "open"
      ? issues.filter((i) => i.status !== "done")
      : issues.filter((i) => i.status === statusFilter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Assigned to Me
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personal focus view of all issues assigned to you across all projects in{" "}
            <strong>{activeWorkspace?.name}</strong>.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          {[
            { id: "all", label: "All" },
            { id: "open", label: "Open" },
            { id: "in_progress", label: "In Progress" },
            { id: "done", label: "Done" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-md transition ${
                statusFilter === tab.id
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-28">Key</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4 w-36">Project</th>
                <th className="py-3 px-4 w-32">Status</th>
                <th className="py-3 px-4 w-28">Priority</th>
                <th className="py-3 px-4 w-28">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredIssues.map((issue) => (
                <tr
                  key={issue._id}
                  onClick={() => {
                    setSelectedIssueKey(issue.key);
                    setSearchParams({ issueKey: issue.key });
                  }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                    <div className="flex items-center gap-1.5">
                      <IssueTypeBadge type={issue.type} />
                      <span>{issue.key}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    <span className="truncate block max-w-md">{issue.title}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {issue.project?.name}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={issue.status} size="xs" />
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={issue.priority} size="xs" />
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {issue.dueDate ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(issue.dueDate).toLocaleDateString()}</span>
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

        {filteredIssues.length === 0 && !loading && (
          <div className="p-12 text-center text-sm text-slate-400">
            No tasks found matching "{statusFilter}".
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
        onUpdated={fetchMyTasks}
        onDeleted={fetchMyTasks}
      />
    </div>
  );
}
