import { parse } from "@babel/parser";

function extractControllerCalls(sourceCode, filePath, extension) {
  const plugins = [];

  if ([".ts", ".tsx"].includes(extension)) {
    plugins.push("typescript");
  }

  if ([".jsx", ".tsx"].includes(extension)) {
    plugins.push("jsx");
  }

  const ast = parse(sourceCode, {
    sourceType: "unambiguous",
    plugins,
  });

  const serviceCalls = [];
  const controllers = [];
  const importedModules = [];
  const visited = new WeakSet();
  let currentController = null;

  function visit(node) {
    if (!node || typeof node !== "object") {
      return;
    }

    if (visited.has(node)) {
      return;
    }

    visited.add(node);
    let previousController = currentController;
    let enteredController = false;
    if (node.type === "FunctionDeclaration") {
      currentController = node.id?.name;
      controllers.push({
        name: node.id?.name,
        sourceFile: filePath,
      });
      enteredController = true;
    } else if (
      node.type === "VariableDeclarator" &&
      ["ArrowFunctionExpression", "FunctionExpression"].includes(
        node.init?.type,
      )
    ) {
      currentController = node.id?.name;
      controllers.push({ name: node.id?.name, sourceFile: filePath });
      enteredController = true;
    } else if (
      node.type === "ObjectProperty" &&
      ["ArrowFunctionExpression", "FunctionExpression"].includes(
        node.value?.type,
      )
    ) {
      currentController = node.key?.name;
      controllers.push({
        name: node.key?.name,
        sourceFile: filePath,
      });
      enteredController = true;
    } else if (node.type === "ObjectMethod") {
      currentController = node.key?.name;
      controllers.push({
        name: node.key?.name,
        sourceFile: filePath,
      });
      enteredController = true;
    }

    if (node.type === "ImportDeclaration") {
      node.specifiers.forEach((specifier) => {
        importedModules.push({
          name: specifier.local.name,
          source: node.source.value,
        });
      });
    }
    if (node.type === "CallExpression") {
      let serviceImport = null;
      let method = null;
      let object = null;

      if (
        node.callee.type === "MemberExpression" &&
        node.callee.object.type === "Identifier" &&
        node.callee.property.type === "Identifier"
      ) {
        object = node.callee.object.name;
        method = node.callee.property.name;

        serviceImport = importedModules.find(
          (module) =>
            module.name === object &&
            module.source.toLowerCase().includes("service"),
        );
      }

      if (node.callee.type === "Identifier") {
        method = node.callee.name;

        serviceImport = importedModules.find(
          (module) =>
            module.name === method &&
            module.source.toLowerCase().includes("service"),
        );
      }

      if (serviceImport) {
        serviceCalls.push({
          controllerName: currentController,
          object,
          method,
          line: node.loc?.start.line,
          sourceFile: serviceImport.source,
        });
      }
    }

    for (const key of Object.keys(node)) {
      if (
        key === "loc" ||
        key === "start" ||
        key === "end" ||
        key === "extra" ||
        key.includes("Comments")
      ) {
        continue;
      }

      const value = node[key];

      if (Array.isArray(value)) {
        value.forEach((child) => {
          if (child && typeof child.type === "string") {
            visit(child);
          }
        });
      } else if (value && typeof value.type === "string") {
        visit(value);
      }
    }
    if (enteredController) {
      currentController = previousController;
    }
  }

  visit(ast.program);
  return {
    serviceCalls,
    controllers,
  };
}

export { extractControllerCalls };
