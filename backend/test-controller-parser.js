import { extractControllerCalls } from "./src/modules/api-flow/parsers/controller.parser.js";
const sourceCode = `
async function getAllUsers() {
  return await User.find();
}

async function getUserCount() {
  return await User.countDocuments();
}
`;

console.log(sourceCode);