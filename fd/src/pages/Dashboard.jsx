import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  AlertTriangle,
  FolderKanban,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { StatusBadge, PriorityBadge, IssueTypeBadge } from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import { DashboardSkeleton } from "../components/ui/Skeleton";

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

  if (loading) {
    return <DashboardSkeleton />;
  }

  const summary = analytics?.summary || { total: 0, completed: 0, pending: 0, overdue: 0, progress: 0 };
  const openTasksCount = myIssues.filter((i) => i.status !== "done").length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Clean Bright SaaS Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workspace Overview</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            Here's what's happening across <strong>{activeWorkspace?.name || "your workspace"}</strong> today.
            You have <strong className="text-blue-600 font-semibold">{openTasksCount} open tasks</strong> waiting for your attention.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {projects.length > 0 && (
            <button
              onClick={() => navigate(`/projects/${projects[0]._id}/board`)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-xs shadow-blue-500/20 flex items-center gap-1.5"
            >
              <span>Open Active Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Projects</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {projects.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">{summary.total} total tracked issues</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">My Open Tasks</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {openTasksCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">Across all workspace projects</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completion Rate</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {summary.progress}%
          </div>
          <p className="text-xs text-slate-500 mt-1">{summary.completed} issues resolved</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Overdue Alerts</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">
            {overdueIssues.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Due date has passed</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned to Me & Overdue (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Assigned to Me Card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Assigned to Me
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {myIssues.length} tasks
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {myIssues.map((issue) => (
                <div
                  key={issue._id}
                  onClick={() =>
                    navigate(`/projects/${issue.project?._id || activeProject?._id}/board?issueKey=${issue.key}`)
                  }
                  className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3 sm:gap-4 transition cursor-pointer text-xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <IssueTypeBadge type={issue.type} />
                    <span className="font-mono font-bold text-blue-600 shrink-0">
                      {issue.key}
                    </span>
                    <span className="truncate font-medium text-slate-800 group-hover:text-blue-600 transition">
                      {issue.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <StatusBadge status={issue.status} size="xs" />
                    <PriorityBadge priority={issue.priority} showLabel={false} size="xs" />
                  </div>
                </div>
              ))}

              {myIssues.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">You're all caught up!</p>
                  <p>No open tasks assigned to you right now.</p>
                </div>
              )}
            </div>
          </div>

          {/* Overdue Issues Card */}
          {overdueIssues.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-white shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-rose-100 flex items-center justify-between bg-rose-50/50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-rose-900">
                    Overdue Attention Needed
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  {overdueIssues.length} items
                </span>
              </div>

              <div className="divide-y divide-rose-50">
                {overdueIssues.map((issue) => (
                  <div
                    key={issue._id}
                    onClick={() =>
                      navigate(`/projects/${issue.project?._id || activeProject?._id}/board?issueKey=${issue.key}`)
                    }
                    className="p-3.5 hover:bg-rose-50/40 flex items-center justify-between gap-3 sm:gap-4 transition cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-bold text-rose-600 shrink-0">
                        {issue.key}
                      </span>
                      <span className="truncate font-medium text-slate-800">
                        {issue.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                      <Avatar user={issue.assignee} size="xs" />
                      <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="hidden sm:inline">Due</span> {new Date(issue.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Projects Directory & Workspace Health */}
        <div className="space-y-6">
          {/* Projects Directory */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
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
                  className="p-3 rounded-xl border border-slate-100 hover:border-blue-300 bg-slate-50/60 hover:bg-blue-50/30 transition cursor-pointer flex items-center justify-between gap-3 text-xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: p.color || "#3B82F6" }}
                    />
                    <div className="truncate">
                      <p className="font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 font-medium">{p.key}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                </div>
              ))}

              {projects.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  No projects yet. Create one from the sidebar.
                </div>
              )}
            </div>
          </div>

          {/* Status Breakdown Bar */}
          {analytics?.statusDistribution && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-2xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Workspace Health
              </h3>
              <div className="space-y-3">
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
                      <div className="flex justify-between mb-1.5 font-medium text-slate-700">
                        <span>{s.label}</span>
                        <span className="font-mono text-slate-400">{s.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-2 rounded-full ${s.color} transition-all duration-300`} style={{ width: `${pct}%` }} />
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
