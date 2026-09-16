import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Context Providers
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { SocketProvider } from "./context/SocketContext";

// Layout Shell
import AppLayout from "./components/layout/AppLayout";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthSuccess from "./pages/Authsuccess";
import AcceptInvite from "./pages/AcceptInvite";

// Product Pages
import Dashboard from "./pages/Dashboard";
import MyTasks from "./pages/MyTasks";
import KanbanBoard from "./pages/KanbanBoard";
import ListView from "./pages/ListView";
import TableView from "./pages/TableView";
import SprintPlanning from "./pages/SprintPlanning";
import CalendarView from "./pages/CalendarView";
import AnalyticsReports from "./pages/AnalyticsReports";
import TeamManagement from "./pages/TeamManagement";
import Settings from "./pages/Settings";
import IssueDetailPage from "./pages/IssueDetailPage";

// Legacy Pages
import Profile from "./pages/Profile";
import UserDetails from "./pages/UserDetails";
import TaskDetails from "./pages/TaskDetails";

// Route Guards
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="text-center space-y-3">
        <h1 className="text-7xl font-extrabold text-slate-300 dark:text-slate-800">404</h1>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Page Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The task, project, or workspace view you requested does not exist or has been moved.
        </p>
        <a
          href="/dashboard"
          className="inline-block mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <SocketProvider>
            <BrowserRouter>
              <Routes>
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Public Auth Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <PublicRoute>
                      <ResetPassword />
                    </PublicRoute>
                  }
                />
                <Route path="/auth-success" element={<AuthSuccess />} />
                <Route path="/invite/accept" element={<AcceptInvite />} />

                {/* Protected Workspace Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-tasks"
                  element={
                    <PrivateRoute>
                      <MyTasks />
                    </PrivateRoute>
                  }
                />

                {/* Project Specific Views */}
                <Route
                  path="/projects/:projectId/board"
                  element={
                    <PrivateRoute>
                      <KanbanBoard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/projects/:projectId/list"
                  element={
                    <PrivateRoute>
                      <ListView />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/projects/:projectId/table"
                  element={
                    <PrivateRoute>
                      <TableView />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/projects/:projectId/sprints"
                  element={
                    <PrivateRoute>
                      <SprintPlanning />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/projects/:projectId/calendar"
                  element={
                    <PrivateRoute>
                      <CalendarView />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/projects/:projectId/reports"
                  element={
                    <PrivateRoute>
                      <AnalyticsReports />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/projects/:projectId/issues/:key"
                  element={
                    <PrivateRoute>
                      <IssueDetailPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/issues/:key"
                  element={
                    <PrivateRoute>
                      <IssueDetailPage />
                    </PrivateRoute>
                  }
                />

                {/* Team & Settings */}
                <Route
                  path="/team"
                  element={
                    <PrivateRoute>
                      <TeamManagement />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  }
                />

                {/* Legacy Routes (backward compatible) */}
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/users/:id"
                  element={
                    <PrivateRoute>
                      <UserDetails />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/task/:id"
                  element={
                    <PrivateRoute>
                      <TaskDetails />
                    </PrivateRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SocketProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}