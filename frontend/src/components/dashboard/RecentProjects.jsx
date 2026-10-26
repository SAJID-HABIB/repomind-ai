function RecentProjects() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent Projects</h2>

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

        <h3 className="mt-4 font-medium text-white">No repositories yet</h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
          Add your first repository to explore API flows, frontend-backend
          connections, and your code graph.
        </p>
      </div>
    </section>
  );
}

export default RecentProjects;
