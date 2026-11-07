import assert from "node:assert/strict";
import { extractMiddlewareDetails } from "./src/modules/api-flow/parsers/middleware.parser.js";

const sourceCode = `
function authMiddleware(req, res, next) {
  next();
}

const adminMiddleware = (req, res, next) => {
  next();
};

const userMiddleware = function (req, res, next) {
  next();
};
function getUsers(req, res) {
  res.json([]);
}

const calculateTotal = (price, quantity) => {
  return price * quantity;
};
const auditMiddleware = ({ user }, res, next) => {
  next();
};
`;

const result = extractMiddlewareDetails(
  sourceCode,
  "auth.middleware.js",
  ".js"
);

console.log("Detected Middleware:", result);

assert.equal(result.length, 4);

assert.deepEqual(
  result.map((middleware) => middleware.name),
  ["authMiddleware",
    "adminMiddleware",
    "userMiddleware",
    "auditMiddleware"]
);



console.log("All middleware parser tests passed!");