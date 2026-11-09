import { dirname, join, normalize } from "node:path";
function createExecutionFlow(
  route,
  controllerCalls = [],
  serviceDetails = [],
  middlewareDetails = [],
  controllerDeclarations = [],
) {
  const handlers = route.handlers || [];
  const middlewares = middlewareDetails.filter((middleware) =>
    handlers.slice(0, -1).includes(middleware.name),
  );
  const controller = handlers.at(-1) || null;
  const controllerImport = route.controllerImports?.find(
    (item) => item.name === controller,
  );

  const importedControllerPath = controllerImport
    ? normalize(join(dirname(route.sourceFile), controllerImport.source))
    : null;

  const matchedController = controllerDeclarations.find(
    (item) =>
      item.name === controller &&
      (importedControllerPath === null ||
        normalize(item.sourceFile) === importedControllerPath),
  );

  const controllerFound = Boolean(matchedController);
  const matchedControllerCalls = matchControllerServices(
    controllerCalls,
    serviceDetails,
  );
  const controllerServices = matchedControllerCalls.filter(
    (call) => call.controllerName === controller,
  );

  return {
    route: {
      method: route.method,
      path: route.path,
      sourceFile: route.sourceFile,
      line: route.line,
    },
    handlers: handlers.slice(0, -1),
    controller,
    controllerFound,
    controllerSourceFile: matchedController?.sourceFile || null,
    services: controllerServices,
    middlewares,
  };
}

function matchControllerServices(controllerCalls, serviceDetails) {
  return controllerCalls.map((controllerCalls) => {
    const matchedService = serviceDetails.find(
      (service) => service.functionName === controllerCalls.method,
    );
    return {
      ...controllerCalls,
      service: matchedService || null,
      databaseCalls: matchedService?.databaseCalls || [],
    };
  });
}

export { createExecutionFlow, matchControllerServices };
