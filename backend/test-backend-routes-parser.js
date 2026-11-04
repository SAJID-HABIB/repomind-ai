import { extractBackendRoutes } from "./src/modules/api-flow/parsers/backendRoutes.parser.js";

const sourceCode = `
  import express from "express";

  const app = express();
  const router = express.Router();

  app.get("/users", getUsers);
  app.post("/users", createUser);

  router.put("/users/:id", updateUser);
  router.delete("/users/:id", deleteUser);
  app.get(\`/users/\${userId}\`, getUser);
  app.get("/users", authenticateUser, getUsers);
  app.get("/products", (req, res) => {
  res.json([]);
});
app.post("/products", function (req, res) {
  res.json({});
});
`;

const routes = extractBackendRoutes(
  sourceCode,
  "src/routes/user.routes.js",
  ".js"
);

console.log("Detected Backend Routes:");
console.log(routes);