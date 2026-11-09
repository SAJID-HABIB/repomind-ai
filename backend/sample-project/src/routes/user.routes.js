import express from "express";
import { getUsers } from "../controller/admin.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/api/users", verifyToken, getUsers);

export default router;