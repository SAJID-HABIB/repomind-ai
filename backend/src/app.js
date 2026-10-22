import express from "express";
import cors from "cors";
import analyzerRoutes from "./modules/analyzer/analyzer.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RepoMind AI backend is running!",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
  });
});

// Analyzer routes
app.use("/api/analyzer", analyzerRoutes);

export default app;