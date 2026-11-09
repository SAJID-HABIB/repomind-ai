import { parse } from "@babel/parser";

function extractServiceDetails(sourceCode, extension) {
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
  const serviceDetails = [];
  const databaseMethods = [
    "find",
    "findOne",
    "findById",
    "create",
    "insertMany",
    "updateOne",
    "updateMany",
    "findOneAndUpdate",
    "findByIdAndUpdate",
    "deleteOne",
    "deleteMany",
    "findOneAndDelete",
    "findByIdAndDelete",
    "countDocuments",
    "aggregate",
  ];

  const visited = new WeakSet();
  let currentFunction = null;
  function visit(node) {
    if (!node || typeof node !== "object") {
      return;
    }
    if (visited.has(node)) {
      return;
    }
    visited.add(node);
    let previousFunction = currentFunction;
    let enteredFunction = false;
    if (node.type === "FunctionDeclaration" && !currentFunction) {
      currentFunction = {
        functionName: node.id?.name,
        line: node.loc?.start.line,
        databaseCalls: [],
      };
      serviceDetails.push(currentFunction);
      enteredFunction = true;
    }
    if (
      node.type === "VariableDeclarator" &&
      ["ArrowFunctionExpression", "FunctionExpression"].includes(
        node.init?.type,
      ) &&
      !currentFunction
    ) {
      currentFunction = {
        functionName: node.id?.name,
        line: node.loc?.start.line,
        databaseCalls: [],
      };
      serviceDetails.push(currentFunction);
      enteredFunction = true;
    }
    if (
      ["ClassMethod", "ClassPrivateMethod"].includes(node.type) &&
      !currentFunction
    ) {
      currentFunction = {
        functionName: node.key?.name,
        line: node.loc?.start.line,
        databaseCalls: [],
      };

      serviceDetails.push(currentFunction);
      enteredFunction = true;
    }
    if (
      node.type === "CallExpression" &&
      node.callee.type === "MemberExpression" &&
      node.callee.object.type === "Identifier" &&
      node.callee.property.type === "Identifier" &&
      databaseMethods.includes(node.callee.property.name) &&
      currentFunction
    ) {
      currentFunction.databaseCalls.push({
        model: node.callee.object.name,
        method: node.callee.property.name,
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
        value.forEach((child) => {
          if (child && typeof child.type === "string") {
            visit(child);
          }
        });
      } else if (value && typeof value.type === "string") {
        visit(value);
      }
    }
    if (enteredFunction) {
      currentFunction = previousFunction;
    }
  }
  visit(ast.program);
  return serviceDetails;
}

export { extractServiceDetails };
