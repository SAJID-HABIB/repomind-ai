import { extractFrontendRequests } from "../parsers/frontendRequest.parser.js";
import { extractBackendRoutes } from "../parsers/backendRoutes.parser.js";
import { extractControllerCalls } from "../parsers/controller.parser.js";
import { extractServiceDetails } from "./service.parser.js";

import { matchEndpoints } from "./endpointMatcher.service.js";
import { createExecutionFlow } from "./executionTracer.service.js";

async function analyzeApiFlow(selectedFiles) {
  const frontendRequests = [];
  const backendRoutes = [];
  const controllerCalls = [];
  const serviceDetails = [];

  // Step 1: Process all selected files
  for (const file of selectedFiles) {
    const extension = "." + file.path.split(".").pop();

    const requests = extractFrontendRequests(
      file.content,
      file.path,
      extension
    );

    frontendRequests.push(...requests);

    const routes = extractBackendRoutes(
      file.content,
      file.path,
      extension
    );

    backendRoutes.push(...routes);

    const controllers = extractControllerCalls(file.content);
    controllerCalls.push(...controllers);

    const services = extractServiceDetails(file.content);
    serviceDetails.push(...services);
  }

  // Step 2: Match frontend requests with backend routes
  const matchedEndpoints = matchEndpoints(
    frontendRequests,
    backendRoutes
  );

  // Step 3: Create execution flows
  const executionFlows = matchedEndpoints.map((match) => {
    if (!match.matched) {
      return {
        frontendRequest: match.frontendRequest,
        matched: false,
        executionFlow: null,
      };
    }

    const executionFlow = match.matchedRoutes.map((route) =>
      createExecutionFlow(route, controllerCalls, serviceDetails)
    );

    return {
      frontendRequest: match.frontendRequest,
      matched: true,
      executionFlow,
    };
  });

  // Step 4: Return final result
  return {
    totalRequests: frontendRequests.length,
    totalRoutes: backendRoutes.length,
    totalMatched: matchedEndpoints.filter(
      (match) => match.matched
    ).length,
    executionFlows,
  };
}

export { analyzeApiFlow };