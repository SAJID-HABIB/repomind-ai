import {
  Handle,
  Position,
} from "@xyflow/react";

function FileGraphNode({ data, selected }) {
  return (
    <div
      className={`w-[230px] rounded-xl border bg-slate-900 px-4 py-3 shadow-lg transition ${
        selected
          ? "border-blue-400 ring-2 ring-blue-500/30"
          : "border-slate-700 hover:border-blue-500"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-2 !border-slate-900 !bg-blue-400"
      />

      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-sm font-bold text-blue-300">
          {data.extension}
        </div>

        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-slate-100">
            {data.label}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {data.language || "Source file"}
          </p>
        </div>
      </div>

      <div
        className="truncate border-t border-slate-800 pt-2 text-xs text-slate-400"
        title={data.path}
      >
        {data.path}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-2 !border-slate-900 !bg-blue-400"
      />
    </div>
  );
}



export default FileGraphNode;
