import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  AlertTriangle,
  FolderKanban,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { StatusBadge, PriorityBadge, IssueTypeBadge } from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeWorkspace, activeProject, projects, switchProject } = useWorkspace();

  const [myIssues, setMyIssues] = useState([]);
  const [overdueIssues, setOverdueIssues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!activeWorkspace?._id) return;

    try {
      // 1. My Assigned Tasks
      const myRes = await API.get(`/api/issues?assignee=${user?._id || user?.id}&limit=10`);
      if (myRes.data.success) {
        setMyIssues(myRes.data.issues || []);
      }

      // 2. Overdue Tasks
      const overRes = await API.get(`/api/issues?overdue=true&limit=6`);
      if (overRes.data.success) {
        setOverdueIssues(overRes.data.issues || []);
      }

      // 3. Workspace Analytics
      const anRes = await API.get("/api/analytics");
      if (anRes.data.success) {
        setAnalytics(anRes.data.data);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace, user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const summary = analytics?.summary || { total: 0, completed: 0, pending: 0, overdue: 0 };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Here is what's happening across <strong>{activeWorkspace?.name || "your workspace"}</strong> today.
            You have {myIssues.filter((i) => i.status !== "done").length} open tasks assigned to you.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {projects.length > 0 && (
            <button
              onClick={() => navigate(`/projects/${projects[0]._id}/board`)}
              className="px-4 py-2 rounded-lg bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 transition shadow-sm"
            >
              Open Active Board
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Projects</span>
            <FolderKanban className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {projects.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">{summary.total} total tracked issues</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">My Open Tasks</span>
            <CheckSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {myIssues.filter((i) => i.status !== "done").length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Across all workspace projects</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {summary.progress}%
          </div>
          <p className="text-xs text-slate-400 mt-1">{summary.completed} issues resolved</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {overdueIssues.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Due date has passed</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned to Me (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned to Me Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Assigned to Me
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {myIssues.length} tasks
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {myIssues.map((issue) => (
                <div
                  key={issue._id}
                  onClick={() =>
                    navigate(`/projects/${issue.project?._id || activeProject?._id}/board?issueKey=${issue.key}`)
                  }
                  className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between gap-4 transition cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <IssueTypeBadge type={issue.type} />
                    <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {issue.key}
                    </span>
                    <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                      {issue.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={issue.status} size="xs" />
                    <PriorityBadge priority={issue.priority} showLabel={false} size="xs" />
                  </div>
                </div>
              ))}

              {myIssues.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  You have no open tasks assigned right now. You're all caught up!
                </div>
              )}
            </div>
          </div>

          {/* Overdue Issues Card */}
          {overdueIssues.length > 0 && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                    Overdue Attention Needed
                  </h3>
                </div>
                <span className="text-xs font-semibold text-rose-600">
                  {overdueIssues.length} items
                </span>
              </div>

              <div className="divide-y divide-rose-100 dark:divide-rose-900/30">
                {overdueIssues.map((issue) => (
                  <div
                    key={issue._id}
                    onClick={() =>
                      navigate(`/projects/${issue.project?._id || activeProject?._id}/board?issueKey=${issue.key}`)
                    }
                    className="p-3.5 hover:bg-rose-50/60 dark:hover:bg-rose-950/20 flex items-center justify-between gap-4 transition cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-semibold text-rose-600">
                        {issue.key}
                      </span>
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {issue.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 text-slate-500">
                      <Avatar user={issue.assignee} size="xs" />
                      <span className="text-[11px] text-rose-600 font-semibold">
                        Due {new Date(issue.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Projects Quick Launch & Status Distribution */}
        <div className="space-y-6">
          {/* Projects Quick Directory */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Projects in Workspace
            </h3>

            <div className="space-y-2">
              {projects.map((p) => (
                <div
                  key={p._id}
                  onClick={() => {
                    switchProject(p._id);
                    navigate(`/projects/${p._id}/board`);
                  }}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700 bg-slate-50/50 dark:bg-slate-800/30 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: p.color || "#3B82F6" }}
                    />
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">{p.key}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Status Breakdown Bar */}
          {analytics?.statusDistribution && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Workspace Health
              </h3>
              <div className="space-y-2.5">
                {[
                  { label: "Backlog", count: analytics.statusDistribution.backlog, color: "bg-slate-400" },
                  { label: "To Do", count: analytics.statusDistribution.todo, color: "bg-blue-500" },
                  { label: "In Progress", count: analytics.statusDistribution.in_progress, color: "bg-amber-500" },
                  { label: "In Review", count: analytics.statusDistribution.in_review, color: "bg-purple-500" },
                  { label: "Done", count: analytics.statusDistribution.done, color: "bg-emerald-500" },
                ].map((s) => {
                  const pct = summary.total > 0 ? Math.round((s.count / summary.total) * 100) : 0;
                  return (
                    <div key={s.label} className="text-xs">
                      <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-300">
                        <span>{s.label}</span>
                        <span className="font-mono text-slate-400">{s.count}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-1.5 rounded-full ${s.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
