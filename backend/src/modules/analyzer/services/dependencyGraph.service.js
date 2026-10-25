import { resolveLocalDependency } from "./dependency.service.js";
function buildDependencyGraph(files) {
  const nodes = [];
  const edges = [];
  const filePath = new Set(files.map((file) => file.file));
  for (const file of files) {
    nodes.push({
      id: file.file,
      label: file.file.split("/").pop(),
      languge: file.languge,
    });
    if (!Array.isArray(file.dependencies)) {
      continue;
    }
    for (const dependency of file.dependencies) {
      if (!filePath.has(dependency)) {
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
