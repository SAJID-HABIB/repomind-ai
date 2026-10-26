function FileAnalysisResults({
  analysisResult,
  files,
  currentFiles,
  currentPage,
  totalPages,
  expandedFile,
  setExpandedFile,
  setCurrentPage,
}) {
  return (
    <>
      <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-4">
        <h3 className="font-semibold text-white">Analysis Complete</h3>

        <p className="mt-2 text-sm text-slate-300">
          Total Files: {analysisResult.totalFiles}
        </p>

        <h4 className="mt-4 font-semibold text-white">Language Counts</h4>

        <ul className="mt-2 text-sm text-slate-400">
          {Object.entries(analysisResult?.languageCounts || {}).map(
            ([language, count]) => (
              <li key={language}>
                {language}: {count} files
              </li>
            ),
          )}
        </ul>
        {/* File Analysis Results */}
        <h4 className="mt-6 font-semibold text-white">File Analysis Results</h4>

        <div className="mt-3 space-y-3">
          {files.length === 0 ? (
            <p>No file available for the analysis.</p>
          ) : (
            currentFiles.map((file) => (
              <div
                key={file.file}
                onClick={() =>
                  setExpandedFile(expandedFile === file.file ? null : file.file)
                }
                className="rounded-lg border border-slate-700 p-3"
              >
                <p className="break-all text-sm font-medium text-white">
                  {file.file}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Extension: {file.extension || "Unknown"}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Language: {file.language}
                </p>
                {file.analysisError && (
                  <p className="mt-2 wrap-break-words text-sm text-red-400">
                    Analysis Error: {file.analysisError}
                  </p>
                )}
                <p className="mt-2 text-sm text-slate-300">
                  Functions: {file.functions?.length ?? 0}
                </p>
                {file.functions?.length > 0 && (
                  <p className="mt-1 wrap-break-words text-sm text-slate-400">
                    Function Names: {file.functions.join(",")}
                  </p>
                )}
                {file.functionDetails?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm font-semibold text-white">
                      Function Parameters:
                    </p>
                    {file.functionDetails.map((func, index) => (
                      <p
                        key={`${func.name}${index}`}
                        className="wrap-break-words text-sm text-slate-400"
                      >
                        {func.name}({func.parameters?.join(", ")})
                      </p>
                    ))}
                  </div>
                )}
                <p className="text-sm text-slate-300">
                  Classes: {file.classes?.length ?? 0}
                </p>
                {file.classes?.length > 0 && (
                  <p className="mt-1 wrap-break-words text-sm text-slate-400">
                    Class Names: {file.classes.join(",")}
                  </p>
                )}

                <p className="text-sm text-slate-300">
                  Imports: {file.imports?.length ?? 0}
                </p>
                {file.imports?.length > 0 && (
                  <p className="mt-1 wrap-break-words text-sm text-slate-400">
                    Import Names: {file.imports.join(", ")}
                  </p>
                )}
                {expandedFile === file.file && (
                  <div className="mt-4 space-y-3 border-t border-slate-700 pt-3">
                    <div>
                      <h5 className="text-sm font-semibold text-white">
                        Function Names :
                      </h5>
                      <p className="text-sm text-slate-400">
                        {file.functions?.length
                          ? file.functions.join(",")
                          : "None detected"}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-white">
                        Class Names :
                      </h5>
                      <p className="text-sm text-slate-400">
                        {file.classes?.length
                          ? file.classes.join(",")
                          : "None detected"}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-white">
                        Imports :
                      </h5>
                      <p className="text-sm text-slate-400">
                        {file.imports?.length
                          ? file.imports.join(",")
                          : "None detected"}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-white">
                        Export :
                      </h5>
                      <p className="text-sm text-slate-400">
                        {file.exports?.length
                          ? file.exports.join(",")
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
