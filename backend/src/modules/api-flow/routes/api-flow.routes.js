import express from "express";

import { validateApiFlowRequest } from "./api-flow.validation";

const router = express.Router();

router.post("analyze",
    validateApiFlowRequest,
)