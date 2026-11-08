import { getAllUsers } from "../services/user.service.js";

export const getUsers = (req, res) => {
  const users = getAllUsers();

  res.json({
    message: "Admin users fetched successfully",
    data: users,
  });
};