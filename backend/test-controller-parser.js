import { extractControllerCalls } from "./src/modules/api-flow/parsers/controller.parser.js";

const sourceCode = `
import userService from "../services/user.service.js";
import logger from "../utils/logger.js";

async function getUsers(req, res) {
  logger.info("Fetching users");

  const users = await userService.getAllUsers();

  res.json(users);
}

async function getUserCount(req, res) {
  const count = await userService.getUserCount();

  res.json({ count });
}
`;

console.log(extractControllerCalls(sourceCode));