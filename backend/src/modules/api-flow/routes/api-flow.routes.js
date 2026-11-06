import express from "express";
import { validateApiFlowRequest } from "../validation/api-flow.validation.js";
import { analyzeApiFlowController } from "../controllers/api-flow.controller.js";
const router = express.Router();

router.post("/analyze",
    validateApiFlowRequest,
    analyzeApiFlowController,
)

export default router;