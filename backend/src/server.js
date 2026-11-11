import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`RepoMind AI server running at http://localhost:${PORT}`);
});
