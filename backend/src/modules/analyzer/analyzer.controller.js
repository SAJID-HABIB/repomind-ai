import { analyzeRepository } from "./analyzer.service";

async function analyzeRepositoryController(req,res) {
    try {
        const {repositoryPath} = req.body;
        if (typeof repositoryPath !== "string" || repositoryPath.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Repository path is required.",
            });
        } 
        const result = await analyzeRepository(repositoryPath);
        return res.status(200).json({
            success: true,
            message :"Repository scanned successfully.",
            data: result,
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}

export {analyzeRepositoryController};