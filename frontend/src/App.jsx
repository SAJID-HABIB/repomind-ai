import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import StatCard from "./components/dashboard/StatCard";
import FileAnalysisResults from "./modules/analyzer/components/FileAnalysisResults";
import useProjectFiles from "./modules/analyzer/hooks/useProjectFiles";
import useProjectAnalysis from "./modules/analyzer/hooks/useProjectAnalysis";
import ProjectStatistics from "./components/dashboard/ProjectStatistics";
import RecentProjects from "./components/dashboard/RecentProjects";
import AnalyzeLocalFolder from "./modules/analyzer/components/AnalyzeLocalFolder";
import AnalyzeGitHubRepository from "./modules/analyzer/components/AnalyzeGitHubRepository";
import "./App.css";
function App() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const { selectedFiles, selectedFolderName, handleFolderChange } =
    useProjectFiles();
  const [expandedFile, setExpandedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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

          {/* File Analysis Results */}
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
            />
          )}

          <ProjectStatistics totalFiles={analysisResult?.totalFiles ?? 0} />

          <RecentProjects />
        </main>
      </div>
    </div>
  );
}

export default App;
