import {
  Circle,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Flame,
  Bookmark,
  Bug,
  CheckSquare,
  Sparkles,
} from "lucide-react";

export function StatusBadge({ status, size = "sm" }) {
  const configs = {
    backlog: {
      label: "Backlog",
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-700 dark:text-slate-300",
      border: "border-slate-200 dark:border-slate-700",
      icon: Circle,
    },
    todo: {
      label: "To Do",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800/60",
      icon: Circle,
    },
    in_progress: {
      label: "In Progress",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-800/60",
      icon: Clock,
    },
    in_review: {
      label: "In Review",
      bg: "bg-purple-50 dark:bg-purple-950/40",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-200 dark:border-purple-800/60",
      icon: AlertCircle,
    },
    done: {
      label: "Done",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-800/60",
      icon: CheckCircle2,
    },
    cancelled: {
      label: "Cancelled",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-200 dark:border-rose-800/60",
      icon: XCircle,
    },
  };

  const current = configs[status] || configs.todo;
  const Icon = current.icon;
  const sizeClass = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${current.bg} ${current.text} ${current.border} ${sizeClass}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{current.label}</span>
    </span>
  );
}

export function PriorityBadge({ priority, showLabel = true, size = "sm" }) {
  const configs = {
    lowest: {
      label: "Lowest",
      color: "text-slate-400 dark:text-slate-500",
      bg: "bg-slate-100 dark:bg-slate-800",
      icon: ArrowDown,
    },
    low: {
      label: "Low",
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      icon: ArrowDown,
    },
    medium: {
      label: "Medium",
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      icon: Minus,
    },
    high: {
      label: "High",
      color: "text-orange-500 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      icon: ArrowUp,
    },
    urgent: {
      label: "Urgent",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      icon: Flame,
    },
  };

  const current = configs[priority] || configs.medium;
  const Icon = current.icon;
  const sizeClass = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded ${current.bg} ${current.color} ${sizeClass}`}
      title={`Priority: ${current.label}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {showLabel && <span>{current.label}</span>}
    </span>
  );
}

export function IssueTypeBadge({ type, size = "sm" }) {
  const configs = {
    task: { label: "Task", color: "text-blue-600 dark:text-blue-400", icon: CheckSquare },
    bug: { label: "Bug", color: "text-rose-600 dark:text-rose-400", icon: Bug },
    story: { label: "Story", color: "text-emerald-600 dark:text-emerald-400", icon: Bookmark },
    epic: { label: "Epic", color: "text-purple-600 dark:text-purple-400", icon: Sparkles },
    improvement: { label: "Improvement", color: "text-amber-600 dark:text-amber-400", icon: ArrowUp },
  };

  const current = configs[type] || configs.task;
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${current.color}`} title={current.label}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{current.label}</span>
    </span>
  );
}
