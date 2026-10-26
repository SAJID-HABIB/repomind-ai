import { useState } from "react";

function useProjectFiles() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFolderName, setSelectedFolderName] = useState("");

  const handleFolderChange = (event) => {
    const files = Array.from(event.target.files || []);

    const excludedFolders = [
      "node_modules",
      ".git",
      "dist",
      "build",
      "coverage",
      ".next",
      ".venv",
      "venv",
      "__pycache__",
    ];

    const filteredFiles = files.filter((file) => {
      const pathParts = file.webkitRelativePath.split("/");

      return !pathParts.some((part) => excludedFolders.includes(part));
    });

    setSelectedFiles(filteredFiles);

    if (files.length > 0) {
      const folderName = files[0].webkitRelativePath.split("/")[0];
      setSelectedFolderName(folderName);
    } else {
      setSelectedFolderName("");
    }
  };

  return {
    selectedFiles,
    selectedFolderName,
    handleFolderChange,
  };
}

export default useProjectFiles;
