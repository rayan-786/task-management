import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  Copy as DuplicateIcon,
  MessageSquare,
  Send,
  Calendar,
} from "lucide-react";
import API from "../../api";
import SlideOver from "../ui/SlideOver";
import { StatusBadge, PriorityBadge, IssueTypeBadge } from "../ui/Badge";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";

export default function IssueDetailDrawer({
  issueKey,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
}) {
  const { user } = useAuth();
  const { activeWorkspace, activeProject } = useWorkspace();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form edit states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [type, setType] = useState("task");
  const [assignee, setAssignee] = useState("");
  const [sprint, setSprint] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [labels, setLabels] = useState("");
  const [copied, setCopied] = useState(false);

  // Comments
  const [activeTab, setActiveTab] = useState("comments");
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Project metadata
  const [members, setMembers] = useState([]);
  const [sprints, setSprints] = useState([]);

  // Fetch issue details
  const fetchDetails = async () => {
    if (!issueKey) return;
    setLoading(true);
    try {
      const res = await API.get(`/api/issues/${issueKey}`);
      if (res.data.success) {
        const iss = res.data.issue;
        setIssue(iss);
        setComments(res.data.comments || []);
        setLinks(res.data.links || []);

        setTitle(iss.title);
        setDescription(iss.description || "");
        setStatus(iss.status);
        setPriority(iss.priority);
        setType(iss.type);
        setAssignee(iss.assignee?._id || "");
        setSprint(iss.sprint?._id || "");
        setStoryPoints(iss.storyPoints !== null ? String(iss.storyPoints) : "");
        setDueDate(iss.dueDate ? iss.dueDate.split("T")[0] : "");
        setLabels(iss.labels ? iss.labels.join(", ") : "");
      }
    } catch (err) {
      console.error("Failed to load issue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && issueKey) {
      fetchDetails();
    }
  }, [isOpen, issueKey]);

  // Load workspace members & sprints
  useEffect(() => {
    if (!isOpen || !activeWorkspace?._id) return;
    const loadMeta = async () => {
      try {
        const wsRes = await API.get(`/api/workspaces/${activeWorkspace._id}`);
        if (wsRes.data.success) setMembers(wsRes.data.members || []);

        const targetProjId = issue?.project?._id || activeProject?._id;
        if (targetProjId) {
          const spRes = await API.get(`/api/sprints/project/${targetProjId}`);
          if (spRes.data.success) setSprints(spRes.data.sprints || []);
        }
      } catch (err) {
        console.error("Failed to load meta:", err);
      }
    };
    loadMeta();
  }, [isOpen, activeWorkspace, issue?.project]);

  const handleFieldSave = async (field, value) => {
    if (!issue) return;
    try {
      const res = await API.put(`/api/issues/${issue._id}`, { [field]: value });
      if (res.data.success) {
        setIssue(res.data.issue);
        if (onUpdated) onUpdated(res.data.issue);
      }
    } catch (err) {
      console.error("Failed to update field:", err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !issue) return;

    setSubmittingComment(true);
    try {
      const res = await API.post(`/api/comments/issue/${issue._id}`, {
        text: newComment.trim(),
      });
      if (res.data.success) {
        setComments((prev) => [...prev, res.data.comment]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await API.delete(`/api/comments/${commentId}`);
      if (res.data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleToggleWatch = async () => {
    if (!issue) return;
    try {
      const res = await API.post(`/api/issues/${issue._id}/watch`);
      if (res.data.success) {
        fetchDetails();
      }
    } catch (err) {
      console.error("Failed to toggle watcher:", err);
    }
  };

  const handleDuplicate = async () => {
    if (!issue) return;
    try {
      const res = await API.post(`/api/issues/${issue._id}/duplicate`);
      if (res.data.success && res.data.issue) {
        onClose();
        if (onUpdated) onUpdated(res.data.issue);
      }
    } catch (err) {
      alert("Failed to duplicate issue");
    }
  };

  const handleDeleteIssue = async () => {
    if (!issue) return;
    if (!window.confirm(`Are you sure you want to delete ${issue.key}?`)) return;

    try {
      const res = await API.delete(`/api/issues/${issue._id}`);
      if (res.data.success) {
        onClose();
        if (onDeleted) onDeleted(issue._id);
      }
    } catch (err) {
      alert("Failed to delete issue");
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(issue?.key || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const isWatching = issue?.watchers?.some(
    (w) => (w._id || w).toString() === (user?._id || user?.id)?.toString()
  );

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      width="w-full sm:max-w-2xl lg:max-w-4xl"
      title={
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            {issue?.key || issueKey}
          </span>
          <button
            onClick={copyKey}
            className="p-1 text-slate-400 hover:text-slate-700 transition"
            title="Copy Key"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      }
    >
      {loading && !issue ? (
        <div className="p-12 text-center text-xs text-slate-400 font-medium">
          Loading issue details...
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row h-full">
          {/* Main Content Area */}
          <div className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto">
            {/* Title (Inline editable) */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  if (title.trim() && title !== issue?.title) {
                    handleFieldSave("title", title.trim());
                  }
                }}
                className="w-full text-lg sm:text-xl font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none transition py-1 text-slate-900"
                placeholder="Issue Title"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Description
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => {
                  if (description !== issue?.description) {
                    handleFieldSave("description", description);
                  }
                }}
                placeholder="Add details, acceptance criteria, or links..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
              />
            </div>

            {/* Comments Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4 text-xs font-bold border-b border-slate-100 pb-2">
                <button
                  onClick={() => setActiveTab("comments")}
                  className={`flex items-center gap-1.5 pb-2 -mb-2 border-b-2 transition ${
                    activeTab === "comments"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comments ({comments.length})</span>
                </button>
              </div>

              {/* Comments stream */}
              {activeTab === "comments" && (
                <div className="space-y-3">
                  {/* Add Comment Input */}
                  <form onSubmit={handleAddComment} className="flex gap-2.5 items-start">
                    <Avatar user={user} size="sm" />
                    <div className="flex-1">
                      <textarea
                        rows={2}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
                      />
                      {newComment.trim() && (
                        <div className="mt-2 flex justify-end">
                          <Button
                            type="submit"
                            size="sm"
                            loading={submittingComment}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            <span>Comment</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </form>

                  {/* List of comments */}
                  <div className="space-y-2.5 pt-2">
                    {comments.map((c) => (
                      <div
                        key={c._id}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <Avatar user={c.user} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              {c.user?.name || "User"}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">
                                {new Date(c.createdAt).toLocaleDateString()}
                              </span>
                              {(c.user?._id === user?._id || user?.role === "admin") && (
                                <button
                                  onClick={() => handleDeleteComment(c._id)}
                                  className="text-slate-400 hover:text-rose-600 transition p-0.5"
                                  title="Delete Comment"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">
                            {c.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Rail: Metadata & Quick Pickers */}
          <div className="w-full lg:w-72 bg-slate-50/70 border-t lg:border-t-0 lg:border-l border-slate-200 p-4 sm:p-5 space-y-4 shrink-0 text-xs">
            {/* Status Picker */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  handleFieldSave("status", e.target.value);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer hover:border-slate-400 transition"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Priority Picker */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  handleFieldSave("priority", e.target.value);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer hover:border-slate-400 transition"
              >
                <option value="lowest">Lowest</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Assignee Picker */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Assignee
              </label>
              <select
                value={assignee}
                onChange={(e) => {
                  setAssignee(e.target.value);
                  handleFieldSave("assignee", e.target.value || null);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer hover:border-slate-400 transition"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user?._id} value={m.user?._id}>
                    {m.user?.name || m.user?.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Sprint Picker */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Sprint
              </label>
              <select
                value={sprint}
                onChange={(e) => {
                  setSprint(e.target.value);
                  handleFieldSave("sprint", e.target.value || null);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer hover:border-slate-400 transition"
              >
                <option value="">None (Backlog)</option>
                {sprints.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.status === "active" ? "• Active" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Story Points */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Story Points
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                onBlur={() => {
                  const num = storyPoints ? Number(storyPoints) : null;
                  if (num !== issue?.storyPoints) {
                    handleFieldSave("storyPoints", num);
                  }
                }}
                placeholder="Points (e.g. 5)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  handleFieldSave("dueDate", e.target.value || null);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            {/* Actions: Watchers, Duplicate, Delete */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <button
                onClick={handleToggleWatch}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition text-slate-700 font-semibold text-xs shadow-2xs"
              >
                {isWatching ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                    <span>Stop Watching</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Watch Issue</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDuplicate}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition text-slate-700 font-semibold text-xs shadow-2xs"
              >
                <DuplicateIcon className="w-3.5 h-3.5" />
                <span>Duplicate Issue</span>
              </button>

              <button
                onClick={handleDeleteIssue}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition font-semibold text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Issue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </SlideOver>
  );
}
