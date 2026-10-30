import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import useProjectFiles from "./modules/analyzer/hooks/useProjectFiles";
import useProjectAnalysis from "./modules/analyzer/hooks/useProjectAnalysis";
import Repositories from "./pages/Repositories";
import CodeGraph from "./pages/CodeGraph";
import ApiTracing from "./pages/ApiTracing";
import AIAssistant from "./pages/AIAssistant";
import Dashboard from "./pages/Dashboard";
import "./App.css";
function App() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const { selectedFiles, selectedFolderName, handleFolderChange } =
    useProjectFiles();
  const [expandedFile, setExpandedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    isLocalScanning,
    isGitHubScanning,
    localScanError,
    githubScanError,
    analysisResult,
    handleScanProject,
    handleScanGitHubRepository,
  } = useProjectAnalysis({
    selectedFiles,
    setCurrentPage,
    setExpandedFile,
  });

  const filesPerPage = 5;
  const files = analysisResult?.files || [];
  console.log("Full Analysis Result:", analysisResult);
  const filteredFiles = files.filter((file) =>
    file.file.toLowerCase().includes(searchQuery.toLocaleLowerCase()),
  );
      console.log({
  searchQuery,
  totalFiles: files.length,
  filteredFiles: filteredFiles.length,
});
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);
  const startIndex = (currentPage - 1) * filesPerPage;
  const currentFiles = filteredFiles.slice(startIndex, startIndex + filesPerPage);

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
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard totalFiles={analysisResult?.totalFiles ?? 0} />
              }
            />

            <Route
              path="/code-graph"
              element={<CodeGraph analysisResult={analysisResult} />}
            />

            <Route path="/api-tracing" element={<ApiTracing />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />

            <Route
              path="/repositories"
              element={
                <Repositories
                  selectedFiles={selectedFiles}
                  selectedFolderName={selectedFolderName}
                  handleFolderChange={handleFolderChange}
                  handleScanProject={handleScanProject}
                  handleScanGitHubRepository={handleScanGitHubRepository}
                  isLocalScanning={isLocalScanning}
                  isGitHubScanning={isGitHubScanning}
                  localScanError={localScanError}
                  githubScanError={githubScanError}
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
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
