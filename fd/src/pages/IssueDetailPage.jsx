import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Check, ExternalLink } from "lucide-react";
import API from "../api";
import { useWorkspace } from "../context/WorkspaceContext";
import { useAuth } from "../context/AuthContext";
import { StatusBadge, PriorityBadge, IssueTypeBadge } from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";

export default function IssueDetailPage() {
  const { key } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeWorkspace, activeProject } = useWorkspace();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await API.get(`/api/issues/${key}`);
        if (res.data.success) {
          setIssue(res.data.issue);
          setComments(res.data.comments || []);
          setLinks(res.data.links || []);
        }
      } catch (err) {
        console.error("Failed to load issue:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [key]);

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

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading issue...</div>;
  }

  if (!issue) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Issue {key} not found
        </p>
        <Button onClick={() => navigate("/dashboard")} size="sm">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={copyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <IssueTypeBadge type={issue.type} />
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                {issue.key}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {issue.title}
            </h1>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {issue.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Comments ({comments.length})
            </h3>

            <form onSubmit={handleAddComment} className="flex gap-3">
              <Avatar user={user} size="sm" />
              <div className="flex-1">
                <textarea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Leave a comment... (use @name to mention team members)"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
                {newComment.trim() && (
                  <div className="mt-2 flex justify-end">
                    <Button type="submit" size="sm" loading={submittingComment}>
                      Post Comment
                    </Button>
                  </div>
                )}
              </div>
            </form>

            <div className="space-y-3 pt-2 divide-y divide-slate-100 dark:divide-slate-800/60">
              {comments.map((c) => (
                <div key={c._id} className="pt-3 flex items-start gap-3">
                  <Avatar user={c.user} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {c.user?.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">
                      {c.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Metadata */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs p-5 space-y-4 text-xs">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Status
            </span>
            <StatusBadge status={issue.status} />
          </div>

          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Priority
            </span>
            <PriorityBadge priority={issue.priority} />
          </div>

          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Assignee
            </span>
            <div className="flex items-center gap-2">
              <Avatar user={issue.assignee} size="sm" />
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {issue.assignee?.name || "Unassigned"}
              </span>
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Sprint
            </span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {issue.sprint?.name || "Backlog"}
            </span>
          </div>

          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Story Points
            </span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {issue.storyPoints !== null ? `${issue.storyPoints} points` : "None"}
            </span>
          </div>

          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Due Date
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "No due date"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
