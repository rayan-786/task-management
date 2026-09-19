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
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      icon: Circle,
    },
    todo: {
      label: "To Do",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: Circle,
    },
    in_progress: {
      label: "In Progress",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Clock,
    },
    in_review: {
      label: "In Review",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      icon: AlertCircle,
    },
    done: {
      label: "Done",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCircle2,
    },
    cancelled: {
      label: "Cancelled",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: XCircle,
    },
  };

  const current = configs[status] || configs.todo;
  const Icon = current.icon;
  const sizeClass = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${current.bg} ${current.text} ${current.border} ${sizeClass} shrink-0`}
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
      color: "text-slate-500",
      bg: "bg-slate-100 border border-slate-200",
      icon: ArrowDown,
    },
    low: {
      label: "Low",
      color: "text-sky-600",
      bg: "bg-sky-50 border border-sky-200",
      icon: ArrowDown,
    },
    medium: {
      label: "Medium",
      color: "text-amber-600",
      bg: "bg-amber-50 border border-amber-200",
      icon: Minus,
    },
    high: {
      label: "High",
      color: "text-orange-600",
      bg: "bg-orange-50 border border-orange-200",
      icon: ArrowUp,
    },
    urgent: {
      label: "Urgent",
      color: "text-rose-600",
      bg: "bg-rose-50 border border-rose-200",
      icon: Flame,
    },
  };

  const current = configs[priority] || configs.medium;
  const Icon = current.icon;
  const sizeClass = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md ${current.bg} ${current.color} ${sizeClass} shrink-0`}
      title={`Priority: ${current.label}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {showLabel && <span>{current.label}</span>}
    </span>
  );
}

export function IssueTypeBadge({ type, size = "sm" }) {
  const configs = {
    task: { label: "Task", color: "text-blue-600", icon: CheckSquare },
    bug: { label: "Bug", color: "text-rose-600", icon: Bug },
    story: { label: "Story", color: "text-emerald-600", icon: Bookmark },
    epic: { label: "Epic", color: "text-purple-600", icon: Sparkles },
    improvement: { label: "Improvement", color: "text-amber-600", icon: ArrowUp },
  };

  const current = configs[type] || configs.task;
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${current.color} shrink-0`} title={current.label}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{current.label}</span>
    </span>
  );
}
