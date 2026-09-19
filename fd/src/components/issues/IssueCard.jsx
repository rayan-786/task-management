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
      className="group relative p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer select-none active:cursor-grabbing"
    >
      {/* Top row: Type icon, Key, Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <IssueTypeBadge type={issue.type} />
          <span className="font-mono text-xs font-bold text-slate-500 tracking-tight">
            {issue.key}
          </span>
        </div>
        <PriorityBadge priority={issue.priority} showLabel={false} size="xs" />
      </div>

      {/* Title */}
      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug mb-2.5 transition">
        {issue.title}
      </h4>

      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {issue.labels.slice(0, 3).map((lbl, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60"
            >
              {lbl}
            </span>
          ))}
          {issue.labels.length > 3 && (
            <span className="text-[10px] text-slate-400 font-semibold">
              +{issue.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom row: Due Date, Story Points, Assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          {issue.storyPoints !== null && issue.storyPoints !== undefined && (
            <span
              className="px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/60"
              title="Story Points"
            >
              {issue.storyPoints} pts
            </span>
          )}

          {issue.dueDate && (
            <span
              className={`flex items-center gap-1 text-[10px] ${
                isOverdue
                  ? "text-rose-600 font-bold"
                  : "text-slate-500 font-medium"
              }`}
              title={isOverdue ? "Overdue" : "Due date"}
            >
              <Calendar className="w-3 h-3 shrink-0" />
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
