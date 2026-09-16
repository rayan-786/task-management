import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  BarChart2,
} from "lucide-react";
import API from "../api";
import { useWorkspace } from "../context/WorkspaceContext";
import Avatar from "../components/ui/Avatar";

export default function AnalyticsReports() {
  const { projectId } = useParams();
  const { activeWorkspace, activeProject } = useWorkspace();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    const targetProjId = projectId || activeProject?._id;
    if (!activeWorkspace?._id) return;

    try {
      const query = targetProjId ? `?projectId=${targetProjId}` : "";
      const res = await API.get(`/api/analytics${query}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, activeProject, activeWorkspace]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-sm text-slate-400">
        Loading analytics metrics...
      </div>
    );
  }

  const { summary, statusDistribution, priorityDistribution, workload, velocity } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Analytics & Velocity Reports
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Real-time delivery velocity, cycle times, status breakdown, and workload distribution.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Issues */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Issues</span>
            <BarChart2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {summary.total}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {summary.completed} completed ({summary.progress}%)
          </p>
        </div>

        {/* Completed Issues */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {summary.completed}
          </div>
          <p className="text-xs text-slate-400 mt-1">{summary.pending} remaining open</p>
        </div>

        {/* Avg Cycle Time */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Cycle Time</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {summary.avgCycleTimeDays}{" "}
            <span className="text-sm font-normal text-slate-400">days</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">From creation to done</p>
        </div>

        {/* Overdue */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue Items</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {summary.overdue}
          </div>
          <p className="text-xs text-slate-400 mt-1">Requires immediate attention</p>
        </div>
      </div>

      {/* Velocity Bar Chart (Last 7 Days) */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Velocity (7-Day Throughput)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Created vs Completed issues over the past week
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-500" />
              <span>Created</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500" />
              <span>Completed</span>
            </span>
          </div>
        </div>

        {/* Chart Bars */}
        <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 dark:border-slate-800">
          {velocity.map((v, i) => {
            const maxVal = Math.max(
              ...velocity.map((item) => Math.max(item.created, item.completed, 1))
            );
            const createdHeight = (v.created / maxVal) * 120;
            const completedHeight = (v.completed / maxVal) * 120;

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="flex items-end gap-1.5 w-full max-w-[40px] justify-center">
                  <div
                    title={`Created: ${v.created}`}
                    style={{ height: `${Math.max(createdHeight, 4)}px` }}
                    className="w-3.5 bg-blue-500 rounded-t-sm transition-all duration-300"
                  />
                  <div
                    title={`Completed: ${v.completed}`}
                    style={{ height: `${Math.max(completedHeight, 4)}px` }}
                    className="w-3.5 bg-emerald-500 rounded-t-sm transition-all duration-300"
                  />
                </div>
                <span className="text-[11px] text-slate-400 font-medium">{v.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Status Breakdown & Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Status Breakdown
          </h3>
          <div className="space-y-3">
            {[
              { label: "Backlog", count: statusDistribution.backlog, color: "bg-slate-400" },
              { label: "To Do", count: statusDistribution.todo, color: "bg-blue-500" },
              { label: "In Progress", count: statusDistribution.in_progress, color: "bg-amber-500" },
              { label: "In Review", count: statusDistribution.in_review, color: "bg-purple-500" },
              { label: "Done", count: statusDistribution.done, color: "bg-emerald-500" },
            ].map((s) => {
              const pct = summary.total > 0 ? Math.round((s.count / summary.total) * 100) : 0;
              return (
                <div key={s.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{s.label}</span>
                    <span className="text-slate-400">
                      {s.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${s.color} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workload by Assignee */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Workload by Assignee
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {workload.map((w, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar user={w.user} size="sm" />
                  <div className="truncate">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {w.user?.name || "Unassigned"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {w.completed} of {w.count} done • {w.storyPoints} story pts
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {w.count} tasks
                </span>
              </div>
            ))}

            {workload.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No assigned tasks in this scope.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
