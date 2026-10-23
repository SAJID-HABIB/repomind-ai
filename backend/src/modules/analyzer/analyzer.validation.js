function validateAnalyzerRequest(body) {
    const {repositoryPath, selectedFiles} = body??{};
    if (Array.isArray(selectedFiles)) {
        if (selectedFiles.length === 0) {
            return {
                valid: false,
                message: "No files were provided for analysis.",
            }
        }
        return {
            valid: true,
            type: "selectedFiles",
        }
    }
     if (typeof repositoryPath === "string" && repositoryPath.trim() !== "") {
            return {
                valid: true,
                type: "repositoryPath",
            }
        }
        return {
            valid:false,
            message: "Provide selectedFiles or a valid repositoryPath.",
        }
}
export  {validateAnalyzerRequest};