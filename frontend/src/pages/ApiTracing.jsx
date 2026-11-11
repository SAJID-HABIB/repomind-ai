import { useState } from "react";
import { analyzeApiFlow } from "../modules/api-flow/api/apiFlow.api.js";

function ApiTracing({ sourceFiles = [] }) {
  console.log("API Tracing sourceFiles:", sourceFiles.length);
  console.table(
  sourceFiles.map((file) => ({
    path: file.path,
    hasContent: Boolean(file.content),
    contentLength: file.content?.length || 0,
  }))
);

console.log(
  "SOURCE FILE SAMPLE:",
  sourceFiles.slice(0, 3)
);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const handleAnalyzeApiFlow = async () => {
    if (sourceFiles.length === 0) {
      setAnalysisError("Please scan a repository first");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError("");
    setAnalysisResult(null);
    try {
      const result = await analyzeApiFlow(sourceFiles);

      setAnalysisResult(result.data);
    } catch (error) {
      setAnalysisError(error.message || "API Flow analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">API Tracing</h1>

        <p className="mt-2 text-sm text-slate-400">
          Monitor and understand API request flows across your codebase.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Analyze API Flow
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Analyze frontend requests and their backend execution flow.
            </p>
          </div>

          <button
            onClick={handleAnalyzeApiFlow}
            disabled={isAnalyzing}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze API Flow"}
          </button>
          {analysisResult && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                  <p className="text-sm text-slate-400">Total Requests</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">
                    {analysisResult.totalRequests}
                  </h3>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                  <p className="text-sm text-slate-400">Total Routes</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">
                    {analysisResult.totalRoutes}
                  </h3>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                  <p className="text-sm text-slate-400">Matched Requests</p>
                  <h3 className="mt-2 text-2xl font-bold text-green-400">
                    {analysisResult.totalMatched}
                  </h3>
                </div>
              </div>

              {/* Execution Flows */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">
                  API Execution Flows
                </h2>

                {analysisResult.executionFlows?.map((flow, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                  >
                    <h3 className="font-semibold text-white">
                      {flow.frontendRequest.method} {flow.frontendRequest.url}
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      Frontend: {flow.frontendRequest.sourceFile}
                    </p>

                    {flow.matched ? (
                      flow.executionFlow.map((execution, flowIndex) => (
                        <div key={flowIndex} className="mt-5 space-y-4">
                          <div>
                            <p className="text-xs font-semibold uppercase text-blue-400">
                              Backend Route
                            </p>
                            <p className="mt-1 text-white">
                              {execution.route.method} {execution.route.path}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase text-purple-400">
                              Middleware
                            </p>
                            <p className="mt-1 text-white">
                              {execution.middlewares
                                ?.map((middleware) => middleware.name)
                                .join(", ") || "None"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase text-yellow-400">
                              Controller
                            </p>
                            <p className="mt-1 text-white">
                              {execution.controller || "Not found"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase text-green-400">
                              Services
                            </p>

                            {execution.services?.length > 0 ? (
                              execution.services.map(
                                (service, serviceIndex) => (
                                  <div
                                    key={serviceIndex}
                                    className="mt-2 text-white"
                                  >
                                    {service.object}.{service.method}
                                  </div>
                                ),
                              )
                            ) : (
                              <p className="mt-1 text-sm text-slate-400">
                                None
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase text-orange-400">
                              Database Calls
                            </p>

                            {execution.services?.flatMap(
                              (service) => service.databaseCalls || [],
                            ).length > 0 ? (
                              execution.services
                                .flatMap(
                                  (service) => service.databaseCalls || [],
                                )
                                .map((call, callIndex) => (
                                  <p
                                    key={callIndex}
                                    className="mt-1 text-sm text-white"
                                  >
                                    {call.model}.{call.method}()
                                  </p>
                                ))
                            ) : (
                              <p className="mt-1 text-sm text-slate-400">
                                None
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="mt-4 text-sm text-red-400">
                        No matching backend route found.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {analysisError && (
          <p className="mt-4 text-sm text-red-400">{analysisError}</p>
        )}
      </div>
    </div>
  );
}

export default ApiTracing;
