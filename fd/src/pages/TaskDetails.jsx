// fd/src/pages/TaskDetails.jsx

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Users,
} from "lucide-react";

import API from "../api";

import Navbar from "../components/Navbar";

// ================= STATUS BADGE =================

function StatusBadge({ status }) {
  const styles = {
    todo: "bg-slate-100 text-slate-700",

    in_progress:
      "bg-amber-100 text-amber-700",

    testing:
      "bg-purple-100 text-purple-700",

    completed:
      "bg-emerald-100 text-emerald-700",
  };

  return (
    <span
      className={`rounded-md px-3 py-1 text-xs font-medium ${
        styles[status]
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export default function TaskDetails() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [task, setTask] =
    useState(null);

  const [users, setUsers] =
    useState([]);

  const [
    selectedUsers,
    setSelectedUsers,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  // ================= FETCH =================

  useEffect(() => {
    fetchTask();

    fetchUsers();
  }, []);

  // ================= FETCH TASK =================

  const fetchTask =
    async () => {
      try {
        const res =
          await API.get(
            `/tasks/${id}`
          );

        setTask(
          res.data.task
        );

        if (
          res.data.task
            ?.assignedUsers
        ) {
          setSelectedUsers(
            res.data.task.assignedUsers.map(
              (u) => u._id
            )
          );
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

  // ================= FETCH USERS =================

  const fetchUsers =
    async () => {
      try {
        const res =
          await API.get("/team");

        setUsers(
          res.data.users || []
        );
      } catch (err) {
        console.log(err);
      }
    };

  // ================= TOGGLE USER =================

  const toggleUser = (
    userId
  ) => {
    if (
      selectedUsers.includes(
        userId
      )
    ) {
      setSelectedUsers(
        selectedUsers.filter(
          (id) =>
            id !== userId
        )
      );
    } else {
      setSelectedUsers([
        ...selectedUsers,
        userId,
      ]);
    }
  };

  // ================= ASSIGN TASK =================

  const assignTask =
    async () => {
      try {
        const res =
          await API.put(
            `/tasks/assign/${id}`,
            {
              users:
                selectedUsers,
            }
          );

        setTask(
          res.data.task
        );

        alert(
          "Task assigned successfully"
        );
      } catch (err) {
        console.log(err);

        alert(
          err.response?.data
            ?.msg ||
            "Assignment failed"
        );
      }
    };

  // ================= COMPLETE TASK =================

  const completeTask =
    async () => {
      try {
        const res =
          await API.put(
            `/tasks/status/${id}`,
            {
              status:
                "completed",
            }
          );

        setTask(
          res.data.task
        );

        alert(
          "Task completed"
        );
      } catch (err) {
        console.log(err);

        alert(
          "Update failed"
        );
      }
    };

  // ================= LOADING =================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="flex min-h-screen items-center justify-center bg-slate-100">
          Loading...
        </div>
      </>
    );
  }

  // ================= NOT FOUND =================

  if (!task) {
    return (
      <>
        <Navbar />

        <div className="flex min-h-screen items-center justify-center bg-slate-100">
          Task not found
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-6">
        
        <div className="mx-auto max-w-6xl">
          
          {/* BACK */}

          <button
            onClick={() =>
              navigate("/profile")
            }
            className="mb-6 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />

            Back
          </button>

          {/* TASK INFO */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              
              <div>
                
                <div className="mb-4">
                  <StatusBadge
                    status={
                      task.status
                    }
                  />
                </div>

                <h1 className="text-3xl font-semibold text-slate-800">
                  {task.taskName}
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                  {task.description}
                </p>

                {/* DATES */}

                <div className="mt-6 flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:gap-8">
                  
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />

                    <span>
                      Start:
                      {" "}
                      {task.startDate?.slice(
                        0,
                        10
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />

                    <span>
                      End:
                      {" "}
                      {task.endDate?.slice(
                        0,
                        10
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION */}

              <button
                onClick={
                  completeTask
                }
                disabled={
                  task.status ===
                  "completed"
                }
                className={`rounded-lg px-4 py-3 text-sm font-medium text-white transition ${
                  task.status ===
                  "completed"
                    ? "cursor-not-allowed bg-emerald-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {task.status ===
                "completed"
                  ? "Completed"
                  : "Mark Complete"}
              </button>
            </div>
          </div>

          {/* ASSIGN USERS */}

          <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
            
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-500" />

                <h2 className="text-lg font-semibold text-slate-800">
                  Assign Team Members
                </h2>
              </div>

              <button
                onClick={assignTask}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>

            {/* USERS */}

            <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
              
              {users.map((user) => (
                <label
                  key={user._id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50"
                >
                  
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(
                      user._id
                    )}
                    onChange={() =>
                      toggleUser(
                        user._id
                      )
                    }
                    className="h-4 w-4"
                  />

                  <div>
                    <h3 className="text-sm font-medium text-slate-800">
                      {user.firstName}{" "}
                      {user.lastName}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {user.post}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ASSIGNED USERS */}

          <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
            
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Assigned Members
              </h2>
            </div>

            <div className="p-6">
              
              {task.assignedUsers
                ?.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No members assigned.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  
                  {task.assignedUsers.map(
                    (member) => (
                      <div
                        key={
                          member._id
                        }
                        className="rounded-lg border border-slate-200 p-4"
                      >
                        
                        <h3 className="text-sm font-medium text-slate-800">
                          {
                            member.firstName
                          }{" "}
                          {
                            member.lastName
                          }
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {member.email}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}