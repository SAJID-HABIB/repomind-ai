import { resolveLocalDependency } from "./dependency.service.js";
function buildDependencyGraph(files) {
  const nodes = [];
  const edges = [];
  const filePath = new Set(files.map((file) => file.file));
  for (const file of files) {
    nodes.push({
      id: file.file,
      label: file.file.split("/").pop(),
      language: file.language,
    });
    if (!Array.isArray(file.imports)) {
      continue;
    }

    for (const importSource of file.imports) {
      const dependency = resolveLocalDependency(
        file.file,
        importSource,
        filePath,
      );

      if (!dependency) {
        continue;
      }

      edges.push({
        source: file.file,
        target: dependency,
      });
    }
  }
  return {
    nodes,
    edges,
  };
}

export { buildDependencyGraph };
