export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = "",
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-lg border bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 px-3.5 py-2 text-sm transition-all focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:opacity-60 ${
            Icon ? "pl-9" : ""
          } ${
            error
              ? "border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  rows = 4,
  className = "",
  id,
  ...props
}) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full rounded-lg border bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:opacity-60 ${
          error
            ? "border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
