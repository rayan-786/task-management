// fd/src/pages/Profile.jsx

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  CheckCircle2,
  Clock3,
  Trash2,
  Users,
  Plus,
  Briefcase,
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
        styles[status] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

// ================= INPUT FIELD =================

function InputField({
  label,
  ...props
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        {...props}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

// ================= MAIN COMPONENT =================

export default function Profile() {
  const navigate =
    useNavigate();

  const tasksRef = useRef(null);

  const usersRef = useRef(null);

  const [user, setUser] =
    useState(null);

  const [tasks, setTasks] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [
    taskModal,
    setTaskModal,
  ] = useState(false);

  const [
    userModal,
    setUserModal,
  ] = useState(false);

  const [taskForm, setTaskForm] =
    useState({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
    });

  const [userForm, setUserForm] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      post: "",
      department: "",
    });

  // ================= SCROLL =================

  const scrollToTasks = () => {
    tasksRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const scrollToUsers = () => {
    usersRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // ================= FETCH DATA =================

  useEffect(() => {
    fetchProfile();

    fetchTasks();

    fetchUsers();
  }, []);

  // ================= PROFILE =================

  const fetchProfile =
    async () => {
      try {
        const res =
          await API.get(
            "/auth/profile"
          );

        setUser(res.data.user);
      } catch (err) {
        console.log(err);
      }
    };

  // ================= TASKS =================

  const fetchTasks =
    async () => {
      try {
        const res =
          await API.get(
            "/tasks"
          );

        setTasks(
          res.data.tasks || []
        );
      } catch (err) {
        console.log(err);

        setTasks([]);
      }
    };

  // ================= USERS =================

  const fetchUsers =
    async () => {
      try {
        const res =
          await API.get(
            "/team"
          );

        setUsers(
          res.data.users || []
        );
      } catch (err) {
        console.log(err);

        setUsers([]);
      }
    };

  // ================= COUNTS =================

  const stats = useMemo(() => {
    return {
      total: tasks.length,

      completed:
        tasks.filter(
          (t) =>
            t.status ===
            "completed"
        ).length,

      progress:
        tasks.filter(
          (t) =>
            t.status ===
            "in_progress"
        ).length,
    };
  }, [tasks]);

  // ================= CREATE TASK =================

  const handleCreateTask =
    async (e) => {
      e.preventDefault();

      try {
        const res =
          await API.post(
            "/tasks/create",
            {
              taskName:
                taskForm.name,

              description:
                taskForm.description,

              startDate:
                taskForm.startDate,

              endDate:
                taskForm.endDate,
            }
          );

        setTasks((prev) => [
          res.data.task,
          ...prev,
        ]);

        setTaskModal(false);

        setTaskForm({
          name: "",
          description: "",
          startDate: "",
          endDate: "",
        });
      } catch (err) {
        console.log(err);
      }
    };

  // ================= CREATE USER =================

  const handleCreateUser =
    async (e) => {
      e.preventDefault();

      try {
        const res =
          await API.post(
            "/team/create",
            userForm
          );

        setUsers((prev) => [
          res.data.user,
          ...prev,
        ]);

        setUserModal(false);

        setUserForm({
          firstName: "",
          lastName: "",
          email: "",
          post: "",
          department: "",
        });
      } catch (err) {
        console.log(err);
      }
    };

  // ================= DELETE TASK =================

  const handleDeleteTask =
    async (id) => {
      try {
        await API.delete(
          `/tasks/delete/${id}`
        );

        setTasks((prev) =>
          prev.filter(
            (task) =>
              task._id !== id
          )
        );
      } catch (err) {
        console.log(err);
      }
    };

  // ================= COMPLETE TASK =================

  const handleCompleteTask =
    async (id) => {
      try {
        const res =
          await API.put(
            `/tasks/status/${id}`,
            {
              status:
                "completed",
            }
          );

        setTasks((prev) =>
          prev.map((task) =>
            task._id === id
              ? res.data.task
              : task
          )
        );
      } catch (err) {
        console.log(err);
      }
    };

  // ================= LOADING =================

  if (!user) {
    return (
      <>
        <Navbar />

        <div className="flex h-screen items-center justify-center bg-slate-100">
          Loading...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar
        scrollToTasks={
          scrollToTasks
        }
        scrollToUsers={
          scrollToUsers
        }
      />

      <div className="min-h-screen bg-slate-100 p-6">
        
        <div className="mx-auto max-w-7xl">
          
          {/* HEADER */}

          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            
            <div>
              <h1 className="text-3xl font-semibold text-slate-800">
                Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your tasks and team members.
              </p>
            </div>

            <div className="flex gap-3">
              
              <button
                onClick={() =>
                  setTaskModal(true)
                }
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />

                Create Task
              </button>

              <button
                onClick={() =>
                  setUserModal(true)
                }
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Users className="h-4 w-4" />

                Add Member
              </button>
            </div>
          </div>

          {/* STATS */}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Total Tasks
                </p>

                <Briefcase className="h-5 w-5 text-slate-400" />
              </div>

              <h2 className="mt-4 text-3xl font-semibold text-slate-800">
                {stats.total}
              </h2>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Completed
                </p>

                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>

              <h2 className="mt-4 text-3xl font-semibold text-slate-800">
                {stats.completed}
              </h2>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  In Progress
                </p>

                <Clock3 className="h-5 w-5 text-amber-500" />
              </div>

              <h2 className="mt-4 text-3xl font-semibold text-slate-800">
                {stats.progress}
              </h2>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Team Members
                </p>

                <Users className="h-5 w-5 text-blue-500" />
              </div>

              <h2 className="mt-4 text-3xl font-semibold text-slate-800">
                {users.length}
              </h2>
            </div>
          </div>

          {/* TASKS */}

          <div
            ref={tasksRef}
            className="mt-10 rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Tasks
              </h2>
            </div>

            <div className="overflow-x-auto">
              
              <table className="w-full">
                
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    
                    <th className="px-6 py-4 text-sm font-medium text-slate-500">
                      Task
                    </th>

                    <th className="px-6 py-4 text-sm font-medium text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-medium text-slate-500">
                      Start Date
                    </th>

                    <th className="px-6 py-4 text-sm font-medium text-slate-500">
                      End Date
                    </th>

                    <th className="px-6 py-4 text-sm font-medium text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tasks.map((task) => (
                    <tr
                      key={task._id}
                      className="border-t border-slate-100"
                    >
                      
                      <td className="px-6 py-4">
                        <div>
                          <h3 className="font-medium text-slate-800">
                            {task.taskName}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {task.description}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            task.status
                          }
                        />
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {task.startDate?.slice(
                          0,
                          10
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {task.endDate?.slice(
                          0,
                          10
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          
                          <button
                            onClick={() =>
                              navigate(
                                `/task/${task._id}`
                              )
                            }
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              handleCompleteTask(
                                task._id
                              )
                            }
                            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                          >
                            Complete
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteTask(
                                task._id
                              )
                            }
                            className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TEAM */}

          <div
            ref={usersRef}
            className="mt-10 rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Team Members
              </h2>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
              
              {users.map((member) => (
                <div
                  key={member._id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  
                  <h3 className="text-lg font-semibold text-slate-800">
                    {member.firstName}{" "}
                    {member.lastName}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {member.email}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    
                    <span className="rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {member.post}
                    </span>

                    <span className="text-sm text-slate-500">
                      {member.department}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/users/${member._id}`
                      )
                    }
                    className="mt-5 w-full rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE TASK MODAL */}

      {taskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
            
            <h2 className="mb-6 text-xl font-semibold text-slate-800">
              Create Task
            </h2>

            <form
              onSubmit={
                handleCreateTask
              }
              className="space-y-4"
            >
              
              <InputField
                label="Task Name"
                value={taskForm.name}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    name:
                      e.target.value,
                  })
                }
              />

              <InputField
                label="Description"
                value={
                  taskForm.description
                }
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    description:
                      e.target.value,
                  })
                }
              />

              <InputField
                type="date"
                label="Start Date"
                value={
                  taskForm.startDate
                }
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    startDate:
                      e.target.value,
                  })
                }
              />

              <InputField
                type="date"
                label="End Date"
                value={
                  taskForm.endDate
                }
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    endDate:
                      e.target.value,
                  })
                }
              />

              <div className="flex justify-end gap-3 pt-4">
                
                <button
                  type="button"
                  onClick={() =>
                    setTaskModal(
                      false
                    )
                  }
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}

      {userModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
            
            <h2 className="mb-6 text-xl font-semibold text-slate-800">
              Add Team Member
            </h2>

            <form
              onSubmit={
                handleCreateUser
              }
              className="space-y-4"
            >
              
              <InputField
                label="First Name"
                value={
                  userForm.firstName
                }
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    firstName:
                      e.target.value,
                  })
                }
              />

              <InputField
                label="Last Name"
                value={
                  userForm.lastName
                }
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    lastName:
                      e.target.value,
                  })
                }
              />

              <InputField
                label="Email"
                type="email"
                value={
                  userForm.email
                }
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    email:
                      e.target.value,
                  })
                }
              />

              <InputField
                label="Post"
                value={userForm.post}
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    post:
                      e.target.value,
                  })
                }
              />

              <InputField
                label="Department"
                value={
                  userForm.department
                }
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    department:
                      e.target.value,
                  })
                }
              />

              <div className="flex justify-end gap-3 pt-4">
                
                <button
                  type="button"
                  onClick={() =>
                    setUserModal(
                      false
                    )
                  }
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}