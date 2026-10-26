import {
  ignoredDirectories,
  supportedExtensions,
} from "../constants/analyzer.constants.js";
import { analyzeJavaScriptSource } from "../parsers/javascript.parser.js";
import { resolveLocalDependency } from "./dependency.service.js";

const MAX_FILES = 500;
const MAX_FILES_SIZE = 1024 * 1024;
const MAX_TOTAL_SIZE = 8 * 1024 * 1024;

async function fetchGitHubJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    if (response.status === 400) {
      throw new Error(
        "GitHub repository or branch was not found, or the repository is private.",
      );
    }
    if (response.status === 403 || response.status === 429) {
      throw new Error("GitHub API rate limit reached. Please try again later");
    }
    throw new Error(`GitHub API request failed: ${response.status}`);
  }
  return response.json();
}

function shouldIgnorePath(filePath) {
  const segments = filePath.split("/");
  return segments.some((segment) => {
    if (segment.startsWith(".") && segment !== ".github") {
      return true;
    }
    return ignoredDirectories.has(segment);
  });
}

function parseGitHubUrl(repositoryUrl) {
  let url;
  try {
    url = new URL(repositoryUrl);
  } catch (error) {
    throw new Error("Please enter a valid GitHub repository URL.");
  }
  if (
    url.protocol !== "https:" ||
    url.hostname !== "github.com" ||
    url.port ||
    url.username ||
    url.password
  ) {
    throw new Error("Please enter a valid HTTPS GitHub repository URL.");
  }
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length !== 2) {
    throw new Error(
      "Use a repository URL like https://github.com/owner/repository.",
    );
  }
  const [owner, rawRepository] = segments;
  const repository = rawRepository.replace("/\.g$i", "");
  if (!owner || !rawRepository) {
    throw new Error("The GitHub repository URL is incomplete.");
  }
  return { owner, repository };
}

async function analyzeGitHubRepository(repositoryUrl) {
  const { owner, repository } = parseGitHubUrl(repositoryUrl);
  const repositoryApiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;
  const repositoryInfo = await fetchGitHubJson(repositoryApiUrl);
  const branch = repositoryInfo.default_branch;
  if (!branch) {
    throw new Error("Could not determine the repository's default branch.");
  }
  const treeUrl = `${repositoryApiUrl}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
  const treeData = await fetchGitHubJson(treeUrl);
  if (treeData.truncated) {
    throw new Error(
      "This repository is too large to scan completely in one request.",
    );
  }

  const sourceFiles = treeData.tree.filter((item) => {
    if (item.type !== "blob" || shouldIgnorePath(item.path)) {
      return false;
    }
    const extension = item.path.slice(item.path.lastIndexOf(".")).toLowerCase();
    return Boolean(supportedExtensions[extension]);
  });

  if (sourceFiles.length > MAX_FILES) {
    throw new Error(
      `This repository contains more than ${MAX_FILES} supported files. Please use a smaller repository.`,
    );
  }
  const selectedFile = sourceFiles.filter(
    (file) => (file.size ?? 0) <= MAX_FILES_SIZE,
  );
  if (selectedFile.length === 0) {
    throw new Error("No source files are within the 1 MB per-file limit.");
  }
  const totalSize = selectedFile.reduce(
    (total, file) => total + (file.size ?? 0),
    0,
  );
  if (totalSize > MAX_TOTAL_SIZE) {
    throw new Error(
      "The repository's supported source files exceed the 8 MB total limit.",
    );
  }
  const files = [];
  for (const sourceFiles of selectedFile) {
    const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/${encodeURIComponent(branch)}/${sourceFiles.path.split("/").map(encodeURIComponent).join("/")}`;
    const response = await fetch(rawUrl, {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      throw new Error(`Could not retrieve source file: ${sourceFiles.path}`);
    }
    const sourceCode = await response.text();
    if (sourceFiles.path === "package.json") {
    }
    const extension = sourceFiles.path
      .slice(sourceFiles.path.lastIndexOf("."))
      .toLowerCase();
    const fileResult = {
      file: sourceFiles.path,
      extension,
      language: supportedExtensions[extension],
    };
    if (sourceFiles.path.endsWith("package.json")) {
      try {
        const packageData = JSON.parse(sourceCode);
        fileResult.packageDependencies = packageData.dependencies || {};
        fileResult.devDependencies = packageData.devDependencies || {};
      } catch (error) {
        fileResult.analysisError = error.message;
      }
    }
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
  }
  const filePaths = new Set(files.map((file) => file.file));

  for (const file of files) {
    file.dependencies = [];

    if (Array.isArray(file.imports)) {
      for (const importSource of file.imports) {
        const dependency = resolveLocalDependency(
          file.file,
          importSource,
          filePaths,
        );

        if (dependency && !file.dependencies.includes(dependency)) {
          file.dependencies.push(dependency);
        }
      }
    }
  }
  const languageCounts = {};
  for (const file of files) {
    languageCounts[file.language] = (languageCounts[file.language] || 0) + 1;
  }
  return {
    rootPath: `https://github.com/${owner}/${repository}`,
    totalFiles: files.length,
    languageCounts,
    files,
  };
}

export { analyzeGitHubRepository };
