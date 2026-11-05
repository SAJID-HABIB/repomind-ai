import { parse } from "@babel/parser";

function extractServiceDetails(sourceCode) {
  const ast = parse(sourceCode, {
    sourceType: "unambiguous",
  });

  const serviceDetails = [];

  const visited = new WeakSet();
  function visit(node) {
    if (!node || typeof node !== "object") {
      return;
    }
    if (visited.has(node)) {
      return;
    }
    visited.add(node);
    if (node.type === "FunctionDeclaration") {
      serviceDetails.push({
        functionName: node.id?.name,
        line: node.loc?.start.line,
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
        value.array.forEach((child) => {
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
  return serviceDetails;
}

export { extractServiceDetails };
