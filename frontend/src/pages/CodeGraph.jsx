import DependencyGraph from "../modules/analyzer/components/DependencyGraph";

function CodeGraph({ analysisResult }) {
  const dependencyGraph = analysisResult?.dependencyGraph;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Code Graph
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Explore relationships and dependencies between your project files.
        </p>
      </div>

      {dependencyGraph ? (
        <DependencyGraph
          nodes={dependencyGraph.nodes}
          edges={dependencyGraph.edges}
        />
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-base font-semibold text-white">
            No dependency graph available
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Scan a local folder or GitHub repository from the Repositories
            page first. The dependency graph will appear here when analysis
            results include file dependencies.
          </p>
        </div>
      )}
    </div>
  );
}

export default CodeGraph;