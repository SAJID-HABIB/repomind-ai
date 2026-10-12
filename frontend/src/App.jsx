import { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Navbar from './components/layout/Navbar'
import StatCard from './components/dashboard/StatCard'
import './App.css'
function App() {

  const [isSideBarOpen ,setIsSideBarOpen] = useState(false);

  return (
      <div className="flex min-h-screen w-full bg-slate-950">
    {/* Desktop Sidebar */}
<div className="hidden md:block">
  <Sidebar />
</div>

{/* Mobile Sidebar */}
{isSideBarOpen && (
  <div className="fixed inset-0 z-50 md:hidden">
    {/* Background overlay */}
    <button
      type="button"
      aria-label="Close sidebar"
      className="absolute inset-0 bg-black/60"
      onClick={() => setIsSideBarOpen(false)}
    />

    {/* Sidebar panel */}
<div className="relative h-full w-64 max-w-[85vw] overflow-y-auto bg-slate-900 shadow-2xl shadow-black/50">      <button
        type="button"
        aria-label="Close sidebar"
        className="absolute right-3 top-4 z-10 rounded-lg px-3 py-2 text-white hover:bg-slate-800"
        onClick={() => setIsSideBarOpen(false)}
      >
        ✕
      </button>

      <Sidebar />
    </div>
  </div>
)}

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        <Navbar onMenuClick={() => setIsSideBarOpen(true)} />

        <main className="w-full space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
  {/* Page Heading */}
  <div>
    <h1 className="text-2xl font-bold text-white">
      Dashboard Overview
    </h1>

    <p className="mt-2 text-sm text-slate-400">
      Understand your codebase with RepoMind AI.
    </p>
  </div>

  {/* Analyze Repository */}
  <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/15 text-2xl text-blue-400">
        ↗
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white">
          Analyze Repository
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Start understanding your project's code structure.
        </p>
      </div>
    </div>

    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        placeholder="Enter GitHub repository URL..."
        className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
      />

      <button
        type="button"
        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
      >
        Analyze Repository
      </button>
    </div>

    <p className="mt-3 text-xs text-slate-500">
      Repository analysis functionality will be connected later.
    </p>
  </section>

  {/* Project Statistics */}
<section>
  <h2 className="mb-4 text-lg font-semibold text-white">
    Project Statistics
  </h2>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard title="Repositories" value="0" />
    <StatCard title="Files Analyzed" value="0" />
    <StatCard title="API Endpoints" value="0" />
    <StatCard title="Code Connections" value="0" />
  </div>
</section>

  {/* Recent Projects */}
  <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Recent Projects
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Your recently analyzed repositories will appear here.
        </p>
      </div>

      <span className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400">
        0 Projects
      </span>
    </div>

    <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 px-4 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl text-slate-400">
        ▤
      </div>

      <h3 className="mt-4 font-medium text-white">
        No repositories yet
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
        Add your first repository to explore API flows,
        frontend-backend connections, and your code graph.
      </p>
    </div>
  </section>
</main>
      </div>
    </div>
  )
}

export default App
