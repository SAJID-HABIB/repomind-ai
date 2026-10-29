import { useLocation } from "react-router-dom";
function Navbar({ onMenuClick }) {
  const location = useLocation();

const pageDetails = {
  "/": {
    title: "Dashboard",
    description: "Welcome back! Explore your codebase.",
  },
  "/repositories": {
    title: "Repositories",
    description: "Analyze and manage your repositories.",
  },
  "/api-tracing": {
    title: "API Tracing",
    description: "Explore API endpoints and request flows.",
  },
  "/code-graph": {
    title: "Code Graph",
    description: "Visualize relationships between your files.",
  },
  "/ai-assistant": {
    title: "AI Assistant",
    description: "Get help understanding your codebase.",
  },
};

const currentPage = pageDetails[location.pathname] || pageDetails["/"];
  return (
    <header className="flex w-full flex-col gap-3 border-b border-slate-800 bg-slate-950 px-4 py-4 sm:px-6 lg:min-h-20 lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:px-8">
      {/* Left Section */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 text-lg text-white transition hover:bg-slate-900 md:hidden"
        >
          ☰
        </button>

        {/* Page Title */}
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-white sm:text-lg">
            {currentPage.title}
          </h2>

          <p className="hidden text-sm text-slate-500 sm:block">
            {currentPage.description}
          </p>

          <p className="text-xs text-slate-500 sm:hidden">{currentPage.description}</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full min-w-0 items-center gap-2 sm:gap-4 lg:w-auto lg:shrink-0 lg:gap-5">
        {/* Search - Hidden on Mobile */}
        <div className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 lg:w-72 lg:gap-3 lg:px-4">
          <span className="text-slate-500">⌕</span>

          <input
            type="text"
            placeholder="Search your code..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />

          <span className="rounded border border-slate-700 px-1.5 py-0.5 text-xs text-slate-500">
            /
          </span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 text-lg text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          ♧
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        {/* User Profile - Hidden on Small Mobile */}
        <div className="flex shrink-0 items-center border-l border-slate-800 pl-2 sm:gap-3 sm:pl-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/20 font-semibold text-blue-400">
            SH
          </div>

          <div className="hidden lg:block">
            <p className="text-sm font-medium text-white">Developer</p>

            <p className="text-xs text-slate-500">Free Plan</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
