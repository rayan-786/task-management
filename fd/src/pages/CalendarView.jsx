import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import API from "../api";
import { useWorkspace } from "../context/WorkspaceContext";
import { PriorityBadge, IssueTypeBadge } from "../components/ui/Badge";
import IssueDetailDrawer from "../components/issues/IssueDetailDrawer";

export default function CalendarView() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeWorkspace, activeProject } = useWorkspace();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssueKey, setSelectedIssueKey] = useState(
    searchParams.get("issueKey") || null
  );

  const fetchIssues = useCallback(async () => {
    const targetProjId = projectId || activeProject?._id;
    if (!targetProjId || !activeWorkspace?._id) return;

    try {
      const res = await API.get(`/api/issues?projectId=${targetProjId}&limit=500`);
      if (res.data.success) {
        setIssues(res.data.issues || []);
      }
    } catch (err) {
      console.error("Failed to load calendar issues:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, activeProject, activeWorkspace]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {activeProject?.name || "Project"} — Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize deadlines and sprint milestones mapped across the monthly schedule.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={today}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Today
          </button>
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold min-w-[130px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center py-2.5">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
          {/* Empty prefix cells */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="min-h-[100px] bg-slate-50/40 dark:bg-slate-900/30 p-2"
            />
          ))}

          {/* Month day cells */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNumber = idx + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
              dayNumber
            ).padStart(2, "0")}`;

            const dayIssues = issues.filter((iss) => {
              if (!iss.dueDate) return false;
              return iss.dueDate.startsWith(dateStr);
            });

            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === dayNumber;

            return (
              <div
                key={dayNumber}
                className={`min-h-[100px] p-2 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/30 flex flex-col ${
                  isToday ? "bg-blue-50/30 dark:bg-blue-950/20" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {dayNumber}
                  </span>
                  {dayIssues.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {dayIssues.length} items
                    </span>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-24">
                  {dayIssues.map((iss) => (
                    <div
                      key={iss._id}
                      onClick={() => {
                        setSelectedIssueKey(iss.key);
                        setSearchParams({ issueKey: iss.key });
                      }}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-slate-200/60 dark:border-slate-700/60 text-[11px] cursor-pointer transition truncate flex items-center gap-1"
                      title={iss.title}
                    >
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0">
                        {iss.key}
                      </span>
                      <span className="truncate">{iss.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <IssueDetailDrawer
        issueKey={selectedIssueKey}
        isOpen={Boolean(selectedIssueKey)}
        onClose={() => {
          setSelectedIssueKey(null);
          setSearchParams({});
        }}
        onUpdated={fetchIssues}
        onDeleted={fetchIssues}
      />
    </div>
  );
}
