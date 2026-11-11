function normalizePath(path) {
  if (!path) return "";

  try {
    path = new URL(path).pathname;
  } catch {
    // Keep relative paths unchanged
  }

  return path.split("?")[0].replace(/\/+$/, "") || "/";
}

function matchEndpoint(frontendRequest, backendRoute) {
  const sameMethod = frontendRequest.method === backendRoute.method;

  const samePath = matchDynamicPath(frontendRequest.url, backendRoute.path);

  return sameMethod && samePath;
}

function matchEndpoints(frontendRequest, backendRoute) {
  return frontendRequest.map((request) => {
    const matchedRoutes = backendRoute.filter((route) =>
      matchEndpoint(request, route),
    );
    return {
      frontendRequest: request,
      matchedRoutes,
      matched: matchedRoutes.length > 0,
    };
  });
}

function matchDynamicPath(requestPath, routePath) {
  const requestSegments = normalizePath(requestPath).split("/");
  const routeSegments = normalizePath(routePath).split("/");
  if (requestSegments.length !== routeSegments.length) {
    return false;
  }
  return routeSegments.every((segment, index) => {
    return segment.startsWith(":") || segment === requestSegments[index];
  });
}
export { normalizePath, matchEndpoint, matchDynamicPath, matchEndpoints };
