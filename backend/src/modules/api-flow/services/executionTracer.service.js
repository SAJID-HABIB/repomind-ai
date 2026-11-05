function createExecutionFlow(route) {
  const handlers = route.handlers || [];

  return {
    route: {
      method: route.method,
      path: route.path,
      sourceFile: route.sourceFile,
      line: route.line,
    },
    handlers: handlers.slice(0, -1),
    controller: handlers.at(-1) || null,
  };
}

export { createExecutionFlow };
