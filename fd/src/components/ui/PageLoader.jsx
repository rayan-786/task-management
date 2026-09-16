import { Sparkles, Loader2 } from "lucide-react";

export default function PageLoader({ text = "Loading TaskFlow..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100">
      <div className="flex items-center gap-3 mb-4 select-none animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <Sparkles className="w-5 h-5 animate-spin" />
        </div>
        <span className="text-2xl font-bold tracking-tight">TaskFlow</span>
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span>{text}</span>
      </div>
    </div>
  );
}
