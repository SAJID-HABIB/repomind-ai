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
  files,
  currentFiles,
  currentPage,
  totalPages,
  expandedFile,
  setExpandedFile,
  setCurrentPage,
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Repositories
        </h1>

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
        />
      )}
    </div>
  );
}

export default Repositories;
