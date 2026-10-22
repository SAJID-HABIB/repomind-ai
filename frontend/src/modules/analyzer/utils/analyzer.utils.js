const supportedExtensions = [
  ".js", ".jsx", ".mjs", ".cjs",
  ".ts", ".tsx", ".py", ".java",
  ".c", ".h", ".cpp", ".hpp",
  ".cs", ".go", ".rs", ".php",
  ".rb", ".swift", ".kt", ".dart",
];

function filterSupportedFiles(files) {
  return files.filter((file) => {
    const fileName = file.name.toLowerCase();

    return supportedExtensions.some((extension) =>
      fileName.endsWith(extension),
    );
  });
}

export default filterSupportedFiles;