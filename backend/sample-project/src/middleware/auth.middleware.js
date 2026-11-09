export const verifyToken = (req, res, next) => {
  console.log("Token verified");
  next();
};