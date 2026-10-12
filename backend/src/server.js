const express = require ("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.get("/",(req ,res) => {
    res.json({
        success: true,
        message: "RepoMind AI backend is running!"
    })
})

app.get("/api/health",(req ,res) => {
    res.json({
        success: true,
        message:  "Server is healthy",
    })
})

app.listen(PORT,() => {
    console.log(`RepoMind AI server running at http://localhost:${PORT}`);
    
})