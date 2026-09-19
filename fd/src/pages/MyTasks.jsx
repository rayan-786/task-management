import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckSquare, Calendar, CheckCircle2 } from "lucide-react";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { StatusBadge, PriorityBadge, IssueTypeBadge } from "../components/ui/Badge";
import IssueDetailDrawer from "../components/issues/IssueDetailDrawer";
import { TableSkeleton } from "../components/ui/Skeleton";

export default function MyTasks() {
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

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Assigned to Me
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Personal focus view of all issues assigned to you across <strong>{activeWorkspace?.name}</strong>.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: "all", label: "All" },
            { id: "open", label: "Open" },
            { id: "in_progress", label: "In Progress" },
            { id: "done", label: "Done" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-28">Key</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4 w-36">Project</th>
                <th className="py-3 px-4 w-32">Status</th>
                <th className="py-3 px-4 w-28">Priority</th>
                <th className="py-3 px-4 w-32">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.map((issue) => (
                <tr
                  key={issue._id}
                  onClick={() => {
                    setSelectedIssueKey(issue.key);
                    setSearchParams({ issueKey: issue.key });
                  }}
                  className="hover:bg-slate-50/80 transition cursor-pointer group"
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
                  <td className="py-3 px-4 text-slate-600">
                    <span className="font-semibold text-slate-800">
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
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
          <div className="p-12 text-center text-xs text-slate-400 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700">No tasks found</p>
            <p>No issues match the "{statusFilter}" filter.</p>
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
