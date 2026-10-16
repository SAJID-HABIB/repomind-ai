import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ignoredDirectories = new Set([
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

 function analyzeJavaScriptSource(sourceCode, extension) {
  // const sourceCode = await fs.readFile(filePath, "utf-8");
  const plugins = [];

if ([".ts", ".tsx"].includes(extension)) {
  plugins.push("typescript");
}

if ([".jsx", ".tsx"].includes(extension)) {
  plugins.push("jsx");
}

  const ast = parse(sourceCode, {
    sourceType: "unambiguous",
    plugins,
  });

  const functions = [];
  const classes = [];
  const imports = [];
  const exports = [];

  function visit(node) {
    if (!node || typeof node !== "object") {
      return;
    }

    if (node.type === "FunctionDeclaration" && node.id?.name) {
      functions.push(node.id.name);
    }

    if (
      node.type === "VariableDeclarator" &&
      node.id?.type === "Identifier" &&
      ["ArrowFunctionExpression", "FunctionExpression"].includes(
        node.init?.type,
      )
    ) {
      functions.push(node.id.name);
    }

    if (node.type === "ClassDeclaration" && node.id?.name) {
      classes.push(node.id.name);
    }

    if (node.type === "ImportDeclaration") {
      imports.push(node.source.value);
    }
    if (node.type === "ExportNamedDeclaration") {
      if (node.declaration) {
        const declaration = node.declaration;
        if (declaration.id?.name) {
          exports.push(declaration.id.name)
        } else if (declaration.declarations) {
          for (const item of declaration.declarations) {
            if (item.id?.name) {
              exports.push(item.id.name);
            }
          }
        }
      }
    }
    for (const specifier of node.specifiers ?? []) {
      if (specifier.exports.name?.name) {
        exports.push(specifier.exported.name)
      }
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          visit(item);
        }
      } else if (value && typeof value === "object") {
        visit(value);
      }
    }
    if (node.type === "ExportDefaultDeclaration") {
      exports.push("default")
    }
  }
  visit(ast.program);
  return {
    functions,
    classes,
    imports,
    exports,
  };
}
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
    const language = sportExtention[extension];

    if (!language) {
      continue;
    }

    const fileResult = {
      file: path.relative(rootPath, fullPath),
      extension,
      language,
    };

    const supportedExtensions = [
      ".js",
      ".jsx",
      ".mjs",
      ".cjs",
      ".ts",
      ".tsx",
    ];

    if (supportedExtensions.includes(extension)) {
      try {
        const structure = await analyzeJavaScriptFile(fullPath, extension);
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
    const normalizedPath = relativePath.replaceAll("\\","/");
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
          part === "__pycache__"
      )
    ) {
      continue;
    }
    const extension = path.extname(normalizedPath).toLowerCase();
    const language = sportExtention[extension];
    if (!language) {
      continue
    }
    const fileResult = {
      file : normalizedPath,
      extension,
      language,
    }
     const supportedExtensions = [
      ".js",
      ".jsx",
      ".mjs",
      ".cjs",
      ".ts",
      ".tsx",
    ];
   if (supportedExtensions.includes(extension)) {
  try {
    const structure = analyzeJavaScriptSource(
      sourceCode,
      extension
    );

    Object.assign(fileResult, structure);
  } catch (error) {
    fileResult.analysisError = error.message;
  }
}
    files.push(fileResult);
    languageCounts [language] = (languageCounts[language] || 0 ) + 1; 
  }
  return {
    totalFiles: files.length,
    languageCounts,
    files
  }
}
export { analyzeRepository, analyzeSelectedFiles };
