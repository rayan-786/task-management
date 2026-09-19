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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/50 text-center space-y-4">
        {loading ? (
          <div className="space-y-3 py-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              Validating your workspace invitation...
            </p>
          </div>
        ) : status.success ? (
          <div className="space-y-3 py-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">
              Welcome to the Workspace!
            </h2>
            <p className="text-xs text-slate-600">{status.msg}</p>
            <p className="text-xs font-semibold text-blue-600 animate-pulse pt-2">
              Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">
              Invitation Error
            </h2>
            <p className="text-xs text-rose-600 font-medium">{status.msg}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
