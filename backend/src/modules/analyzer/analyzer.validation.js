function validateAnalyzerRequest(body) {
  const { repositoryPath, selectedFiles, repositoryUrl } = body ?? {};
  if (typeof repositoryUrl === "string" && repositoryUrl.trim() !== "") {
  return {
    valid: true,
    type: "repositoryUrl",
  };
}

if (Array.isArray(selectedFiles) && selectedFiles.length > 0) {
  return {
    valid: true,
    type: "selectedFiles",
  };
}

if (typeof repositoryPath === "string" && repositoryPath.trim() !== "") {
  return {
    valid: true,
    type: "repositoryPath",
  };
}
return {
    valid: false,
    message:
      "Provide selectedFiles, a valid repositoryPath, or a GitHub repository URL.",
  };
}
export { validateAnalyzerRequest };
