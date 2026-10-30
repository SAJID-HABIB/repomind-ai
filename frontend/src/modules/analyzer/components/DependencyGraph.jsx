import { useMemo, useState } from "react";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
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

function DependencyGraph({ nodes = [], edges = [], files = [] }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [fileSearch, setFileSearch] = useState("");

  const { graphNodes, graphEdges } = useMemo(() => {
    const layout = getLayoutedElements(nodes, edges);

    return {
      graphNodes: layout.nodes,
      graphEdges: layout.edges.map((edge, index) => {
        const connectionColors = [
          "#a855f7",
          "#3b82f6",
          "#ec4899",
          "#06b6d4",
          "#8b5cf6",
          "#f97316",
        ];

        const connectionColor =
          connectionColors[index % connectionColors.length];

        return {
          ...edge,
          id: `${edge.source}-${edge.target}-${index}`,
          type: "default",
          label: "imports",
          animated: true,

          style: {
            stroke: connectionColor,
            strokeWidth: 3,
            filter: `drop-shadow(0 0 5px ${connectionColor})`,
          },

          labelStyle: {
            fill: connectionColor,
            fontSize: 11,
            fontWeight: 700,
          },

          labelBgStyle: {
            fill: "#07131a",
            fillOpacity: 0.95,
          },
          labelBgPadding: [8, 5],
          labelBgBorderRadius: 5,
        };
      }),
    };
  }, [nodes, edges]);

  const dependencyInsights = useMemo(() => {
    const dependencyCounts = graphNodes.map((node) => {
      const outgoingCount = graphEdges.filter(
        (edge) => edge.source === node.id,
      ).length;

      const incomingCount = graphEdges.filter(
        (edge) => edge.target === node.id,
      ).length;

      return {
        id: node.id,
        label: node.data?.label || node.id,
        outgoingCount,
        incomingCount,
        isIsolated: outgoingCount === 0 && incomingCount === 0,
      };
    });

    return {
      mostDependencies:
        [...dependencyCounts].sort(
          (a, b) => b.outgoingCount - a.outgoingCount,
        )[0] || null,

      mostImported:
        [...dependencyCounts].sort(
          (a, b) => b.incomingCount - a.incomingCount,
        )[0] || null,

      isolatedFiles: dependencyCounts.filter((file) => file.isIsolated),
    };
  }, [graphEdges, graphNodes]);

  const selectedNodeData = graphNodes.find((node) => node.id === selectedNode);

  const analyzedFile = files.find((file) => file.file === selectedNode);

  const selectedFile = selectedNodeData
    ? {
        ...selectedNodeData,
        exports: analyzedFile?.exports || [],
      }
    : null;

  const filteredNodes = graphNodes.filter((node) => {
    const fileName = String(node.data?.label || node.id || "");
    const searchText = String(fileSearch || "");

    return fileName.toLowerCase().includes(searchText.toLowerCase());
  });

  const selectedFileImports = edges.filter(
    (edge) => edge.source === selectedNode,
  );

  const selectedFileImportedBy = edges.filter(
    (edge) => edge.target === selectedNode,
  );

  const fileExtensionCounts = graphNodes.reduce((counts, node) => {
    const extension = node.data?.extension || "FILE";
    counts[extension] = (counts[extension] || 0) + 1;
    return counts;
  }, {});

  const hotFiles = [...graphNodes]
    .map((node) => ({
      ...node,
      connectionCount: edges.filter(
        (edge) => edge.source === node.id || edge.target === node.id,
      ).length,
    }))
    .sort((a, b) => b.connectionCount - a.connectionCount)
    .slice(0, 6);

  if (nodes.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-[#1c343d] bg-[#081218] p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-400/10 text-xl text-teal-300">
          ◉
        </div>

        <h2 className="font-semibold text-slate-100">No files to display</h2>

        <p className="mt-2 text-sm text-slate-400">
          Scan a repository to generate its dependency graph.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-5 overflow-hidden rounded-xl border border-[#1c343d] bg-[#060d12] text-slate-200 shadow-2xl shadow-black/30">
      {/* Page Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1c343d] bg-[#09151b] px-5 py-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-400">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            Repository intelligence
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-white">
            Causal graph
          </h2>

          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-400">
            Explore file relationships, imports and dependencies throughout your
            repository.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-[#25434b] bg-[#0c2026] px-3 py-2 text-xs text-teal-200">
            {nodes.length} files
          </span>

          <span className="rounded-md border border-[#25434b] bg-[#0c2026] px-3 py-2 text-xs text-teal-200">
            {edges.length} connections
          </span>
        </div>
      </header>

      {/* Main Three-Panel Layout */}
      <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_255px]">
        {/* LEFT PANEL */}
        <aside className="min-w-0 border-b border-[#1c343d] bg-[#09141a] lg:border-r lg:border-b-0">
          {/* Statistics */}
          <div className="border-b border-[#1c343d] p-4">
            <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Stats
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">Files</span>
                <span className="text-sm font-semibold text-white">
                  {nodes.length}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">Edges</span>
                <span className="text-sm font-semibold text-teal-300">
                  {edges.length}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">Shown</span>
                <span className="text-sm font-semibold text-white">
                  {graphNodes.length}
                </span>
              </div>
            </div>
          </div>

          {/* File Search and List */}
          <div className="border-b border-[#1c343d] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Project files
              </h3>

              <span className="text-[10px] text-slate-500">
                {filteredNodes.length}/{nodes.length}
              </span>
            </div>

            <div className="mb-3 flex items-center gap-2 rounded-md border border-[#25404a] bg-[#050d12] px-3 focus-within:border-teal-500/60">
              <span className="text-sm text-teal-400">⌕</span>

              <input
                type="text"
                value={fileSearch}
                onChange={(event) => setFileSearch(event.target.value)}
                placeholder="Search files..."
                aria-label="Search project files"
                className="min-w-0 w-full bg-transparent py-2 text-xs text-white outline-none placeholder:text-slate-600"
              />

              {fileSearch && (
                <button
                  type="button"
                  onClick={() => setFileSearch("")}
                  aria-label="Clear file search"
                  className="text-xs text-slate-500 hover:text-teal-300"
                >
                  ×
                </button>
              )}
            </div>

            <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
              {filteredNodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNode(node.id)}
                  title={node.id}
                  className={`flex w-full min-w-0 items-center gap-2 rounded-md border px-2.5 py-2 text-left transition ${
                    selectedNode === node.id
                      ? "border-teal-400/30 bg-teal-400/10 text-teal-200"
                      : "border-transparent text-slate-400 hover:border-[#25404a] hover:bg-[#102129] hover:text-slate-100"
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#25404a] bg-[#0d2027] text-[9px] font-semibold text-teal-300">
                    {node.data.extension.slice(0, 3)}
                  </span>

                  <span className="min-w-0 flex-1 truncate text-xs">
                    {node.data.label}
                  </span>
                </button>
              ))}

              {filteredNodes.length === 0 && (
                <p className="px-2 py-4 text-center text-xs text-slate-500">
                  No matching files found.
                </p>
              )}
            </div>
          </div>

          {/* File Type Statistics */}
          <div className="border-b border-[#1c343d] p-4">
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              File types
            </h3>

            <div className="space-y-2">
              {Object.entries(fileExtensionCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([extension, count]) => (
                  <div
                    key={extension}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-xs text-slate-400">
                      .{extension.toLowerCase()}
                    </span>

                    <span className="text-xs font-medium text-slate-300">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Most Connected Files */}
          <div className="p-4">
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Hot files
            </h3>

            <div className="space-y-1">
              {hotFiles.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNode(node.id)}
                  title={node.id}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition ${
                    selectedNode === node.id
                      ? "bg-teal-400/10"
                      : "hover:bg-[#102129]"
                  }`}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />

                  <span className="min-w-0 flex-1 truncate text-xs text-slate-400">
                    {node.data.label}
                  </span>

                  <span className="text-[10px] text-slate-500">
                    {node.connectionCount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dependency Insights */}
          <div className="border-t border-[#1c343d] p-4">
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Dependency Insights
            </h3>

            <div className="space-y-3">
              {/* Most Dependencies */}
              <button
                type="button"
                disabled={!dependencyInsights.mostDependencies}
                onClick={() =>
                  dependencyInsights.mostDependencies &&
                  setSelectedNode(dependencyInsights.mostDependencies.id)
                }
                className="w-full rounded-md border border-[#25404a] bg-[#071117] p-3 text-left transition hover:border-teal-400/40"
              >
                <span className="block text-[10px] text-slate-500">
                  Most Dependencies
                </span>

                <span className="mt-1 block truncate text-xs font-medium text-teal-300">
                  {dependencyInsights.mostDependencies?.label || "No files"}
                </span>

                <span className="mt-1 block text-[10px] text-slate-500">
                  {dependencyInsights.mostDependencies?.outgoingCount || 0}{" "}
                  outgoing connections
                </span>
              </button>

              {/* Most Imported */}
              <button
                type="button"
                disabled={!dependencyInsights.mostImported}
                onClick={() =>
                  dependencyInsights.mostImported &&
                  setSelectedNode(dependencyInsights.mostImported.id)
                }
                className="w-full rounded-md border border-[#25404a] bg-[#071117] p-3 text-left transition hover:border-teal-400/40"
              >
                <span className="block text-[10px] text-slate-500">
                  Most Imported
                </span>

                <span className="mt-1 block truncate text-xs font-medium text-teal-300">
                  {dependencyInsights.mostImported?.label || "No files"}
                </span>

                <span className="mt-1 block text-[10px] text-slate-500">
                  {dependencyInsights.mostImported?.incomingCount || 0} incoming
                  connections
                </span>
              </button>

              {/* Isolated Files */}
              <div className="rounded-md border border-[#25404a] bg-[#071117] p-3">
                <span className="block text-[10px] text-slate-500">
                  Isolated Files
                </span>

                <span className="mt-1 block text-lg font-semibold text-white">
                  {dependencyInsights.isolatedFiles.length}
                </span>

                <span className="mt-1 block text-[10px] text-slate-500">
                  Files without graph connections
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER PANEL: GRAPH */}
        <main className="min-w-0 border-b border-[#1c343d] bg-[#060d12] lg:border-b-0 xl:border-r">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c343d] px-4 py-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">
                Dependency visualization
              </h3>

              <p className="mt-1 text-[10px] text-slate-500">
                Select a node to inspect its relationships.
              </p>
            </div>

            <span className="rounded border border-teal-400/20 bg-teal-400/5 px-2 py-1 text-[10px] text-teal-300">
              LIVE GRAPH
            </span>
          </div>

          {edges.length === 0 ? (
            <div className="flex min-h-[480px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-teal-400/20 bg-teal-400/5 text-xl text-teal-300">
                ◉
              </div>

              <h3 className="text-sm font-medium text-slate-200">
                No dependency relationships
              </h3>

              <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                Files were found, but no internal connections were detected
                between them.
              </p>
            </div>
          ) : (
            <div className="h-[560px] min-w-0 bg-[#060d12]">
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
                <Background color="#19323b" gap={24} size={1} />

                <Controls className="!overflow-hidden !rounded-lg !border !border-[#25404a] !bg-[#0b1a20] [&>button]:!border-[#25404a] [&>button]:!bg-[#0b1a20] [&>button]:!fill-teal-300" />

                <MiniMap
                  nodeColor={(node) =>
                    node.id === selectedNode ? "#5eead4" : "#178f88"
                  }
                  maskColor="rgba(3, 10, 14, 0.45)"
                  style={{
                    width: 140,
                    height: 90,
                    background: "#0a171d",
                    border: "1px solid #25404a",
                    borderRadius: "8px",
                  }}
                />
              </ReactFlow>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#1c343d] px-4 py-3">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              Legend
            </span>

            <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="h-2 w-2 rounded-full bg-teal-300" />
              Selected file
            </span>

            <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="h-2 w-2 rounded-full bg-teal-700" />
              File node
            </span>

            <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="h-0.5 w-4 bg-teal-400" />
              Import relationship
            </span>
          </div>
        </main>

        {/* RIGHT PANEL: FILE INSPECTOR */}
        <aside className="min-w-0 bg-[#09141a]">
          <div className="border-b border-[#1c343d] px-4 py-4">
            <h3 className="text-xs font-semibold text-slate-100">
              {selectedFile ? "Selected file" : "Nothing selected"}
            </h3>

            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              {selectedFile
                ? "Inspect this file and its direct dependencies."
                : "Click a file in the graph or file list to see its details."}
            </p>
          </div>

          {selectedFile ? (
            <div className="space-y-4 p-4">
              <div className="rounded-lg border border-teal-400/20 bg-teal-400/5 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-teal-400/20 bg-[#0b2227] text-[10px] font-semibold text-teal-300">
                    {selectedFile.data.extension.slice(0, 3)}
                  </span>

                  <div className="min-w-0">
                    <p className="break-all text-xs font-semibold text-white">
                      {selectedFile.data.label}
                    </p>

                    <p className="mt-1 text-[10px] text-teal-300">
                      {selectedFile.data.language}
                    </p>
                  </div>
                </div>

                <p className="break-all text-[10px] leading-5 text-slate-400">
                  {selectedFile.data.path}
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="mt-3 w-full rounded-md border border-[#25404a] px-3 py-2 text-[10px] text-slate-400 transition hover:bg-[#102129] hover:text-white"
                >
                  Clear selection
                </button>
              </div>

              {/* Imports */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Imports
                  </h4>

                  <span className="rounded border border-teal-400/20 bg-teal-400/5 px-2 py-0.5 text-[10px] text-teal-300">
                    {selectedFileImports.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {selectedFileImports.length === 0 ? (
                    <p className="rounded-md border border-[#1c343d] bg-[#071117] p-3 text-[10px] leading-5 text-slate-500">
                      No internal files imported.
                    </p>
                  ) : (
                    selectedFileImports.map((edge, index) => (
                      <button
                        key={`${edge.source}-${edge.target}-${index}`}
                        type="button"
                        onClick={() => setSelectedNode(edge.target)}
                        title={edge.target}
                        className="w-full rounded-md border border-[#1c343d] bg-[#071117] p-2.5 text-left transition hover:border-teal-400/30 hover:bg-[#0c2026]"
                      >
                        <span className="mb-1 block text-[10px] text-teal-300">
                          → imports
                        </span>

                        <span className="block break-all text-[10px] leading-4 text-slate-300">
                          {edge.target}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Imported By */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Imported by
                  </h4>

                  <span className="rounded border border-teal-400/20 bg-teal-400/5 px-2 py-0.5 text-[10px] text-teal-300">
                    {selectedFileImportedBy.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {selectedFileImportedBy.length === 0 ? (
                    <p className="rounded-md border border-[#1c343d] bg-[#071117] p-3 text-[10px] leading-5 text-slate-500">
                      No other files import this file.
                    </p>
                  ) : (
                    selectedFileImportedBy.map((edge, index) => (
                      <button
                        key={`${edge.source}-${edge.target}-${index}`}
                        type="button"
                        onClick={() => setSelectedNode(edge.source)}
                        title={edge.source}
                        className="w-full rounded-md border border-[#1c343d] bg-[#071117] p-2.5 text-left transition hover:border-teal-400/30 hover:bg-[#0c2026]"
                      >
                        <span className="mb-1 block text-[10px] text-teal-300">
                          ← imported by
                        </span>

                        <span className="block break-all text-[10px] leading-4 text-slate-300">
                          {edge.source}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Exports
                  </h4>

                  <span className="rounded border border-teal-400/20 bg-teal-400/5 px-2 py-0.5 text-[10px] text-teal-300">
                    {selectedFile.exports?.length || 0}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {!selectedFile.exports?.length ? (
                    <p className="rounded-md border border-[#1c343d] bg-[#071117] p-3 text-[10px] leading-5 text-slate-500">
                      No exports found in this file.
                    </p>
                  ) : (
                    selectedFile.exports.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-md border border-[#1c343d] bg-[#071117] p-2.5"
                      >
                        <span className="mb-1 block text-[10px] text-teal-300">
                          ↑ exported
                        </span>

                        <span className="block break-all text-[10px] leading-4 text-slate-300">
                          {typeof item === "string"
                            ? item
                            : item.name ||
                              item.exportedName ||
                              JSON.stringify(item)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="rounded-lg border border-dashed border-[#25404a] bg-[#071117] px-4 py-8 text-center">
                <div className="mb-3 text-2xl text-teal-400/70">◎</div>

                <p className="text-xs font-medium text-slate-300">
                  Select a file
                </p>

                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  File path, language and dependency relationships will appear
                  here.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default DependencyGraph;
