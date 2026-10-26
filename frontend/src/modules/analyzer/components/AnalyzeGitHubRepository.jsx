import { useState } from "react";
function AnalyzeGitHubRepository({
  handleScanGitHubRepository,
  isScanning,
  scanError,
}) {
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const handleSubmit = (event) => {
    event.preventDefault();
    handleScanGitHubRepository(repositoryUrl);
  };

  return (
    <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-white">
        Analyze GitHub Repository
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Enter a public GitHub repository URL to analyze its source code.
      </p>

      <form onSubmit={handleSubmit} className="mt-5">
        <label
          htmlFor="github-repository-url"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          GitHub Repository URL
        </label>

        <input
          id="github-repository-url"
          type="url"
          value={repositoryUrl}
          onChange={(event) => setRepositoryUrl(event.target.value)}
          placeholder="https://github.com/username/repository"
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={isScanning || !repositoryUrl.trim()}
          className="mt-4 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isScanning ? "Scanning Repository..." : "Scan GitHub Repository"}
        </button>
      </form>

      {scanError && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {scanError}
        </p>
      )}
    </section>
  );
}

export default AnalyzeGitHubRepository;
