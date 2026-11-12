import { parse } from "@babel/parser";
function extractUrl(argument, sourceCode) {
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
  if (argument.type === "Identifier") {
    const variableName = argument.name;

    const variableRegex = new RegExp(
      `\\b(?:const|let|var)\\s+${variableName}\\s*=\\s*["'\`]([^"'\`]*)["'\`]`,
    );

    const match = sourceCode.match(variableRegex);

    return match ? match[1] : null;
  }
  return null;
}
function extractFrontendRequests(sourceCode, filePath, extension) {
  const plugins = [];
  if ([".ts", ".tsx"].includes(extension)) {
    plugins.push("typescript");
  }
  if ([".jsx", ".tsx"].includes(extension)) {
    plugins.push("jsx");
  }
  let ast;
  try {
    ast = parse(sourceCode, {
      sourceType: "unambiguous",
      plugins,
    });
  } catch (error) {
    const location = error.loc
      ? ` at line ${error.loc.line}, column ${error.loc.column}`
      : "";

    throw new Error(
      `Failed to parse ${filePath}${location}: ${error.message}`,
      { cause: error },
    );
  }

  const requests = [];
  const axiosInstances = new Set();

  function collectAxiosInstances(node) {
    if (
      node.type === "VariableDeclarator" &&
      node.id.type === "Identifier" &&
      node.init?.type === "CallExpression" &&
      node.init.callee.type === "MemberExpression" &&
      node.init.callee.object.type === "Identifier" &&
      node.init.callee.object.name === "axios" &&
      node.init.callee.property.name === "create"
    ) {
      axiosInstances.add(node.id.name);
    }

    for (const key of Object.keys(node)) {
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
            collectAxiosInstances(child);
          }
        });
      } else if (
        value &&
        typeof value === "object" &&
        typeof value.type === "string"
      ) {
        collectAxiosInstances(value);
      }
    }
  }

  collectAxiosInstances(ast.program);
  const apiImports = ast.program.body
    .filter(
      (node) =>
        node.type === "ImportDeclaration" &&
        (node.source.value.includes("services/api") ||
          node.source.value.includes("api.js") ||
          node.source.value.includes("api")),
    )
    .map((node) => ({
      source: node.source.value,
      imports: node.specifiers.map((specifier) => ({
        local: specifier.local.name,
        imported:
          specifier.type === "ImportSpecifier"
            ? specifier.imported.name
            : "default",
      })),
    }));

  if (apiImports.length > 0) {
    console.log("API IMPORTS:", filePath, JSON.stringify(apiImports, null, 2));
  }

  // console.log("DETECTED AXIOS INSTANCES:", [...axiosInstances]);
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

      const methodProperty =
        fetchOptions?.type === "ObjectExpression"
          ? fetchOptions.properties.find(
              (property) =>
                property.type === "ObjectProperty" &&
                property.key.name === "method",
            )
          : null;

      const method =
        methodProperty?.value?.type === "StringLiteral"
          ? methodProperty.value.value.toUpperCase()
          : "GET";

      requests.push({
        method,
        url: extractUrl(node.arguments[0], sourceCode),
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
          url: extractUrl(node.arguments[0], sourceCode),
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
