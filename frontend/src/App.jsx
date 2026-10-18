import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import StatCard from "./components/dashboard/StatCard";
import "./App.css";
function App() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFolderName, setSelectedFolderName] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [expandedFile, setExpandedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const handleFolderChange = (event) => {
    const files = Array.from(event.target.files || []);
    const excludedFolders = [
      "node_modules",
      ".git",
      "dist",
      "build",
      "coverage",
      ".next",
      ".venv",
      "venv",
      "__pycache__",
    ];
    const filteredFiles = files.filter((file) => {
      const pathParts = file.webkitRelativePath.split("/");
      return !pathParts.some((part) => excludedFolders.includes(part));
    });
    setSelectedFiles(filteredFiles);

    if (files.length > 0) {
      const folderName = files[0].webkitRelativePath.split("/")[0];
      setSelectedFolderName(folderName);
    } else {
      setSelectedFolderName("");
    }
  };

  const handleScanProject = async () => {
    if (selectedFiles.length === 0) {
      setScanError("Please select a project folder first.");
      return;
    }
    setIsScanning(true);
    setScanError("");
    setAnalysisResult(null);
    try {
      const supportedExtensions = [
        ".js",
        ".jsx",
        ".mjs",
        ".cjs",
        ".ts",
        ".tsx",
        ".py",
        ".java",
        ".c",
        ".h",
        ".cpp",
        ".hpp",
        ".cs",
        ".go",
        ".rs",
        ".php",
        ".rb",
        ".swift",
        ".kt",
        ".dart",
      ];
      const filesToAnalyze = selectedFiles.filter((file) => {
        const fileName = file.name.toLowerCase();
        return supportedExtensions.some((extension) =>
          fileName.endsWith(extension),
        );
      });
      console.log(
        "Selected files after folder filtering:",
        selectedFiles.length,
      );
      console.log(
        "Files selected for analysis:",
        filesToAnalyze.map((file) => file.webkitRelativePath),
      );
      if (filesToAnalyze.length === 0) {
        throw new Error("No supported source code files were found.");
      }
      const totalSize = filesToAnalyze.reduce(
        (total, file) => total + file.size,
        0,
      );
      if (totalSize > 8 * 1024 * 1024) {
        throw new Error(
          "Selected source files exceed the 8 MB limit. Please select a smaller project.",
        );
      }
      const filesWithContent = await Promise.all(
        filesToAnalyze.map(async (file) => ({
          path: file.webkitRelativePath.split("/").slice(1).join("/"),
          content: await file.text(),
        })),
      );
      const response = await fetch("http://localhost:5000/api/analyzer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedFiles: filesWithContent,
        }),
      });
      const result = await response.json();
      console.log("Analysis Result:", result);
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Project analysis failed.");
      }
      setAnalysisResult(result.data);
      console.log("Complete API response:", result);
      console.log("Analysis data:", result.data);
      console.log("Total analyzed files:", result.data.totalFiles);
      console.log("Language counts:", result.data.languageCounts);
      console.log("First analyzed file:", result.data.files?.[0]);
    } catch (error) {
      setScanError(error.message || "Something went wrong during scanning.");
    } finally {
      setIsScanning(false);
    }
  };
  const filesPerPage = 5;
  const files = analysisResult?.files || [];
  const totalPages = Math.ceil(files.length / filesPerPage);
  const startIndex = (currentPage - 1) * filesPerPage;
  const currentFiles = files.slice(startIndex, startIndex + filesPerPage);
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
          <div className="relative h-full w-64 max-w-[85vw] overflow-y-auto bg-slate-900 shadow-2xl shadow-black/50">
            {" "}
            <button
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

          {/* Analyze Local Folder */}
          <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white">
              Analyze Local Folder
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Select a project folder from your computer to analyze its code.
            </p>

            <div className="mt-5">
              <label
                htmlFor="project-folder"
                className="inline-block cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                Browse Folder
              </label>

              <input
                id="project-folder"
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderChange}
                className="hidden"
              />
            </div>

            {selectedFolderName && (
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
                <p className="text-sm font-medium text-white">
                  Selected folder: {selectedFolderName}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {selectedFiles.length} files ready to scan
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleScanProject}
              disabled={selectedFiles.length === 0 || isScanning}
              className="mt-4 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isScanning ? "Scanning Project..." : "Scan Local Project"}
            </button>
            {analysisResult && (
              <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-4">
                <h3 className="font-semibold text-white">Analysis Complete</h3>

                <p className="mt-2 text-sm text-slate-300">
                  Total Files: {analysisResult.totalFiles}
                </p>

                <h4 className="mt-4 font-semibold text-white">
                  Language Counts
                </h4>

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
                <h4 className="mt-6 font-semibold text-white">
                  File Analysis Results
                </h4>

                <div className="mt-3 space-y-3">
                  {currentFiles.map((file) => (
                    <div
                      key={file.file}
                      onClick={() =>
                        setExpandedFile(
                          expandedFile === file.file ? null : file.file,
                        )
                      }
                      className="rounded-lg border border-slate-700 p-3"
                    >
                      <p className="break-all text-sm font-medium text-white">
                        {file.file}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Language: {file.language}
                      </p>

                      <p className="mt-2 text-sm text-slate-300">
                        Functions: {file.functions?.length ?? 0}
                      </p>
                      {file.functions?.length > 0 && (
                        <p className="mt-1 break-words text-sm text-slate-400">
                          Function Names: {file.functions.join(",")}
                        </p>
                      )}
                      <p className="text-sm text-slate-300">
                        Classes: {file.classes?.length ?? 0}
                      </p>
                      {file.classes?.length > 0 && (
                        <p className="mt-1 break-words text-sm text-slate-400">
                          Class Names: {file.classes.join(",")}
                        </p>
                      )}

                      <p className="text-sm text-slate-300">
                        Imports: {file.imports?.length ?? 0}
                      </p>
                      {file.imports?.length > 0 && (
                        <p className="mt-1 break-words text-sm text-slate-400">
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
                  ))}
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded bg-slate-700 text-white disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <span className="text-white">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Project Statistics */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              Project Statistics
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Repositories" value="0" />
              <StatCard
                title="Files Analyzed"
                value={analysisResult?.totalFiles ?? 0}
              />
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
                Add your first repository to explore API flows, frontend-backend
                connections, and your code graph.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
