import { Search, X, Filter } from "lucide-react";

export default function IssueFilters({
  filters,
  onChange,
  onClear,
  members = [],
  sprints = [],
}) {
  const hasActiveFilters =
    filters.status ||
    filters.priority ||
    filters.type ||
    filters.assignee ||
    filters.sprint ||
    filters.search;

  return (
    <div className="flex flex-wrap items-center gap-2.5 mb-6 text-xs">
      {/* Search Input */}
      <div className="relative min-w-[200px] flex-1 sm:flex-none">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by keyword..."
          value={filters.search || ""}
          onChange={(e) => onChange("search", e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Type filter */}
      <select
        value={filters.type || ""}
        onChange={(e) => onChange("type", e.target.value)}
        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs outline-none cursor-pointer"
      >
        <option value="">All Types</option>
        <option value="task">Task</option>
        <option value="bug">Bug</option>
        <option value="story">Story</option>
        <option value="epic">Epic</option>
        <option value="improvement">Improvement</option>
      </select>

      {/* Priority filter */}
      <select
        value={filters.priority || ""}
        onChange={(e) => onChange("priority", e.target.value)}
        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs outline-none cursor-pointer"
      >
        <option value="">All Priorities</option>
        <option value="lowest">Lowest</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      {/* Assignee filter */}
      <select
        value={filters.assignee || ""}
        onChange={(e) => onChange("assignee", e.target.value)}
        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs outline-none cursor-pointer"
      >
        <option value="">All Assignees</option>
        <option value="unassigned">Unassigned</option>
        {members.map((m) => (
          <option key={m.user?._id} value={m.user?._id}>
            {m.user?.name || m.user?.email}
          </option>
        ))}
      </select>

      {/* Sprint filter */}
      {sprints.length > 0 && (
        <select
          value={filters.sprint || ""}
          onChange={(e) => onChange("sprint", e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs outline-none cursor-pointer"
        >
          <option value="">All Sprints</option>
          <option value="backlog">Backlog (No Sprint)</option>
          {sprints.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium transition"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  );
}
