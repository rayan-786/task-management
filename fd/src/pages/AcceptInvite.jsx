import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import API from "../api";
import { useWorkspace } from "../context/WorkspaceContext";

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshWorkspaces } = useWorkspace();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ success: false, msg: "" });

  useEffect(() => {
    if (!token) {
      setStatus({ success: false, msg: "Missing invitation token." });
      setLoading(false);
      return;
    }

    const accept = async () => {
      try {
        const res = await API.post("/api/workspaces/accept-invite", { token });
        if (res.data.success) {
          setStatus({ success: true, msg: res.data.msg });
          await refreshWorkspaces();
          setTimeout(() => navigate("/dashboard"), 2000);
        }
      } catch (err) {
        setStatus({
          success: false,
          msg: err.response?.data?.msg || "Failed to accept invitation.",
        });
      } finally {
        setLoading(false);
      }
    };

    accept();
  }, [token, navigate, refreshWorkspaces]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Validating your workspace invitation...
            </p>
          </div>
        ) : status.success ? (
          <div className="space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Welcome to the Workspace!
            </h2>
            <p className="text-xs text-slate-500">{status.msg}</p>
            <p className="text-xs text-blue-600 animate-pulse">
              Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Invitation Error
            </h2>
            <p className="text-xs text-rose-600">{status.msg}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
