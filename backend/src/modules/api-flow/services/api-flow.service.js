import { extractFrontendRequests } from "../parsers/frontendRequest.parser.js";
import { extractBackendRoutes } from "../parsers/backendRoutes.parser.js";
import { extractControllerCalls } from "../parsers/controller.parser.js";
import { extractServiceDetails } from "./service.parser.js";

import { matchEndpoints } from "./endpointMatcher.service.js";
import { createExecutionFlow } from "./executionTracer.service.js";
import { extractMiddlewareDetails } from "../parsers/middleware.parser.js";
import { extractMountRoutes } from "../parsers/mountRoutes.parser.js";

async function analyzeApiFlow(selectedFiles) {
  const frontendRequests = [];
  const backendRoutes = [];
  const mountRoutes = [];
  const importedRouters = [];
  const controllerCalls = [];
  const serviceDetails = [];
  const middlewareDetails = [];
  const controllerDeclarations = [];

  // Step 1: Process all selected files
  for (const file of selectedFiles) {
    const extension = "." + file.path.split(".").pop();
    // console.log("API FLOW FILE:", file.path, extension);
    if (file.path.endsWith("/app.js")) {
      const mountResult = extractMountRoutes(
        file.content,
        file.path,
        extension,
      );

      mountRoutes.push(...mountResult.mountRoutes);
      importedRouters.push(...mountResult.importedRouters);
    }

    if (file.path.startsWith("frontend/")) {
      const requests = extractFrontendRequests(
        file.content,
        file.path,
        extension,
      );

      frontendRequests.push(...requests);
      // console.log("FRONTEND REQUEST COUNT:", file.path, requests.length);

      if (requests.length > 0) {
        // console.log("DETECTED REQUESTS:", file.path, requests);
      }
    }

    const routes = extractBackendRoutes(file.content, file.path, extension);

    backendRoutes.push(...routes);

    const controllerResult = extractControllerCalls(
      file.content,
      file.path,
      extension,
    );
    controllerCalls.push(...controllerResult.serviceCalls);
    if (
      file.path.includes("/controllers/") ||
      file.path.includes("/controller/")
    ) {
      controllerDeclarations.push(...controllerResult.controllers);
    }

    const services = extractServiceDetails(file.content, extension);
    const middlewares = extractMiddlewareDetails(
      file.content,
      file.path,
      extension,
    );

    middlewareDetails.push(...middlewares);
    serviceDetails.push(...services);
  }

  // Step 2: Match frontend requests with backend routes
  // Combine router mount prefixes with backend route paths
  for (const mount of mountRoutes) {
    const importedRouter = importedRouters.find(
      (item) => item.routerName === mount.routerName,
    );

    if (!importedRouter) continue;

    const mountedRoutes = backendRoutes.filter(
      (route) => route.sourceFile === importedRouter.resolvedPath,
    );

    mountedRoutes.forEach((route) => {
      route.originalPath = route.path;

      route.path = `${mount.prefix}/${route.originalPath}`
        .replace(/\/+/g, "/")
        .replace(/\/$/, "");
    });
  }
  const matchedEndpoints = matchEndpoints(frontendRequests, backendRoutes);

  // Step 3: Create execution flows
  // console.log("BEFORE EXECUTION FLOWS MAP");
  // console.log("MATCHED ENDPOINTS TYPE:", Array.isArray(matchedEndpoints));
  // console.log("MATCHED ENDPOINTS:", matchedEndpoints);
  const executionFlows = matchedEndpoints.map((match) => {
    // console.log("CURRENT MATCH:", match);
    if (!match.matched) {
      return {
        frontendRequest: match.frontendRequest,
        matched: false,
        executionFlow: null,
      };
    }

    const executionFlow = match.matchedRoutes.map((route) => {
      return createExecutionFlow(
        route,
        controllerCalls,
        serviceDetails,
        middlewareDetails,
        controllerDeclarations,
      );
    });

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
    totalMatched: matchedEndpoints.filter((match) => match.matched).length,
    executionFlows,
  };
}

export { analyzeApiFlow };
