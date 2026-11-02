import AnalyzeLocalFolder from "../modules/analyzer/components/AnalyzeLocalFolder";
import AnalyzeGitHubRepository from "../modules/analyzer/components/AnalyzeGitHubRepository";
import FileAnalysisResults from "../modules/analyzer/components/FileAnalysisResults";

function Repositories({
  selectedFiles,
  selectedFolderName,
  handleFolderChange,
  handleScanProject,
  handleScanGitHubRepository,
  isLocalScanning,
  isGitHubScanning,
  localScanError,
  githubScanError,
  analysisResult,
   circularDependencies = [],
  files,
  currentFiles,
  currentPage,
  totalPages,
  expandedFile,
  setExpandedFile,
  setCurrentPage,
  setSearchQuery,
  searchQuery,
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Repositories</h1>

        <p className="mt-2 text-sm text-slate-400">
          Scan a local project or analyze a GitHub repository.
        </p>
      </div>

      <AnalyzeGitHubRepository
        handleScanGitHubRepository={handleScanGitHubRepository}
        isScanning={isGitHubScanning}
        scanError={githubScanError}
      />

      <AnalyzeLocalFolder
        selectedFiles={selectedFiles}
        selectedFolderName={selectedFolderName}
        handleFolderChange={handleFolderChange}
        handleScanProject={handleScanProject}
        isScanning={isLocalScanning}
        scanError={localScanError}
      />

      {analysisResult && (
        <FileAnalysisResults
          analysisResult={analysisResult}
          files={files}
          currentFiles={currentFiles}
          currentPage={currentPage}
          totalPages={totalPages}
          expandedFile={expandedFile}
          setExpandedFile={setExpandedFile}
          setCurrentPage={setCurrentPage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}
      {analysisResult && (
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 px-5 py-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  circularDependencies.length > 0
                    ? "bg-red-500/10 text-red-400"
                    : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                <span className="text-xl">
                  {circularDependencies.length > 0 ? "⚠" : "✓"}
                </span>
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Circular Dependencies
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Cross-file circular import analysis
                </p>
              </div>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                circularDependencies.length > 0
                  ? "bg-red-500/10 text-red-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {circularDependencies.length}{" "}
              {circularDependencies.length === 1 ? "Cycle" : "Cycles"} Found
            </span>
          </div>

          {/* Content */}
          <div className="p-5">
            {circularDependencies.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">
                  Circular import relationships were detected between these
                  files.
                </p>

                {circularDependencies.map((cycle, index) => (
                  <div
                    key={`${cycle.join("-")}-${index}`}
                    className="rounded-lg border border-red-500/20 bg-red-500/5 p-4"
                  >
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-red-400">
                      Cycle {String(index + 1).padStart(2, "0")}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {cycle.map((filePath, fileIndex) => {
                        const fileName = filePath.split("/").pop();

                        return (
                          <div
                            key={`${filePath}-${fileIndex}`}
                            className="flex min-w-0 items-center gap-2"
                          >
                            <span
                              title={filePath}
                              className="max-w-full break-all rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200"
                            >
                              {fileName}
                            </span>

                            {fileIndex < cycle.length - 1 && (
                              <span className="text-red-400">→</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <p className="mt-3 break-all text-xs text-slate-500">
                      {cycle.join(" → ")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                <span className="text-lg text-emerald-400">✓</span>
                <div>
                  <p className="text-sm font-medium text-emerald-400">
                    No circular dependencies found
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    No circular import relationships were detected in this
                    analysis.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Repositories;
