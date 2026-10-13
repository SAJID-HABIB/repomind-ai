const express = require ("express");

import {analyzeRepositoryController} from "./analyzer.controller";
const router = express.Router();

router.post("/", analyzeRepositoryController);

export {router};