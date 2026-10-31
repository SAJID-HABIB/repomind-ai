import { analyzeRepository } from "./src/modules/analyzer/analyzer.service.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repositoryPath = path.join(__dirname, "sample-project");

async function testAnalyzer() {
  try {
    const result = await analyzeRepository(repositoryPath);
    console.log("Analysis result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Analysis failed:", error);
  }
}

testAnalyzer();