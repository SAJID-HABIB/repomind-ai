async function analyzeSelectedFiles(filesWithContent) {
  const response = await fetch("http://localhost:5000/api/analyzer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      selectedFiles: filesWithContent,
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Project analysis failed.");
  }
  return result;
}
async function analyzeGitHubRepository(repositoryUrl) {
  const response = await fetch("http://localhost:5000/api/analyzer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      repositoryUrl,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "GitHub repository analysis failed.");
  }

  return result;
}

export default analyzeSelectedFiles;
export { analyzeGitHubRepository };
