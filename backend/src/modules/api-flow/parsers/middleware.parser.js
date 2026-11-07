import { parse } from "@babel/parser";

function extractMiddlewareDetails(sourceCode, filePath, extension) {
  const plugins = [];
  if ([".ts", ".tsx"].includes(extension)) {
    plugins.push("typescript");
  }
  if (["tsx", ".tsx"].includes(extension)) {
    plugins.push("jsx");
  }
  const ast = parse(sourceCode, {
    sourceType: "unambiguous",
    plugins,
  });
  const middlewareDetails = [];
  function visit(node) {
    if (!node || typeof node !== "object") {
      return;
    }
    if (
      node.type === "FunctionDeclaration" &&
      node.id?.name &&
      node.params.some(
        (param) => param.type === "Identifier" && param.name === "next",
      )
    ) {
      middlewareDetails.push({
        name: node.id.name,
        parameters: node.params.map((param) => {
          if (param.type === "Identifier") {
            return param.name;
          }

          if (param.type === "ObjectPattern") {
            return "ObjectPattern";
          }

          if (param.type === "ArrayPattern") {
            return "ArrayPattern";
          }

          return "other";
        }),
        sourceFile: filePath,
        line: node.loc?.start.line,
      });
    }
    if (
      node.type === "VariableDeclarator" &&
      node.id?.type === "Identifier" &&
      ["ArrowFunctionExpression", "FunctionExpression"].includes(
        node.init?.type,
      ) &&
      node.init.params.some(
        (param) => param.type === "Identifier" && param.name === "next",
      )
    ) {
      middlewareDetails.push({
        name: node.id.name,
        parameters: node.init.params.map((param) => {
          if (param.type === "Identifier") {
            return param.name;
          }

          if (param.type === "ObjectPattern") {
            return "ObjectPattern";
          }

          if (param.type === "ArrayPattern") {
            return "ArrayPattern";
          }

          return "other";
        }),
        sourceFile: filePath,
        line: node.loc?.start.line,
      });
    }
    for (const key of Object.keys(node)) {
      if (["loc", "start", "end", "extra"].includes(key)) {
        continue;
      }
      const value = node[key];
      if (Array.isArray(value)) {
        value.forEach(visit);
      } else if (value && typeof value.type === "string") {
        visit(value);
      }
    }
  }
  visit(ast.program);
  return middlewareDetails;
}

export { extractMiddlewareDetails };
