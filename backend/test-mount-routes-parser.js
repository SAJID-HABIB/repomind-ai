import { readFile } from "node:fs/promises";

import { extractMountRoutes } from "./src/modules/api-flow/parsers/mountRoutes.parser.js";

// Read backend app.js
const sourceCode = await readFile("./src/app.js", "utf-8");

// Extract mount routes
const result = extractMountRoutes(
  sourceCode,
  "backend/src/app.js",
  ".js",
);

console.log("EXTRACTED MOUNT ROUTES:");
console.log(result.mountRoutes);

console.log("IMPORTED ROUTERS:");
console.log(result.importedRouters);