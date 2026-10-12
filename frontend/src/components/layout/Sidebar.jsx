const navigationItems = [
  { name: "Dashboard", icon: "⌂", active: true },
  { name: "Repositories", icon: "▤", active: false },
  { name: "API Tracing", icon: "⇄", active: false },
  { name: "Code Graph", icon: "◎", active: false },
  { name: "AI Assistant", icon: "✳", active: false },
];

function Sidebar() {
  return (
    <aside className="flex h-full min-h-screen w-full flex-col bg-slate-950 p-5 text-slate-300">
      {/* Logo and Brand */}
      <div className="mb-10 flex shrink-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
          R
        </div>

        <div className="min-w-0">
          <h1 className="whitespace-nowrap text-lg font-bold text-white">
            RepoMind AI
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Code Intelligence
          </p>
        </div>
      </div>

      {/* Section Heading */}
      <p className="mb-3 shrink-0 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Workspace
      </p>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navigationItems.map((item) => (
          <a
            key={item.name}
            href="#"
            className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              item.active
                ? "bg-blue-600/15 font-medium text-blue-400"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span className="flex w-6 shrink-0 items-center justify-center text-lg">
              {item.icon}
            </span>

            <span className="whitespace-nowrap">{item.name}</span>
          </a>
        ))}
      </nav>

      {/* Bottom Card */}
      <div className="mt-6 shrink-0 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-sm font-medium text-white">RepoMind AI</p>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Understand your codebase, one connection at a time.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;