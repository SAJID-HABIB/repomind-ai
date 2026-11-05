import { createExecutionFlow } from "./src/modules/api-flow/services/executionTracer.service.js";

const route = {
  method: "GET",
  path: "/api/users",
  handlers: ["authenticateUser", "getUsers"],
  sourceFile: "src/routes/user.routes.js",
  line: 7,
};

const result = createExecutionFlow(route);

console.log(JSON.stringify(result, null, 2));