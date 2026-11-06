function createExecutionFlow(route, controllerCalls = [], serviceDetails = []) {
  const handlers = route.handlers || [];
  const controller = handlers.at(-1) || null;
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
    services: controllerServices,
  };
}

function matchControllerServices(controllerCalls, serviceDetails) {
  return controllerCalls.map((controllerCalls) => {
    const matchedService = serviceDetails.find((service) => {
      service.functionName === controllerCalls.method;
      return {
        ...controllerCalls,
        service: matchedService || null,
        databaseCalls: matchedService?.databaseCalls || [],
      };
    });
  });
}

export { createExecutionFlow, matchControllerServices };
