import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ignoredDirectories = new Set ([
    "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  ".venv",
  "venv",
  "__pycache__",
]);

const sportExtention = {
     ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".mjs": "JavaScript",
  ".cjs": "JavaScript",
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".py": "Python",
  ".java": "Java",
  ".c": "C",
  ".h": "C/C++",
  ".cpp": "C++",
  ".hpp": "C++",
  ".cs": "C#",
  ".go": "Go",
  ".rs": "Rust",
  ".php": "PHP",
  ".rb": "Ruby",
  ".swift": "Swift",
  ".kt": "Kotlin",
  ".dart": "Dart",
};

async function scanDriectroies(driectroyPath ,rootPath ,results)  {
    const entries = await fs.readdir(driectroyPath ,{
        withFileTypes:true,
    })

for (const enrty of entries) {
    if (enrty.name.startsWith(".") && enrty.name !== ".github") {
        continue;
    }
 const fullPath = path.join(driectroyPath , enrty.name);
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
const extension  = path.extname(enrty.name).toLowerCase();
const language = sportExtention[extension];
if (!language) {
    continue;
}
results.push({
  file: path.relative(rootPath, fullPath),
  extension,
  language,
});
}
}
async function analyzeRepository(repositoryPath) {
    const rootPath = path.resolve(repositoryPath);
    const stats = await fs.stat(rootPath);
    if (!stats.isDirectory()) {
        throw new Error ("The repository path must be a directory.");
    }

    const files = [];
    await scanDriectroies(rootPath, rootPath, files);
    const languageCounts = {};
    for (const file of files) {
        languageCounts[file.language] = (languageCounts[file.language] || 0) + 1;
    }
    return {
        rootPath,
        totalFiles : files.length,
        languageCounts,
        files
    };
}
export {
    analyzeRepository,
}