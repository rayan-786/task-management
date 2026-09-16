export default function Select({
  label,
  options = [],
  value,
  onChange,
  error,
  id,
  className = "",
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 py-2 text-sm transition-all focus:outline-none focus:ring-2 appearance-none cursor-pointer ${
          error
            ? "border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
