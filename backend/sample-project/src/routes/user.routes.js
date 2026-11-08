import express from "express";
import { getUsers } from "../controller/admin.controller.js";

const router = express.Router();

router.get("/api/users", getUsers);

export default router;