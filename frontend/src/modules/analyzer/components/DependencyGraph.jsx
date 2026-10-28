import { useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import FileGraphNode from "./FileGraphNode";

const nodeTypes = {
  fileNode: FileGraphNode,
};

const nodeWidth = 230;
const nodeHeight = 110;

function getLayoutedElements(nodes, edges) {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "LR",
    nodesep: 65,
    ranksep: 110,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    graph.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
    });
  });

  edges.forEach((edge) => {
    if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
      graph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(graph);
  const layoutedNodes = nodes.map((node) => {
    const position = graph.node(node.id);
    const extension = node.id.split(".").pop()?.toUpperCase() || "FILE";
    return {
      ...node,
      type: "fileNode",
      position: {
        x: position.x - nodeWidth / 2,
        y: position.y - nodeHeight / 2,
      },
      data: {
        ...node.data,
        label: node.label || node.data?.label || node.id,
        path: node.id,
        language: node.language || node.data?.language || "Source file",
        extension,
      },
    };
  });
  const validEdges = edges.filter(
    (edge) => graph.hasNode(edge.source) && graph.hasNode(edge.target),
  );

  return {
    nodes: layoutedNodes,
    edges: validEdges,
  };
}

function DependencyGraph({ nodes = [], edges = [] }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const { graphNodes, graphEdges } = useMemo(() => {
    const layout = getLayoutedElements(nodes, edges);
    return {
      graphNodes: layout.nodes,
      graphEdges: layout.edges.map((edge, index) => ({
        ...edge,
        id: `${edge.source}-${edge.target}-${index}`,
        type: "default",
        label: "imports",
        animated: true,
        style: {
          stroke: "#818cf8",
          strokeWidth: 2,
        },
        labelStyle: {
          fill: "#c7d2fe",
          fontSize: 11,
          fontWeight: 600,
        },
        labelBgStyle: {
          fill: "#0f172a",
          fillOpacity: 0.9,
        },
      })),
    };
  }, [nodes, edges]);

  const selectedFile = graphNodes.find(
    (edge) => edge.target === selectedNode,
  );

  const selectedFileImports = edges.filter(
    (edge) => edge.source === selectedNode,
  );
  const selectedFileImportedBy = edges.filter(
    (edge) => edge.target === selectedNode,
  );

  if (nodes.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-8 text-center">
        <h2 className="font-semibold text-slate-100">No files to display</h2>
        <p className="mt-2 text-sm text-slate-400">
          Scan a repository to generate its dependency graph.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Dependency Graph</h2>
          <p className="mt-1 text-sm text-slate-400">
            Explore file relationships across your repository.
          </p>
        </div>

        <div className="flex gap-3 text-xs">
          <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-300">
            {nodes.length} files
          </span>
          <span className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-blue-300">
            {edges.length} imports
          </span>
        </div>
      </div>

      {/* Graph */}
      {edges.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-medium text-slate-200">
            No dependency relationships found.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            The scanned files are available, but no connections between them
            were detected.
          </p>
        </div>
      ) : (
        <div className="h-[560px] bg-slate-950">
          <ReactFlow
            nodes={graphNodes}
            edges={graphEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.15}
            maxZoom={2}
            colorMode="dark"
            onNodeClick={(_, node) => setSelectedNode(node.id)}
            onPaneClick={() => setSelectedNode(null)}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#334155" gap={24} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) =>
                node.id === setSelectedNode ? "#60a5fa" : "#6366f1"
              }
              maskColor="rgba(2, 6, 23, 0.75)"
            />
          </ReactFlow>
        </div>
      )}

      {/* Selected file details */}
      {selectedFile && (
        <div className="border-t border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
                Selected file
              </p>
              <h3 className="mt-1 break-all text-base font-semibold text-white">
                {selectedFile.data.label}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800"
            >
              Clear selection
            </button>
          </div>

          <div className="mb-4 rounded-lg border border-slate-800 bg-slate-950 p-3">
            <p className="mb-1 text-xs text-slate-500">File path</p>
            <p className="break-all text-sm text-slate-300">
              {selectedFile.data.path}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Language: {selectedFile.data.language}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <p className="mb-2 text-sm font-medium text-slate-200">
                Imports
                <span className="ml-2 text-blue-400">
                  {selectedFileImports.length}
                </span>
              </p>

              {selectedFileImports.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No internal files imported.
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedFileImports.map((edge, index) => (
                    <li
                      key={`${edge.source}-${edge.target}-${index}`}
                      className="break-all text-xs text-slate-400"
                    >
                      → {edge.target}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <p className="mb-2 text-sm font-medium text-slate-200">
                Imported by
                <span className="ml-2 text-blue-400">
                  {selectedFileImportedBy.length}
                </span>
              </p>

              {selectedFileImportedBy.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No other files import this file.
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedFileImportedBy.map((edge, index) => (
                    <li
                      key={`${edge.source}-${edge.target}-${index}`}
                      className="break-all text-xs text-slate-400"
                    >
                      ← {edge.source}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
export default DependencyGraph;
