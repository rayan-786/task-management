import { Sparkles, Loader2 } from "lucide-react";

export default function PageLoader({ text = "Loading TaskFlow..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-900">
      <div className="flex items-center gap-3 mb-4 select-none">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-900">TaskFlow</span>
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span>{text}</span>
      </div>
    </div>
  );
}
