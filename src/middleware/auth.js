import jwt from "jsonwebtoken";
import { UserNumber } from "../models/auth/userNumber.js";
import { UserDetails } from "../models/userModels/userDetails.js";

// check the token is valid and return the token with the id
const validTokenUserNumber = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const verifyToken = jwt.verify(token, "passwordKey");
    if (!verifyToken)
      return res.status(401).json({
        message: "Invalid Json Token",
      });
    const userNumber = await UserNumber.findById(verifyToken.id);
    if (!userNumber) return res.status(401).json({ message: "Invalid User" });
    req.user = verifyToken.id;
    req.token = token;
    req.phone = userNumber.phone;
    next();
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
    console.log("middleware");
  }
};

//check for the UserDetail Token is valid and retuns the token with id
const validTokenUserDetail = async (req, res, next) => {
  try {
    const token = req.header("x-auth-user");
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const verifyToken = jwt.verify(token, "passwordKey");
    if (!verifyToken)
      return res.status(401).json({
        message: "Invalid Json Token",
      });

    const userDetail = await UserDetails.findById(verifyToken.id);
    if (!userDetail) return res.status(401).json({ message: "Invalid User" });
    req.user = verifyToken.id;
    req.token = token;
    req.role = verifyToken.role;
    next();
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
    console.log("middleware");
  }
};

export { validTokenUserNumber, validTokenUserDetail };
