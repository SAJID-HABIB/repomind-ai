function AnalyzeLocalFolder({
  selectedFiles,
  selectedFolderName,
  handleFolderChange,
  handleScanProject,
  isScanning,
  scanError,
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-white">Analyze Local Folder</h2>

      <p className="mt-2 text-sm text-slate-400">
        Select a project folder from your computer to analyze its code.
      </p>

      <div className="mt-5">
        <label
          htmlFor="project-folder"
          className="inline-block cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Browse Folder
        </label>

        <input
          id="project-folder"
          type="file"
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleFolderChange}
          className="hidden"
        />
      </div>

      {selectedFolderName && (
        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
          <p className="text-sm font-medium text-white">
            Selected folder: {selectedFolderName}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            {selectedFiles.length} files ready to scan
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleScanProject}
        disabled={selectedFiles.length === 0 || isScanning}
        className="mt-4 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isScanning ? "Scanning Project..." : "Scan Local Project"}
      </button>

      {scanError && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {scanError}
        </p>
      )}
    </section>
  );
}

export default AnalyzeLocalFolder;
