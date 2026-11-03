import { parse } from "@babel/parser";
function extractFrontendRequests(sourceCode, filePath, extension) {
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
  const requests = [];
  const visited = new WeakSet();
  function visit(node) {
    if (!node || typeof node !== "object") {
      return;
    }
    if (visited.has(node)) {
      return;
    }
    visited.add(node);
   if (
  node.type === "CallExpression" &&
  node.callee.type === "Identifier" &&
  node.callee.name === "fetch"
) {
  const fetchOptions = node.arguments[1];

  const methodProperty = fetchOptions?.type === "ObjectExpression"
    ? fetchOptions.properties.find(
        (property) =>
          property.type === "ObjectProperty" &&
          property.key.name === "method"
      )
    : null;

  const method =
    methodProperty?.value?.type === "StringLiteral"
      ? methodProperty.value.value.toUpperCase()
      : "GET";

  requests.push({
    method,
    url: node.arguments[0]?.value || null,
    requestType: "fetch",
    sourceFile: filePath,
    line: node.loc?.start.line,
  });
}
    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.object?.type === "Identifier" &&
      node.callee.object.name === "axios"
    ) {
      const method = node.callee.property.name.toUpperCase();
      if (["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        requests.push({
          method,
          url: node.arguments[0]?.value || null,
          requestType: "axios",
          sourceFile: filePath,
          line: node.loc?.start.line,
        });
      }
    }
    for (const key of Object.keys(node)) {
      // Skip Babel metadata
      if (
        [
          "loc",
          "start",
          "end",
          "extra",
          "comments",
          "leadingComments",
          "trailingComments",
          "innerComments",
        ].includes(key)
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
      } else if (
        value &&
        typeof value === "object" &&
        typeof value.type === "string"
      ) {
        visit(value);
      }
    }
  }
  visit(ast.program);
  return requests;
}

export { extractFrontendRequests };
