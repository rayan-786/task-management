import { createContext, useContext, useEffect, useState, useCallback } from "react";
import API from "../api";
import { useAuth } from "./AuthContext";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all user's workspaces
  const fetchWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setLoading(false);
      return [];
    }

    try {
      const res = await API.get("/api/workspaces/my");
      if (res.data.success) {
        const list = res.data.workspaces || [];
        setWorkspaces(list);

        const savedWsId = localStorage.getItem("current_workspace_id");
        const found = list.find((w) => w._id === savedWsId);
        const selected = found || list[0] || null;

        if (selected) {
          setActiveWorkspace(selected);
          localStorage.setItem("current_workspace_id", selected._id);
        }
        return list;
      }
    } catch (err) {
      console.error("Failed to fetch workspaces:", err);
    } finally {
      setLoading(false);
    }
    return [];
  }, [user]);

  // Fetch projects for the active workspace
  const fetchProjects = useCallback(async (wsId) => {
    const targetWsId = wsId || activeWorkspace?._id;
    if (!targetWsId) {
      setProjects([]);
      setActiveProject(null);
      return [];
    }

    try {
      const res = await API.get("/api/projects", {
        headers: { "x-workspace-id": targetWsId },
      });
      if (res.data.success) {
        const list = res.data.projects || [];
        setProjects(list);

        const savedProjId = localStorage.getItem("current_project_id");
        const found = list.find((p) => p._id === savedProjId);
        const selected = found || list[0] || null;

        if (selected) {
          setActiveProject(selected);
          localStorage.setItem("current_project_id", selected._id);
        }
        return list;
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
    return [];
  }, [activeWorkspace]);

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    }
  }, [user, fetchWorkspaces]);

  useEffect(() => {
    if (activeWorkspace) {
      fetchProjects(activeWorkspace._id);
    }
  }, [activeWorkspace, fetchProjects]);

  const switchWorkspace = (wsId) => {
    const found = workspaces.find((w) => w._id === wsId);
    if (found) {
      setActiveWorkspace(found);
      localStorage.setItem("current_workspace_id", found._id);
      localStorage.removeItem("current_project_id");
      fetchProjects(found._id);
    }
  };

  const switchProject = (projId) => {
    const found = projects.find((p) => p._id === projId);
    if (found) {
      setActiveProject(found);
      localStorage.setItem("current_project_id", found._id);
    }
  };

  const createWorkspace = async (name, description) => {
    const res = await API.post("/api/workspaces", { name, description });
    if (res.data.success) {
      await fetchWorkspaces();
      if (res.data.workspace) {
        switchWorkspace(res.data.workspace._id);
      }
      return res.data;
    }
    throw new Error(res.data.msg || "Failed to create workspace");
  };

  const createProject = async (data) => {
    const res = await API.post("/api/projects", data);
    if (res.data.success) {
      await fetchProjects();
      if (res.data.project) {
        switchProject(res.data.project._id);
      }
      return res.data;
    }
    throw new Error(res.data.msg || "Failed to create project");
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        projects,
        activeProject,
        loading,
        switchWorkspace,
        switchProject,
        createWorkspace,
        createProject,
        refreshWorkspaces: fetchWorkspaces,
        refreshProjects: () => fetchProjects(activeWorkspace?._id),
        userRole: activeWorkspace?.role || "member",
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
