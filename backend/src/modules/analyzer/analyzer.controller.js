import { analyzeRepository, analyzeSelectedFiles } from "./analyzer.service.js";
import { validateAnalyzerRequest } from "./analyzer.validation.js";
import { analyzeGitHubRepository } from "./services/githubRepository.service.js";
import { buildDependencyGraph } from "./services/dependencyGraph.service.js";

async function analyzeRepositoryController(req, res) {
  try {
    const { repositoryPath, selectedFiles, repositoryUrl } = req.body ?? {};
    const validation = validateAnalyzerRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }
    if (typeof repositoryUrl === "string" && repositoryUrl.trim() !== "") {
      const result = await analyzeGitHubRepository(repositoryUrl);
      result.dependencyGraph = buildDependencyGraph(result.files);
      return res.status(200).json({
        success: true,
        message: "Repository scanned successfully.",
        data: result,
      });
    }

    if (Array.isArray(selectedFiles)) {
      const result = await analyzeSelectedFiles(selectedFiles);
      result.dependencyGraph = buildDependencyGraph(result.files);

      return res.status(200).json({
        success: true,
        message: "Selected project files analyzed successfully.",
        data: result,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Provide selectedFiles or a valid repositoryPath.",
    });
  } catch (error) {
    console.error("Analyzer Controller Error:", error);
    const clientErrors = [
      "No files were provided for analysis.",
      "No supported files were found for analysis.",
      "The repository path must be a directory.",
    ];
    if (clientErrors.includes(error.message)) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during analysis.",
    });
  }
}

export { analyzeRepositoryController };
