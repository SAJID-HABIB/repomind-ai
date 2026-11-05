import { parse } from "@babel/parser";

function extractControllerCalls(sourceCode) {
  const ast = parse(sourceCode, {
    sourceType: "unambiguous",
  });
  const serviceCalls = [];
  const importedModules = [];
  const visited = new WeakSet();

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
        importedModules.push({
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
      importedModules.some(
        (module) =>
          module.name === node.callee.object.name &&
          module.source.toLowerCase().includes("service"),
      )
    ) {
      serviceCalls.push({
        object: node.callee.object.name,
        method: node.callee.property.name,
        line: node.loc?.start.line,
        sourceFile: importedModules.find(
          (module) => module.name === node.callee.object.name,
        )?.source,
      });
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
  return serviceCalls;
}

export { extractControllerCalls };
