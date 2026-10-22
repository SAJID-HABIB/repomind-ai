import path from "node:path";

function resolveLocalDependency(importerPath, importeSource, filePaths) {
  if (!importeSource.startsWith(".")) {
    return null;
  }
  const importerDirectory = path.posix.dirname(
    importerPath.replace(/\\/g, "/"),
  );
  const targetPath = path.posix.normalize(
    path.posix.join(importerDirectory, importeSource),
  );
  const extensions = ["", ".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"];
  for (const extension of extensions) {
    const candidate = `${targetPath}${extension}`;
    if (filePaths.has(candidate)) {
      return candidate;
    }
  }
  for (const extension of extensions.slice(1)) {
    const candidate = path.posix.join(targetPath, `index${extension}`);
    if (filePaths.has(candidate)) {
      return candidate;
    }
  }
  return null;
}

export {resolveLocalDependency};