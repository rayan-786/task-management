import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import API from "../../api";
import { useWorkspace } from "../../context/WorkspaceContext";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import Select from "../ui/Select";

export default function CreateIssueModal({ isOpen, onClose, onCreated }) {
  const { activeWorkspace, activeProject, projects } = useWorkspace();
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("task");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState("");
  const [sprint, setSprint] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [labels, setLabels] = useState("");

  const [members, setMembers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activeProject?._id) {
      setProjectId(activeProject._id);
    } else if (projects?.[0]?._id) {
      setProjectId(projects[0]._id);
    }
  }, [activeProject, projects, isOpen]);

  // Load project sprints & workspace members
  useEffect(() => {
    if (!isOpen) return;

    const loadMetadata = async () => {
      try {
        if (activeWorkspace?._id) {
          const wsRes = await API.get(`/api/workspaces/${activeWorkspace._id}`);
          if (wsRes.data.success) {
            setMembers(wsRes.data.members || []);
          }
        }
        if (projectId) {
          const spRes = await API.get(`/api/sprints/project/${projectId}`);
          if (spRes.data.success) {
            setSprints(spRes.data.sprints || []);
          }
        }
      } catch (err) {
        console.error("Failed to load metadata:", err);
      }
    };
    loadMetadata();
  }, [isOpen, projectId, activeWorkspace]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!projectId) {
      setError("Please select a project");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        projectId,
        title: title.trim(),
        description: description.trim(),
        type,
        status,
        priority,
        assignee: assignee || null,
        sprint: sprint || null,
        storyPoints: storyPoints ? Number(storyPoints) : null,
        dueDate: dueDate || null,
        labels: labels ? labels.split(",").map((l) => l.trim()).filter(Boolean) : [],
      };

      const res = await API.post("/api/issues", payload);
      if (res.data.success) {
        // Reset form
        setTitle("");
        setDescription("");
        setStoryPoints("");
        setDueDate("");
        setLabels("");
        onClose();
        if (onCreated) onCreated(res.data.issue);
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Failed to create issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Issue" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Project *"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={projects.map((p) => ({ value: p._id, label: `${p.name} (${p.key})` }))}
          />
          <Select
            label="Issue Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: "task", label: "Task" },
              { value: "bug", label: "Bug" },
              { value: "story", label: "Story" },
              { value: "epic", label: "Epic" },
              { value: "improvement", label: "Improvement" },
            ]}
          />
        </div>

        <Input
          label="Title *"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Add details, acceptance criteria, or context (Markdown supported)..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "todo", label: "To Do" },
              { value: "backlog", label: "Backlog" },
              { value: "in_progress", label: "In Progress" },
              { value: "in_review", label: "In Review" },
              { value: "done", label: "Done" },
            ]}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: "lowest", label: "Lowest" },
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ]}
          />

          <Select
            label="Assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            options={[
              { value: "", label: "Unassigned" },
              ...members.map((m) => ({
                value: m.user?._id,
                label: m.user?.name || m.user?.email,
              })),
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Sprint"
            value={sprint}
            onChange={(e) => setSprint(e.target.value)}
            options={[
              { value: "", label: "None (Backlog)" },
              ...sprints.map((s) => ({
                value: s._id,
                label: `${s.name} ${s.status === "active" ? "(Active)" : ""}`,
              })),
            ]}
          />

          <Input
            label="Story Points"
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 3, 5, 8"
            value={storyPoints}
            onChange={(e) => setStoryPoints(e.target.value)}
          />

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <Input
          label="Labels"
          placeholder="frontend, api, bugfix (comma separated)"
          value={labels}
          onChange={(e) => setLabels(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Issue
          </Button>
        </div>
      </form>
    </Modal>
  );
}
