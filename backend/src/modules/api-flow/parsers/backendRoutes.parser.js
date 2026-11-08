import { parse } from "@babel/parser";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];

function extractRoutePath(argument, sourceCode) {
  if (!argument) {
    return null;
  }

  if (argument.type === "StringLiteral") {
    return argument.value;
  }

  if (argument.type === "TemplateLiteral") {
    const parts = [];

    argument.quasis.forEach((quasi, index) => {
      parts.push(quasi.value.cooked ?? quasi.value.raw);

      if (index < argument.expressions.length) {
        const expression = argument.expressions[index];

        parts.push(
          "${" + sourceCode.slice(expression.start, expression.end) + "}",
        );
      }
    });

    return parts.join("");
  }

  return null;
}

function extractBackendRoutes(sourceCode, filePath, extension) {
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
  const routes = [];
  const visited = new WeakSet();
  const importedControllers = [];
  function visit(node) {
    if (!node || typeof node !== "object") {
      return;
    }
    if (visited.has(node)) {
      return;
    }
    visited.add(node);
    if (node.type === "ImportDeclaration") {
      node.specifiers.forEach((specifier) => {
        importedControllers.push({
          name: specifier.local.name,
          source: node.source.value,
        });
      });
    }
    if (
      node.type === "CallExpression" &&
      node.callee.type === "MemberExpression" &&
      node.callee.object.type === "Identifier" &&
      node.callee.property.type === "Identifier" &&
      HTTP_METHODS.includes(node.callee.property.name)
    ) {
      const routePath = extractRoutePath(node.arguments[0], sourceCode);
      const handlers = node.arguments
        .slice(1)
        .map((argument) => {
          if (argument.type === "Identifier") {
            return argument.name;
          }

          if (argument.type === "ArrowFunctionExpression") {
            return "inline-arrow-function";
          }

          if (argument.type === "FunctionExpression") {
            return "inline-function";
          }

          return null;
        })
        .filter(Boolean);

      if (routePath !== null) {
        const controllerImports = handlers
          .map((handler) =>
            importedControllers.find((item) => item.name === handler),
          )
          .filter(Boolean);
          console.log("ROUTE CONTROLLER IMPORTS:", controllerImports);
        routes.push({
          method: node.callee.property.name.toUpperCase(),
          path: routePath,
          handlers,
          controllerImports,
          sourceFile: filePath,
          line: node.loc?.start.line,
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
  }
  visit(ast.program);

  return routes;
}

export { extractBackendRoutes };
