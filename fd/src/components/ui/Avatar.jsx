export default function Avatar({
  user,
  name,
  src,
  size = "md",
  className = "",
}) {
  const displayName = name || user?.name || "User";
  const avatarUrl = src || user?.avatar;

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const sizeStyles = {
    xs: "w-5 h-5 text-[9px]",
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
    xl: "w-14 h-14 text-base",
  };

  const getBgColor = (str) => {
    const colors = [
      "bg-blue-600 text-white",
      "bg-emerald-600 text-white",
      "bg-purple-600 text-white",
      "bg-indigo-600 text-white",
      "bg-amber-600 text-white",
      "bg-rose-600 text-white",
      "bg-sky-600 text-white",
      "bg-teal-600 text-white",
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className={`rounded-full object-cover shrink-0 ring-1 ring-slate-200 ${
          sizeStyles[size] || sizeStyles.md
        } ${className}`}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      title={displayName}
      className={`rounded-full flex items-center justify-center font-bold shrink-0 ring-1 ring-white shadow-2xs select-none ${
        getBgColor(displayName)
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {initials}
    </div>
  );
}
