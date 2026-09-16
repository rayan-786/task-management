import { Calendar, AlertCircle } from "lucide-react";
import { PriorityBadge, IssueTypeBadge } from "../ui/Badge";
import Avatar from "../ui/Avatar";

export default function IssueCard({ issue, onClick, onDragStart }) {
  const isOverdue =
    issue.dueDate && new Date(issue.dueDate) < new Date() && issue.status !== "done";

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", issue._id);
        if (onDragStart) onDragStart(issue);
      }}
      onClick={() => onClick && onClick(issue)}
      className="group relative p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer select-none"
    >
      {/* Top row: Type icon, Key, Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <IssueTypeBadge type={issue.type} />
          <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
            {issue.key}
          </span>
        </div>
        <PriorityBadge priority={issue.priority} showLabel={false} size="xs" />
      </div>

      {/* Title */}
      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed mb-3">
        {issue.title}
      </h4>

      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {issue.labels.slice(0, 3).map((lbl, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              {lbl}
            </span>
          ))}
          {issue.labels.length > 3 && (
            <span className="text-[10px] text-slate-400 font-medium">
              +{issue.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom row: Due Date, Story Points, Assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          {issue.storyPoints !== null && issue.storyPoints !== undefined && (
            <span
              className="px-1.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              title="Story Points"
            >
              {issue.storyPoints} pts
            </span>
          )}

          {issue.dueDate && (
            <span
              className={`flex items-center gap-1 text-[10px] ${
                isOverdue
                  ? "text-rose-600 dark:text-rose-400 font-semibold"
                  : "text-slate-400"
              }`}
              title={isOverdue ? "Overdue" : "Due date"}
            >
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(issue.dueDate).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </span>
          )}
        </div>

        <Avatar user={issue.assignee} size="xs" />
      </div>
    </div>
  );
}
