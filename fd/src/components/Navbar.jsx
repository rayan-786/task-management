// fd/src/components/Navbar.jsx

import {
  useNavigate,
} from "react-router-dom";

import {
  LogOut,
  LayoutDashboard,
  Briefcase,
  Users,
} from "lucide-react";

export default function Navbar({
  scrollToTasks,
  scrollToUsers,
}) {
  const navigate =
    useNavigate();

  // ================= LOGOUT =================

  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* LEFT */}

        <div
          onClick={() =>
            navigate("/profile")
          }
          className="flex cursor-pointer items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              TaskFlow
            </h1>

            <p className="text-xs text-slate-500">
              Team Management
            </p>
          </div>
        </div>

        {/* CENTER */}

        <div className="hidden items-center gap-2 md:flex">
          
          <button
            onClick={() =>
              navigate("/profile")
            }
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <LayoutDashboard className="h-4 w-4" />

            Dashboard
          </button>

          <button
            onClick={scrollToTasks}
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Briefcase className="h-4 w-4" />

            Tasks
          </button>

          <button
            onClick={scrollToUsers}
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Users className="h-4 w-4" />

            Team
          </button>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-4">
          
          {/* USER */}

          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-800">
              Admin
            </p>

            <p className="text-xs text-slate-500">
              Project Manager
            </p>
          </div>

          {/* LOGOUT */}

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />

            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}