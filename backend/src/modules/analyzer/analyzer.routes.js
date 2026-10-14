import express from "express";
import {analyzeRepositoryController} from "./analyzer.controller.js";
const router = express.Router();

router.post("/", analyzeRepositoryController);

export default router;