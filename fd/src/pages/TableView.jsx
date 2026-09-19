import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import API from "../api";
import { useWorkspace } from "../context/WorkspaceContext";
import { StatusBadge, PriorityBadge, IssueTypeBadge } from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import IssueFilters from "../components/issues/IssueFilters";
import IssueDetailDrawer from "../components/issues/IssueDetailDrawer";
import { TableSkeleton } from "../components/ui/Skeleton";
import { CheckCircle2 } from "lucide-react";

export default function TableView() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeWorkspace, activeProject } = useWorkspace();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssueKey, setSelectedIssueKey] = useState(
    searchParams.get("issueKey") || null
  );

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
      console.error("Failed to fetch table issues:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, activeProject, activeWorkspace, filters]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

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
        console.error("Error loading table meta:", e);
      }
    };
    loadMeta();
  }, [projectId, activeProject, activeWorkspace]);

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            {activeProject?.name || "Project"} — Table Grid
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Spreadsheet-style data grid with direct field access.
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

      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3 w-28">Key</th>
              <th className="py-2.5 px-3">Title</th>
              <th className="py-2.5 px-3 w-28">Type</th>
              <th className="py-2.5 px-3 w-32">Status</th>
              <th className="py-2.5 px-3 w-28">Priority</th>
              <th className="py-2.5 px-3 w-36">Sprint</th>
              <th className="py-2.5 px-3 w-24">Story Points</th>
              <th className="py-2.5 px-3 w-36">Assignee</th>
              <th className="py-2.5 px-3 w-28">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {issues.map((issue) => (
              <tr
                key={issue._id}
                onClick={() => {
                  setSelectedIssueKey(issue.key);
                  setSearchParams({ issueKey: issue.key });
                }}
                className="hover:bg-blue-50/40 transition cursor-pointer group"
              >
                <td className="py-2.5 px-3 text-blue-600 font-bold">
                  {issue.key}
                </td>
                <td className="py-2.5 px-3 font-sans text-xs text-slate-900 group-hover:text-blue-600 font-medium">
                  {issue.title}
                </td>
                <td className="py-2.5 px-3 font-sans">
                  <IssueTypeBadge type={issue.type} />
                </td>
                <td className="py-2.5 px-3 font-sans">
                  <StatusBadge status={issue.status} size="xs" />
                </td>
                <td className="py-2.5 px-3 font-sans">
                  <PriorityBadge priority={issue.priority} size="xs" />
                </td>
                <td className="py-2.5 px-3 font-sans text-slate-600 font-medium">
                  {issue.sprint?.name || "Backlog"}
                </td>
                <td className="py-2.5 px-3 text-slate-600 font-bold">
                  {issue.storyPoints !== null ? `${issue.storyPoints} pts` : "-"}
                </td>
                <td className="py-2.5 px-3 font-sans">
                  <div className="flex items-center gap-1.5">
                    <Avatar user={issue.assignee} size="xs" />
                    <span className="truncate text-slate-700 font-medium">
                      {issue.assignee?.name || "Unassigned"}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-slate-500 font-sans">
                  {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
