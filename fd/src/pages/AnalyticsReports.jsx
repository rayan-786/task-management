import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart2,
  Sparkles,
} from "lucide-react";
import API from "../api";
import { useWorkspace } from "../context/WorkspaceContext";
import Avatar from "../components/ui/Avatar";
import { DashboardSkeleton } from "../components/ui/Skeleton";

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
    return <DashboardSkeleton />;
  }

  const { summary, statusDistribution, priorityDistribution, workload, velocity } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
          Analytics & Velocity Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Real-time delivery velocity, cycle times, status breakdown, and workload distribution.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Issues */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Issues</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {summary.total}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {summary.completed} completed ({summary.progress}%)
          </p>
        </div>

        {/* Completed Issues */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {summary.completed}
          </div>
          <p className="text-xs text-slate-500 mt-1">{summary.pending} remaining open</p>
        </div>

        {/* Avg Cycle Time */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Cycle Time</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {summary.avgCycleTimeDays}{" "}
            <span className="text-xs font-normal text-slate-500">days</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">From creation to resolution</p>
        </div>

        {/* Overdue */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Overdue Items</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">
            {summary.overdue}
          </div>
          <p className="text-xs text-slate-500 mt-1">Due date passed</p>
        </div>
      </div>

      {/* Velocity Bar Chart (Last 7 Days) */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Velocity (7-Day Throughput)
            </h3>
            <p className="text-xs text-slate-500">
              Created vs Completed issues over the past week
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium self-start sm:self-auto">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
              <span className="text-slate-700 font-semibold">Created</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="text-slate-700 font-semibold">Completed</span>
            </span>
          </div>
        </div>

        {/* Chart Bars */}
        <div className="h-44 sm:h-52 flex items-end justify-between gap-2 sm:gap-4 pt-6 border-b border-slate-100 overflow-x-auto">
          {velocity.map((v, i) => {
            const maxVal = Math.max(
              ...velocity.map((item) => Math.max(item.created, item.completed, 1))
            );
            const createdHeight = (v.created / maxVal) * 140;
            const completedHeight = (v.completed / maxVal) * 140;

            return (
              <div key={i} className="flex-1 min-w-[36px] flex flex-col items-center gap-2 h-full justify-end">
                <div className="flex items-end gap-1 sm:gap-1.5 w-full max-w-[40px] justify-center">
                  <div
                    title={`Created: ${v.created}`}
                    style={{ height: `${Math.max(createdHeight, 4)}px` }}
                    className="w-3 sm:w-4 bg-blue-600 rounded-t-sm transition-all duration-300 shadow-2xs"
                  />
                  <div
                    title={`Completed: ${v.completed}`}
                    style={{ height: `${Math.max(completedHeight, 4)}px` }}
                    className="w-3 sm:w-4 bg-emerald-500 rounded-t-sm transition-all duration-300 shadow-2xs"
                  />
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold">{v.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Status Breakdown & Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
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
                <div key={s.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{s.label}</span>
                    <span className="text-slate-500">
                      {s.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
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
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Workload by Assignee
          </h3>
          <div className="divide-y divide-slate-100">
            {workload.map((w, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar user={w.user} size="sm" />
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">
                      {w.user?.name || "Unassigned"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {w.completed} of {w.count} done • {w.storyPoints} story pts
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
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
