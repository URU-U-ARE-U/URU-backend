import { Admin, validateAdmin } from "../models/userModels/admin.js";
import bcrypt from "bcrypt";
import { formatError } from "../utils/response.js";
import jwt from "jsonwebtoken";

async function validateAdminRegisterInput(req, res, next) {
  try {
    const { error } = validateAdmin(req.body);
    if (error) {
      return res.status(400).json(formatError(error.details[0].message));
    }

    const { adminCode } = req.body;
    if (!adminCode) {
      return res.status(400).json(formatError("No Admin Code Present"));
    }

    const hashedAdminCode =
      "$2b$10$CzTaBHg96JXzgymDoC3niOJ3ZIwnWlEemmUZhxRbVrZCHsvfuZJ6.";

    const isValidAdminCode = await bcrypt.compare(adminCode, hashedAdminCode);

    if (isValidAdminCode) {
      next();
    } else {
      return res.status(401).json(formatError("Invalid Admin Code"));
    }
  } catch (error) {
    return res.status(500).json(formatError(error.message));
  }
}

const validTokenAdmin = async (req, res, next) => {
  try {
    const token = req.header("x-auth-admin");
    if (!token) {
      return res.status(401).json(formatError("Unauthorized"));
    }
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    if (!verifyToken)
      return res.status(401).json(formatError("Invalid Json Token"));
    const userNumber = await Admin.findById(verifyToken.id);
    if (!userNumber) return res.status(401).json(formatError("Invalid User"));
    req.user = verifyToken.id;
    req.token = token;
    req.role = verifyToken.role;
    next();
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
};

export { validateAdminRegisterInput, validTokenAdmin };
