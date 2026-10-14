import { analyzeRepository, analyzeSelectedFiles } from "./analyzer.service.js";

async function analyzeRepositoryController(req,res) {
    try {
      console.log("Content-Type:", req.headers["content-type"]);
console.log("Request Body:", req.body);

const { repositoryPath, selectedFiles } = req.body ?? {};
console.log("Received repositoryPath:", repositoryPath);
if (Array.isArray(selectedFiles)) {
    const result = analyzeSelectedFiles(selectedFiles);
    return res.status(200).json({
        success: true,
        message: "Selected project files analyzed successfully.",
        data: result,
    })
}
        if (typeof repositoryPath === "string" || repositoryPath.trim() !== "") {
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
        return res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}

export {analyzeRepositoryController};