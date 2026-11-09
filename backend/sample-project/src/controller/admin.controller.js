import * as userService from "../services/user.service.js";

export const getUsers = async (req, res) => {
  const data = await userService.getAllData();

  res.json({
    data,
  });
};