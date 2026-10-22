import { useState } from "react";
import analyzeSelectedFiles from "../api/analyzer.api";
import filterSupportedFiles from "../utils/analyzer.utils";

function useProjectAnalysis({
  selectedFiles,
  setCurrentPage,
  setExpandedFile,
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleScanProject = async () => {
    if (selectedFiles.length === 0) {
      setScanError("Please select a project folder first.");
      return;
    }

    setIsScanning(true);
    setScanError("");
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
      setScanError(error.message || "Something went wrong during scanning.");
    } finally {
      setIsScanning(false);
    }
  };

  return {
    isScanning,
    scanError,
    analysisResult,
    handleScanProject,
  };
}

export default useProjectAnalysis;
