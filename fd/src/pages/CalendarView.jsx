import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import API from "../api";
import { useWorkspace } from "../context/WorkspaceContext";
import IssueDetailDrawer from "../components/issues/IssueDetailDrawer";
import { TableSkeleton } from "../components/ui/Skeleton";

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

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            {activeProject?.name || "Project"} — Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visualize deadlines and sprint milestones mapped across the monthly schedule.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={today}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            Today
          </button>
          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 transition"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold min-w-[130px] text-center text-slate-900">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 transition"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/75 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider text-center py-2.5">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {/* Empty prefix cells */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="min-h-[70px] sm:min-h-[105px] bg-slate-50/40 p-1 sm:p-2"
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
                className={`min-h-[70px] sm:min-h-[105px] p-1.5 sm:p-2 transition hover:bg-slate-50/80 flex flex-col ${
                  isToday ? "bg-blue-50/30 font-bold" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-[11px] sm:text-xs ${
                      isToday
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-700 font-semibold"
                    }`}
                  >
                    {dayNumber}
                  </span>
                  {dayIssues.length > 0 && (
                    <span className="text-[10px] text-blue-600 font-bold sm:hidden">
                      {dayIssues.length}
                    </span>
                  )}
                  {dayIssues.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                      {dayIssues.length} items
                    </span>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-16 sm:max-h-20">
                  {dayIssues.map((iss) => (
                    <div
                      key={iss._id}
                      onClick={() => {
                        setSelectedIssueKey(iss.key);
                        setSearchParams({ issueKey: issue.key });
                      }}
                      className="p-1 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200/80 text-[10px] sm:text-[11px] cursor-pointer transition truncate flex items-center gap-1 group"
                      title={iss.title}
                    >
                      <span className="font-mono font-bold text-blue-600 shrink-0">
                        {iss.key}
                      </span>
                      <span className="truncate text-slate-800 group-hover:text-blue-600 hidden sm:inline font-medium">
                        {iss.title}
                      </span>
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
