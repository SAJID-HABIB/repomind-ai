import path from "node:path";
import {
  supportedExtensions,
  ignoredDirectories,
} from "../constants/analyzer.constants.js";
import { analyzeJavaScriptSource } from "../parsers/javascript.parser.js";

 async function analyzeSelectedFiles(selectedFiles) {
  if (!Array.isArray(selectedFiles) || selectedFiles.length === 0) {
    throw new Error("No files were provided for analysis.");
  }
  const files = [];
  const languageCounts = {};
  for (const selectedFile of selectedFiles) {
    const relativePath = selectedFile.path;
    const sourceCode = selectedFile.content;
    if (typeof relativePath !== "string" || typeof sourceCode !== "string") {
      continue;
    }
    const normalizedPath = relativePath.replaceAll("\\", "/");
    const pathParts = normalizedPath.split("/");
    if (
      pathParts.some(
        (part) =>
          part === ".." ||
          part === "node_modules" ||
          part === ".git" ||
          part === "dist" ||
          part === "build" ||
          part === "coverage" ||
          part === ".next" ||
          part === ".venv" ||
          part === "venv" ||
          part === "__pycache__",
      )
    ) {
      continue;
    }
    const extension = path.extname(normalizedPath).toLowerCase();
    const language = supportedExtensions[extension];
    if (!language) {
      continue;
    }
    const fileResult = {
      file: normalizedPath,
      extension,
      language,
    };
    const javascriptExtensions = [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"];
    if (javascriptExtensions.includes(extension)) {
      try {
        const structure = analyzeJavaScriptSource(sourceCode, extension);
        Object.assign(fileResult, structure);
      } catch (error) {
        fileResult.analysisError = error.message;
      }
    }
    files.push(fileResult);
    languageCounts[language] = (languageCounts[language] || 0) + 1;
  }
  if (files.length === 0) {
    throw new Error("No supported files were found for analysis.");
  }
  return {
    totalFiles: files.length,
    languageCounts,
    files,
  };
}
 
export {analyzeSelectedFiles};