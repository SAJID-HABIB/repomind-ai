import fs from "node:fs/promises";
import path from "node:path";
import {
  ignoredDirectories,
  supportedExtensions,
} from "../constants/analyzer.constants.js";
import { analyzeJavaScriptSource } from "../parsers/javascript.parser.js";
import { resolveLocalDependency } from "./dependency.service.js";
async function scanDriectroies(driectroyPath, rootPath, results) {
  const entries = await fs.readdir(driectroyPath, {
    withFileTypes: true,
  });

  for (const enrty of entries) {
    if (enrty.name.startsWith(".") && enrty.name !== ".github") {
      continue;
    }

    const fullPath = path.join(driectroyPath, enrty.name);

    if (enrty.isDirectory()) {
      if (ignoredDirectories.has(enrty.name)) {
        continue;
      }

      await scanDriectroies(fullPath, rootPath, results);
      continue;
    }

    if (!enrty.isFile()) {
      continue;
    }

    const extension = path.extname(enrty.name).toLowerCase();
    const language = supportedExtensions[extension];

    if (!language) {
      continue;
    }

    const fileResult = {
      file: path.relative(rootPath, fullPath),
      extension,
      language,
    };

    const javascriptExtensions = [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"];

    if (javascriptExtensions.includes(extension)) {
      try {
        const sourceCode = await fs.readFile(fullPath, "utf-8");
        const structure = analyzeJavaScriptSource(sourceCode, extension);
        Object.assign(fileResult, structure);
      } catch (error) {
        fileResult.analysisError = error.message;
      }
    }

    results.push(fileResult);
  }
}

async function analyzeRepository(repositoryPath) {
  const rootPath = path.resolve(repositoryPath);
  const stats = await fs.stat(rootPath);
  if (!stats.isDirectory()) {
    throw new Error("The repository path must be a directory.");
  }

  const files = [];
  await scanDriectroies(rootPath, rootPath, files);
  const filePath = new Set(files.map((file) => file.file.replace(/\\/g, "/")));
  for (const file of files) {
    file.dependencies = [];
    if (!Array.isArray(file.imports)) {
      continue;
    }
    for (const importeSource of file.imports) {
      const dependency = resolveLocalDependency(
        file.file,
        importeSource,
        filePath,
      );
      if (dependency && !file.dependencies.includes(dependency)) {
        file.dependencies.push(dependency);
      }
    }
  }
  const languageCounts = {};
  for (const file of files) {
    languageCounts[file.language] = (languageCounts[file.language] || 0) + 1;
  }
  return {
    rootPath,
    totalFiles: files.length,
    languageCounts,
    files,
  };
}

export { analyzeRepository };
