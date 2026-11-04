import { extractFrontendRequests } from "./src/modules/api-flow/parsers/frontendRequest.parser.js";

const sampleCode = `
  app.get(\`/users/\${userId}\`, getUser);

  // Fetch methods
  fetch("/api/users/1", { method: "PUT" });
  fetch("/api/users/1", { method: "PATCH" });
  fetch("/api/users/1", { method: "DELETE" });

  // Axios methods
  axios.put("/api/users/1");
  axios.patch("/api/users/1");
  axios.delete("/api/users/1");

  // Normal Fetch GET
  fetch("/api/users");

  // Fetch POST
  fetch("/api/products", {
    method: "POST"
  });

  // Normal Axios GET and POST
  axios.get("/api/users");
  axios.post("/api/login");

  // Dynamic URLs
  fetch(\`/api/users/\${userId}\`);
  axios.get(\`/api/products/\${productId}\`);
`;

const result = extractFrontendRequests(
  sampleCode,
  "src/App.jsx",
  ".jsx"
);

console.log("Detected API Requests:");
console.log(result);

console.log("\nTesting Invalid JavaScript:");

try {
  extractFrontendRequests(
    'fetch("/api/users"',
    "src/Broken.jsx",
    ".jsx"
  );
} catch (error) {
  console.log(error.message);
}
