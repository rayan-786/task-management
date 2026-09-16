import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useWorkspace } from "./WorkspaceContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const { activeWorkspace, activeProject } = useWorkspace();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const newSocket = io(socketUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      newSocket.emit("join:user", user._id || user.id);
      if (activeWorkspace?._id) {
        newSocket.emit("join:workspace", activeWorkspace._id);
      }
      if (activeProject?._id) {
        newSocket.emit("join:project", activeProject._id);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Sync workspace and project rooms
  useEffect(() => {
    if (socket && activeWorkspace?._id) {
      socket.emit("join:workspace", activeWorkspace._id);
    }
  }, [socket, activeWorkspace]);

  useEffect(() => {
    if (socket && activeProject?._id) {
      socket.emit("join:project", activeProject._id);
    }
  }, [socket, activeProject]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
