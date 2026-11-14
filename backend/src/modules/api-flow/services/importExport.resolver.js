import { parse } from "@babel/parser";
import path from "node:path";

const supportedExtensions = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];

function normalizePath(filePath) {
  return path.posix.normalize(
    filePath.replace(/\\/g, "/").replace(/^\.\//, ""),
  );
}

function resolveImportPath(importerPath, importSource, fileMap) {
  const directory = path.posix.dirname(importerPath);

  const targetPath = normalizePath(path.posix.join(directory, importSource));

  const candidates = [targetPath];

  const hasExtension = path.posix.extname(targetPath) !== "";

  if (!hasExtension) {
    for (const extension of supportedExtensions) {
      candidates.push(targetPath + extension);
    }

    for (const extension of supportedExtensions) {
      candidates.push(`${targetPath}/index${extension}`);
    }
  }

  const resolvedPath = candidates.find((candidate) => fileMap.has(candidate));

  return resolvedPath || null;
}

function getDeclarationNames(declaration) {
  if (!declaration) return [];

  if (declaration.type === "VariableDeclaration") {
    return declaration.declarations.flatMap((item) => {
      if (item.id.type === "Identifier") {
        return [item.id.name];
      }

      return [];
    });
  }

  if (
    declaration.type === "FunctionDeclaration" ||
    declaration.type === "ClassDeclaration"
  ) {
    return declaration.id ? [declaration.id.name] : [];
  }

  return [];
}
function parseFile(file) {
  const extension = path.posix.extname(file.path);

  const plugins = [];

  if (extension === ".jsx" || extension === ".tsx") {
    plugins.push("jsx");
  }

  if (extension === ".ts" || extension === ".tsx") {
    plugins.push("typescript");
  }

  try {
    return parse(file.content, {
      sourceType: "unambiguous",
      plugins,
    });
  } catch (error) {
    console.log("Parsing error:", error.message);
    return null;
  }
}
function resolveExport(filePath, exportName, fileRecords, visited = new Set()) {
  const key = `${filePath}:${exportName}`;

  if (visited.has(key)) {
    return null;
  }

  visited.add(key);

  const fileRecord = fileRecords.get(filePath);

  if (!fileRecord) {
    return null;
  }

  const matchingExport = fileRecord.exports.find(
    (item) => item.exported === exportName,
  );

  if (matchingExport) {
    if (matchingExport.type === "namespace" && matchingExport.resolvedPath) {
      return {
        filePath: matchingExport.resolvedPath,
        type: "namespace",
        exported: matchingExport.exported,
        local: "*",
      };
    }

    if (matchingExport.source && matchingExport.resolvedPath) {
      return resolveExport(
        matchingExport.resolvedPath,
        matchingExport.local,
        fileRecords,
        visited,
      );
    }

    return {
      filePath,
      type: matchingExport.type,
      exported: matchingExport.exported,
      local: matchingExport.local,
    };
  }

  if (exportName === "default") {
    return null;
  }

  const starExports = fileRecord.exports.filter(
    (item) => item.type === "all" && item.resolvedPath,
  );
  const resolvedExports = starExports
    .map((starExport) =>
      resolveExport(
        starExport.resolvedPath,
        exportName,
        fileRecords,
        new Set(visited),
      ),
    )
    .filter(Boolean);

  const uniqueExports = resolvedExports.filter(
    (item, index, array) =>
      array.findIndex(
        (candidate) =>
          candidate.filePath === item.filePath &&
          candidate.type === item.type &&
          candidate.local === item.local,
      ) === index,
  );

  if (uniqueExports.length !== 1) {
    return null;
  }

  return uniqueExports[0];
}
function buildImportExportMap(selectedFiles) {
  const fileMap = new Map();

  for (const file of selectedFiles) {
    const filePath = normalizePath(file.path);

    fileMap.set(filePath, file);
  }

  const results = [];
  for (const file of selectedFiles) {
    const filePath = normalizePath(file.path);

    const ast = parseFile(file);

    if (!ast) {
      results.push({
        filePath,
        imports: [],
        exports: [],
        analysisError: "Unable to parse file",
      });

      continue;
    }

    const imports = [];
    const exports = [];

    for (const node of ast.program.body) {
      if (node.type === "ImportDeclaration") {
        const resolvedPath = resolveImportPath(
          filePath,
          node.source.value,
          fileMap,
        );

        imports.push({
          source: node.source.value,
          resolvedPath,

          specifiers: node.specifiers.map((specifier) => {
            if (specifier.type === "ImportDefaultSpecifier") {
              return {
                type: "default",
                imported: "default",
                local: specifier.local.name,
              };
            }

            if (specifier.type === "ImportNamespaceSpecifier") {
              return {
                type: "namespace",
                imported: "*",
                local: specifier.local.name,
              };
            }

            return {
              type: "named",
              imported: specifier.imported.name,
              local: specifier.local.name,
            };
          }),
        });
      }

      if (node.type === "ExportDefaultDeclaration") {
        exports.push({
          type: "default",
          exported: "default",
          local:
            node.declaration.type === "Identifier"
              ? node.declaration.name
              : node.declaration.id?.name || null,
          source: null,
          resolvedPath: null,
        });
      }

      if (node.type === "ExportNamedDeclaration") {
        const resolvedPath = node.source
          ? resolveImportPath(filePath, node.source.value, fileMap)
          : null;

        if (node.declaration) {
          const names = getDeclarationNames(node.declaration);

          names.forEach((name) => {
            exports.push({
              type: "named",
              exported: name,
              local: name,
              source: null,
              resolvedPath: null,
            });
          });
        }

        for (const specifier of node.specifiers) {
          if (specifier.type === "ExportNamespaceSpecifier") {
            exports.push({
              type: "namespace",
              exported: specifier.exported.name,
              local: "*",
              source: node.source?.value || null,
              resolvedPath,
            });

            continue;
          }

          if (specifier.type === "ExportDefaultSpecifier") {
            exports.push({
              type: "named",
              exported: specifier.exported.name,
              local: "default",
              source: node.source?.value || null,
              resolvedPath,
            });

            continue;
          }

          if (specifier.type === "ExportSpecifier") {
            exports.push({
              type: "named",
              exported: specifier.exported.name,
              local: specifier.local.name,
              source: node.source?.value || null,
              resolvedPath,
            });
          }
        }
      }
      if (node.type === "ExportAllDeclaration") {
        exports.push({
          type: "all",
          exported: node.exported?.name || "*",
          local: null,
          source: node.source.value,
          resolvedPath: resolveImportPath(filePath, node.source.value, fileMap),
        });
      }
    }

    results.push({
      filePath,
      imports,
      exports,
    });
  }
  const fileRecords = new Map(
    results.map((record) => [record.filePath, record]),
  );

  for (const fileRecord of results) {
    for (const imported of fileRecord.imports) {
      if (!imported.resolvedPath) {
        continue;
      }

      imported.specifiers = imported.specifiers.map((specifier) => ({
        ...specifier,

        resolvedExport:
          specifier.type === "namespace"
            ? {
                filePath: imported.resolvedPath,
                type: "namespace",
                exported: "*",
                local: "*",
              }
            : resolveExport(
                imported.resolvedPath,
                specifier.imported,
                fileRecords,
              ),
      }));
    }
  }

  return results;
}

export { buildImportExportMap };
