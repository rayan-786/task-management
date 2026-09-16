import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Zap,
  Plus,
  Play,
  CheckCircle2,
  Calendar,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Trash2,
} from "lucide-react";
import API from "../api";
import { useWorkspace } from "../context/WorkspaceContext";
import { StatusBadge, PriorityBadge, IssueTypeBadge } from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { Input, Textarea } from "../components/ui/Input";
import IssueDetailDrawer from "../components/issues/IssueDetailDrawer";

export default function SprintPlanning() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeWorkspace, activeProject } = useWorkspace();

  const [sprints, setSprints] = useState([]);
  const [backlogIssues, setBacklogIssues] = useState([]);
  const [sprintIssues, setSprintIssues] = useState({}); // sprintId -> issues[]
  const [loading, setLoading] = useState(true);

  // Modals
  const [createSprintModal, setCreateSprintModal] = useState(false);
  const [sprintName, setSprintName] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creatingSprint, setCreatingSprint] = useState(false);

  // Complete sprint modal
  const [completeSprintModal, setCompleteSprintModal] = useState(null); // sprint object
  const [moveIncompleteTo, setMoveIncompleteTo] = useState("");
  const [completing, setCompleting] = useState(false);

  const [selectedIssueKey, setSelectedIssueKey] = useState(
    searchParams.get("issueKey") || null
  );

  const fetchSprintData = useCallback(async () => {
    const targetProjId = projectId || activeProject?._id;
    if (!targetProjId || !activeWorkspace?._id) return;

    try {
      // 1. Fetch Sprints
      const spRes = await API.get(`/api/sprints/project/${targetProjId}`);
      const sprintList = spRes.data.success ? spRes.data.sprints : [];
      setSprints(sprintList);

      // 2. Fetch all issues for project
      const issRes = await API.get(`/api/issues?projectId=${targetProjId}&limit=500`);
      if (issRes.data.success) {
        const allIssues = issRes.data.issues || [];
        const backlog = allIssues.filter((i) => !i.sprint);
        setBacklogIssues(backlog);

        const map = {};
        sprintList.forEach((s) => {
          map[s._id] = allIssues.filter((i) => i.sprint?._id === s._id || i.sprint === s._id);
        });
        setSprintIssues(map);
      }
    } catch (err) {
      console.error("Failed to load sprint planning data:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, activeProject, activeWorkspace]);

  useEffect(() => {
    fetchSprintData();
  }, [fetchSprintData]);

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!sprintName.trim()) return;
    const targetProjId = projectId || activeProject?._id;

    setCreatingSprint(true);
    try {
      const res = await API.post("/api/sprints", {
        projectId: targetProjId,
        name: sprintName.trim(),
        goal: sprintGoal.trim(),
        startDate: startDate || null,
        endDate: endDate || null,
      });
      if (res.data.success) {
        setSprintName("");
        setSprintGoal("");
        setCreateSprintModal(false);
        fetchSprintData();
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create sprint");
    } finally {
      setCreatingSprint(false);
    }
  };

  const handleStartSprint = async (sprintId) => {
    try {
      const res = await API.put(`/api/sprints/${sprintId}/start`);
      if (res.data.success) {
        fetchSprintData();
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to start sprint");
    }
  };

  const handleCompleteSprint = async () => {
    if (!completeSprintModal) return;

    setCompleting(true);
    try {
      const res = await API.put(`/api/sprints/${completeSprintModal._id}/complete`, {
        moveToSprintId: moveIncompleteTo || null,
      });
      if (res.data.success) {
        setCompleteSprintModal(null);
        fetchSprintData();
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to complete sprint");
    } finally {
      setCompleting(false);
    }
  };

  const moveIssueToSprint = async (issueId, targetSprintId) => {
    try {
      await API.put(`/api/issues/${issueId}`, { sprint: targetSprintId || null });
      fetchSprintData();
    } catch (err) {
      console.error("Failed to move issue:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Sprint Planning & Backlog
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize work into iteration cycles, manage backlog, and track burnup.
          </p>
        </div>
        <Button onClick={() => setCreateSprintModal(true)} size="sm">
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Create Sprint</span>
        </Button>
      </div>

      {/* Sprints List */}
      <div className="space-y-6">
        {sprints.map((sprint) => {
          const sIssues = sprintIssues[sprint._id] || [];
          const completedCount = sIssues.filter((i) => i.status === "done").length;
          const totalPoints = sIssues.reduce((acc, i) => acc + (i.storyPoints || 0), 0);
          const completedPoints = sIssues
            .filter((i) => i.status === "done")
            .reduce((acc, i) => acc + (i.storyPoints || 0), 0);
          const progress = sIssues.length > 0 ? Math.round((completedCount / sIssues.length) * 100) : 0;

          return (
            <div
              key={sprint._id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs"
            >
              {/* Sprint Header Banner */}
              <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {sprint.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        sprint.status === "active"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : sprint.status === "completed"
                          ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      }`}
                    >
                      {sprint.status}
                    </span>
                  </div>

                  {sprint.goal && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-600 dark:text-slate-300">Goal:</span>{" "}
                      {sprint.goal}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Progress Stats */}
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {completedCount} of {sIssues.length} issues ({progress}%)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {completedPoints} / {totalPoints} story points
                    </div>
                  </div>

                  {/* Actions */}
                  {sprint.status === "future" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStartSprint(sprint._id)}
                    >
                      <Play className="w-3.5 h-3.5 mr-1" />
                      <span>Start Sprint</span>
                    </Button>
                  )}

                  {sprint.status === "active" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCompleteSprintModal(sprint)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      <span>Complete Sprint</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
                <div
                  className="bg-emerald-500 h-1 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Issues List in this Sprint */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sIssues.map((issue) => (
                  <div
                    key={issue._id}
                    onClick={() => {
                      setSelectedIssueKey(issue.key);
                      setSearchParams({ issueKey: issue.key });
                    }}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between gap-4 transition cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <IssueTypeBadge type={issue.type} />
                      <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {issue.key}
                      </span>
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {issue.title}
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-3 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <StatusBadge status={issue.status} size="xs" />
                      <PriorityBadge priority={issue.priority} showLabel={false} size="xs" />
                      {issue.storyPoints !== null && (
                        <span className="font-mono text-slate-400 text-[11px]">
                          {issue.storyPoints} pts
                        </span>
                      )}
                      <Avatar user={issue.assignee} size="xs" />
                      <button
                        onClick={() => moveIssueToSprint(issue._id, null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[11px] hover:underline"
                        title="Move to Backlog"
                      >
                        To Backlog
                      </button>
                    </div>
                  </div>
                ))}

                {sIssues.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No issues in this sprint yet. Move issues from the backlog below.
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Backlog Section */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Backlog
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {backlogIssues.length} issues
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {backlogIssues.map((issue) => (
              <div
                key={issue._id}
                onClick={() => {
                  setSelectedIssueKey(issue.key);
                  setSearchParams({ issueKey: issue.key });
                }}
                className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between gap-4 transition cursor-pointer text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <IssueTypeBadge type={issue.type} />
                  <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                    {issue.key}
                  </span>
                  <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                    {issue.title}
                  </span>
                </div>

                <div
                  className="flex items-center gap-3 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <StatusBadge status={issue.status} size="xs" />
                  <PriorityBadge priority={issue.priority} showLabel={false} size="xs" />
                  {issue.storyPoints !== null && (
                    <span className="font-mono text-slate-400 text-[11px]">
                      {issue.storyPoints} pts
                    </span>
                  )}
                  <Avatar user={issue.assignee} size="xs" />

                  {/* Move to Sprint dropdown */}
                  {sprints.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) moveIssueToSprint(issue._id, e.target.value);
                      }}
                      defaultValue=""
                      className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded px-2 py-1 outline-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Move to Sprint...
                      </option>
                      {sprints.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}

            {backlogIssues.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                Backlog is empty! All items are assigned to active or future sprints.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Sprint Modal */}
      <Modal
        isOpen={createSprintModal}
        onClose={() => setCreateSprintModal(false)}
        title="Create New Sprint"
      >
        <form onSubmit={handleCreateSprint} className="space-y-4">
          <Input
            label="Sprint Name *"
            placeholder="e.g. Sprint 25 — Payments Integration"
            value={sprintName}
            onChange={(e) => setSprintName(e.target.value)}
            required
          />

          <Textarea
            label="Sprint Goal"
            placeholder="What is the objective of this sprint?"
            rows={3}
            value={sprintGoal}
            onChange={(e) => setSprintGoal(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => setCreateSprintModal(false)}
              disabled={creatingSprint}
            >
              Cancel
            </Button>
            <Button type="submit" loading={creatingSprint}>
              Create Sprint
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complete Sprint Modal */}
      <Modal
        isOpen={Boolean(completeSprintModal)}
        onClose={() => setCompleteSprintModal(null)}
        title={`Complete ${completeSprintModal?.name}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Open issues that were not resolved in this sprint can either be rolled over to the next
            sprint or moved back to the backlog.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Move incomplete issues to:
            </label>
            <select
              value={moveIncompleteTo}
              onChange={(e) => setMoveIncompleteTo(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm outline-none"
            >
              <option value="">Backlog</option>
              {sprints
                .filter(
                  (s) => s._id !== completeSprintModal?._id && s.status === "future"
                )
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => setCompleteSprintModal(null)}
              disabled={completing}
            >
              Cancel
            </Button>
            <Button onClick={handleCompleteSprint} loading={completing}>
              Complete Sprint
            </Button>
          </div>
        </div>
      </Modal>

      {/* Slide-Over Issue Detail Drawer */}
      <IssueDetailDrawer
        issueKey={selectedIssueKey}
        isOpen={Boolean(selectedIssueKey)}
        onClose={() => {
          setSelectedIssueKey(null);
          setSearchParams({});
        }}
        onUpdated={() => fetchSprintData()}
        onDeleted={() => fetchSprintData()}
      />
    </div>
  );
}
