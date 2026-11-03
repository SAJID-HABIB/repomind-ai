import { extractFrontendRequests } from "./src/modules/api-flow/parsers/frontendRequest.parser.js";

const sampleCode = `
  fetch("/api/users");

  fetch("/api/products", {
    method: "POST"
  });

  axios.get("/api/users");

  axios.post("/api/login");
`;

const result = extractFrontendRequests(
  sampleCode,
  "src/App.jsx",
  ".jsx"
);

console.log("Detected API Requests:");
console.log(result);