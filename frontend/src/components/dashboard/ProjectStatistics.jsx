import StatCard from "./StatCard";
function ProjectStatistics({ totalFiles }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-white">
        Project Statistics
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Repositories" value="0" />
        <StatCard title="Files Analyzed" value={totalFiles} />
        <StatCard title="API Endpoints" value="0" />
        <StatCard title="Code Connections" value="0" />
      </div>
    </section>
  );
}
export default ProjectStatistics;
