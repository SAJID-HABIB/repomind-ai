const fs = require ("fs");
const path = require("path");

const ignoredDirectories = new set ([
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

async function scanDriectroies(driecroyPath ,rootPath ,results)  {
    const entries = await fs.readdir(driecroyPath ,{
        withFileTypes:true,
    })
};