import { useState } from "react";
import analyzeSelectedFiles, {
  analyzeGitHubRepository,
} from "../api/analyzer.api";
import filterSupportedFiles from "../utils/analyzer.utils.js";

function useProjectAnalysis({
  selectedFiles,
  setCurrentPage,
  setExpandedFile,
}) {
  const [isLocalScanning, setIsLocalScanning] = useState(false);
  const [isGitHubScanning, setIsGitHubScanning] = useState(false);
  const [localScanError, setLocalScanError] = useState("");
  const [githubScanError, setGithubScanError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleScanProject = async () => {
    if (selectedFiles.length === 0) {
      setLocalScanError("Please select a project folder first.");
      return;
    }

    setIsLocalScanning(true);
    setLocalScanError("");
    setAnalysisResult(null);
    setCurrentPage(1);
    setExpandedFile(null);

    try {
      const filesToAnalyze = filterSupportedFiles(selectedFiles);

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

      const result = await analyzeSelectedFiles(filesWithContent);

      setAnalysisResult(result.data);
    } catch (error) {
      setLocalScanError(
        error.message || "Something went wrong during scanning.",
      );
    } finally {
      setIsLocalScanning(false);
    }
  };

  const handleScanGitHubRepository = async (repositoryUrl) => {
    if (!repositoryUrl.trim()) {
      setGithubScanError("Please enter a GitHub repository URL.");
      return;
    }
    setIsGitHubScanning(true);
    setGithubScanError("");
    setAnalysisResult(null);
    setCurrentPage(1);
    setExpandedFile(null);
    try {
      const result = await analyzeGitHubRepository(repositoryUrl.trim());
      setAnalysisResult(result.data);
    } catch (error) {
      setGithubScanError(
        error.message ||
          "Something went wrong while scanning the GitHub repository.",
      );
    } finally {
      setIsGitHubScanning(false);
    }
  };

  return {
    isLocalScanning,
    isGitHubScanning,
    localScanError,
    githubScanError,
    analysisResult,
    handleScanProject,
    handleScanGitHubRepository,
  };
}

export default useProjectAnalysis;
