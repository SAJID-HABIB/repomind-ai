import { analyzeApiFlow } from "../services/api-flow.service.js";
const analyzeApiFlowController = async (req, res, next) => {
    try {
        const {selectedFiles} = req.body;
        const result = await analyzeApiFlow(selectedFiles);
        return res.status(200).json({
            success: true,
            message:  "API flow analysis completed successfully.",
            data: result,
        })
    } catch (error) {
        next(error);
    }
}
export {analyzeApiFlowController}