import { analyzeRepository, analyzeSelectedFiles } from "./analyzer.service.js";

async function analyzeRepositoryController(req,res) {
    try {
const { repositoryPath, selectedFiles } = req.body ?? {};
if (Array.isArray(selectedFiles)) {
    const result = await analyzeSelectedFiles(selectedFiles);
    return res.status(200).json({
        success: true,
        message: "Selected project files analyzed successfully.",
        data: result,
    })
}
        if (typeof repositoryPath === "string" && repositoryPath.trim() !== "") {
            const result = await analyzeRepository(repositoryPath);
            return res.status(200).json({
        success: true,
        message: "Repository scanned successfully.",
        data: result,
      });
        } 

            return res.status(400).json({
                success: false,
                message: "Provide selectedFiles or a valid repositoryPath."
            });
    } catch (error) {
        const clientErrors = [
              "No files were provided for analysis.",
            "No supported files were found for analysis.",
            "The repository path must be a directory.",
        ];
        if (clientErrors.includes(error.message)) {
            return res.status(400).json({
                success: false,
                message: error.message,
            })
        }
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred during analysis.",
        })
    }
}

export {analyzeRepositoryController};