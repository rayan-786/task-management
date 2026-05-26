import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ================= PAGES =================

import Login from "./pages/Login";

import Register from "./pages/Register";

import Profile from "./pages/Profile";

import ForgotPassword from "./pages/ForgetPassword";

import ResetPassword from "./pages/ResetPassword";

import UserDetails from "./pages/UserDetails";

import TaskDetails from "./pages/TaskDetails";



// ================= PRIVATE ROUTE =================

function PrivateRoute({
  children,
}) {
  const token =
    localStorage.getItem(
      "token"
    );

  return token ? (
    children
  ) : (
    <Navigate
      to="/login"
      replace
    />
  );
}

// ================= PUBLIC ROUTE =================

function PublicRoute({
  children,
}) {
  const token =
    localStorage.getItem(
      "token"
    );

  return token ? (
    <Navigate
      to="/profile"
      replace
    />
  ) : (
    children
  );
}

// ================= NOT FOUND =================

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      
      <div className="text-center">
        
        <h1 className="text-6xl font-semibold text-slate-800">
          404
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Page not found
        </p>
      </div>
    </div>
  );
}

// ================= APP =================

function App() {
  return (
    <BrowserRouter>
      
      <Routes>

        {/* ================= DEFAULT ================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* ================= AUTH ================= */}

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

        {/* ================= PROTECTED ================= */}

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

        {/* ================= 404 ================= */}

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;