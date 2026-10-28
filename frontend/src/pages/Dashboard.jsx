import ProjectStatistics from "../components/dashboard/ProjectStatistics";
import RecentProjects from "../components/dashboard/RecentProjects";

function Dashboard({totalFiles}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Dashboard Overview
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Understand your codebase with RepoMind AI.
        </p>
      </div>

      <ProjectStatistics totalFiles={totalFiles} />

      <RecentProjects />
    </div>
  );
}

export default Dashboard;