// fd/src/pages/UserDetails.jsx

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
  Mail,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  ListTodo,
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

export default function UserDetails() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // ================= FETCH =================

  useEffect(() => {
    getUserDetails();
  }, [id]);

  const getUserDetails =
    async () => {
      try {
        const res =
          await API.get(
            `/team/${id}`
          );

        setData(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
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

  if (!data) {
    return (
      <>
        <Navbar />

        <div className="flex min-h-screen items-center justify-center bg-slate-100">
          User not found
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-6">
        
        <div className="mx-auto max-w-7xl">
          
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

          {/* USER CARD */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              
              <div>
                
                <h1 className="text-3xl font-semibold text-slate-800">
                  {
                    data.user
                      .firstName
                  }{" "}
                  {
                    data.user
                      .lastName
                  }
                </h1>

                <div className="mt-5 space-y-3">
                  
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />

                    <span>
                      {
                        data.user
                          .email
                      }
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Briefcase className="h-4 w-4 text-slate-400" />

                    <span>
                      {
                        data.user
                          .post
                      }
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Building2 className="h-4 w-4 text-slate-400" />

                    <span>
                      {
                        data.user
                          .department
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Total Tasks
                </p>

                <ListTodo className="h-5 w-5 text-slate-400" />
              </div>

              <h2 className="mt-4 text-3xl font-semibold text-slate-800">
                {
                  data.stats
                    .totalTasks
                }
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
                {
                  data.stats
                    .completedTasks
                }
              </h2>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Pending
                </p>

                <Clock3 className="h-5 w-5 text-amber-500" />
              </div>

              <h2 className="mt-4 text-3xl font-semibold text-slate-800">
                {
                  data.stats
                    .pendingTasks
                }
              </h2>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  In Progress
                </p>

                <Clock3 className="h-5 w-5 text-blue-500" />
              </div>

              <h2 className="mt-4 text-3xl font-semibold text-slate-800">
                {
                  data.stats
                    .inProgressTasks
                }
              </h2>
            </div>
          </div>

          {/* TASK TABLE */}

          <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
            
            <div className="border-b border-slate-200 px-6 py-4">
              
              <h2 className="text-lg font-semibold text-slate-800">
                Assigned Tasks
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tasks assigned to this member
              </p>
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
                  </tr>
                </thead>

                <tbody>
                  
                  {data.tasks.length >
                  0 ? (
                    data.tasks.map(
                      (task) => (
                        <tr
                          key={
                            task._id
                          }
                          className="border-t border-slate-100"
                        >
                          
                          <td className="px-6 py-4">
                            <div>
                              
                              <h3 className="font-medium text-slate-800">
                                {
                                  task.taskName
                                }
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                {
                                  task.description
                                }
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
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      
                      <td
                        colSpan="4"
                        className="px-6 py-10 text-center text-sm text-slate-500"
                      >
                        No tasks assigned
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}