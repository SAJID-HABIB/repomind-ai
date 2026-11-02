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

function detectCircularDependencies(nodes, edges) {
  const adjacencyList = new Map();
  for (const node of nodes) {
    adjacencyList.set(node.id, []);
  }
  for (const edge of edges) {
    adjacencyList.get(edge.source)?.push(edge.target);
  }
  const visited = new Set();
  const activePath = new Set();
  const cycles = [];

  function dfs(currentNode, path) {
    visited.add(currentNode);
    activePath.add(currentNode);
    path.push(currentNode);
    for (const neighbor of adjacencyList.get(currentNode) || []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path]);
      } else if (activePath.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        cycles.push([
          ...path.slice(cycleStart),
          neighbor,
        ])
      }
    }
    activePath.delete(currentNode);
  }
  for (const node of nodes) {
    if (!visited.has(node.id, [])) {
      dfs(node.id, [])
    }
  }
  return cycles;
}

export { buildDependencyGraph, detectCircularDependencies };
