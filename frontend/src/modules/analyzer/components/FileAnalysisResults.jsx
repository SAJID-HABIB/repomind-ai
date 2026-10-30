function FileAnalysisResults({
  analysisResult,
  files,
  currentFiles,
  currentPage,
  totalPages,
  expandedFile,
  setExpandedFile,
  setCurrentPage,
  searchQuery,
  setSearchQuery,
}) {
  console.log("FileAnalysisResults is rendering");

  return (
    <>
      <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-4">
        <h3 className="font-semibold text-white">Analysis Complete</h3>

        {/* Analysis Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold tracking-tight text-white">
                Analysis Complete
              </h3>

              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                ✓ Completed
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-400">
              Repository analysis results and file insights
            </p>
          </div>

          {/* Total Files Card */}
          <div className="flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-slate-800/70 px-5 py-3 shadow-lg shadow-cyan-950/10">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-500/10 text-xl text-cyan-400">
              📁
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Total Files
              </p>

              <p className="text-2xl font-bold text-white">
                {analysisResult?.totalFiles ?? 0}
              </p>
            </div>
          </div>
        </div>
        {/* Search Files */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Search Repository Files
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search files by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        {/* Language Counts */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold text-white">Language Distribution</h4>

            <span className="text-xs text-slate-400">
              {Object.keys(analysisResult?.languageCounts || {}).length}{" "}
              Languages
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {Object.entries(analysisResult?.languageCounts || {}).map(
              ([language, count]) => (
                <div
                  key={language}
                  className="flex min-w-[130px] items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-800/70 px-4 py-3 transition hover:border-cyan-500/40 hover:bg-slate-800"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-sm font-bold text-cyan-400">
                    {language.slice(0, 1).toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      {language}
                    </p>

                    <p className="text-xs text-slate-400">
                      {count} {count === 1 ? "file" : "files"}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
        {/* File Analysis Results */}
        <h4 className="mt-6 font-semibold text-white">File Analysis Results</h4>

        <div className="mt-3 space-y-3">
          {files.length === 0 ? (
            <p>No file available for the analysis.</p>
          ) : (
            currentFiles.map((file) => (
              <div
                key={file.file}
                className={`overflow-hidden rounded-xl border transition ${
                  expandedFile === file.file
                    ? "border-blue-500/60 bg-slate-900"
                    : "border-slate-700 bg-slate-900/50 hover:border-slate-500"
                }`}
              >
                {/* Compact File Card */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedFile(
                      expandedFile === file.file ? null : file.file,
                    )
                  }
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-all font-semibold text-white">
                        📄 {file.file}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {file.language} • {file.extension || "Unknown"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-lg bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-400">
                      {expandedFile === file.file ? "−" : "+"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300">
                      Functions: {file.functions?.length ?? 0}
                    </span>

                    <span className="rounded-lg bg-pink-500/10 px-3 py-1.5 text-xs text-pink-300">
                      Classes: {file.classes?.length ?? 0}
                    </span>

                    <span className="rounded-lg bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300">
                      Imports: {file.imports?.length ?? 0}
                    </span>
                  </div>
                </button>

                {/* Expanded File Details */}
                {expandedFile === file.file && (
                  <div className="space-y-4 border-t border-slate-700 p-4">
                    {file.analysisError && (
                      <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                        Analysis Error: {file.analysisError}
                      </p>
                    )}

                    {/* Functions */}
                    <div>
                      <h5 className="mb-2 font-semibold text-purple-300">
                        Functions ({file.functions?.length ?? 0})
                      </h5>

                      {file.functionDetails?.length > 0 ? (
                        <div className="space-y-2">
                          {file.functionDetails.map((func, index) => (
                            <div
                              key={`${func.name}-${index}`}
                              className="rounded-lg border border-slate-700 bg-slate-950 p-3"
                            >
                              <code className="break-all text-sm text-slate-200">
                                {func.name}({func.parameters?.join(", ")})
                              </code>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">None detected</p>
                      )}
                    </div>

                    {/* Classes */}
                    <div>
                      <h5 className="mb-2 font-semibold text-pink-300">
                        Classes ({file.classes?.length ?? 0})
                      </h5>

                      <p className="break-all text-sm text-slate-300">
                        {file.classes?.length
                          ? file.classes.join(", ")
                          : "None detected"}
                      </p>
                    </div>

                    {/* Imports */}
                    <div>
                      <h5 className="mb-2 font-semibold text-cyan-300">
                        Imports ({file.imports?.length ?? 0})
                      </h5>

                      {file.imports?.length > 0 ? (
                        <ul className="space-y-2">
                          {file.imports.map((item, index) => (
                            <li
                              key={`${item}-${index}`}
                              className="break-all rounded-lg bg-slate-950 p-2 text-sm text-slate-300"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-500">None detected</p>
                      )}
                    </div>

                    {/* Exports */}
                    <div>
                      <h5 className="mb-2 font-semibold text-emerald-300">
                        Exports ({file.exports?.length ?? 0})
                      </h5>

                      <p className="break-all text-sm text-slate-300">
                        {file.exports?.length
                          ? file.exports.join(", ")
                          : "None detected"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded bg-slate-700 text-white disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-white">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage >= totalPages}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default FileAnalysisResults;
