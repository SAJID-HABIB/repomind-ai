import { matchEndpoints } from "./src/modules/api-flow/services/endpointMatcher.service.js";

// Frontend API Requests
const frontendRequests = [
  {
    method: "GET",
    url: "/api/users",
    sourceFile: "src/api/user.api.js",
  },
  {
    method: "POST",
    url: "/api/users",
    sourceFile: "src/api/user.api.js",
  },
  {
    method: "GET",
    url: "/api/users/25",
    sourceFile: "src/api/user.api.js",
  },
  {
    method: "GET",
    url: "/api/products",
    sourceFile: "src/api/product.api.js",
  },
];

// Backend Express Routes
const backendRoutes = [
  {
    method: "GET",
    path: "/api/users",
    handlers: ["getUsers"],
    sourceFile: "src/routes/user.routes.js",
  },
  {
    method: "POST",
    path: "/api/users",
    handlers: ["createUser"],
    sourceFile: "src/routes/user.routes.js",
  },
  {
    method: "GET",
    path: "/api/users/:id",
    handlers: ["getUser"],
    sourceFile: "src/routes/user.routes.js",
  },
];

// Run matcher
const results = matchEndpoints(frontendRequests, backendRoutes);

console.log(JSON.stringify(results, null, 2));