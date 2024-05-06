import express from "express";
import { Admin } from "../../models/userModels/admin.js";
import { formatError, formatResponse } from "../../utils/response.js";
import {
  validateAdminRegisterInput,
  validTokenAdmin,
} from "../../middleware/admin.js";
import { validTokenUserNumber } from "../../middleware/auth.js";
import jwt from "jsonwebtoken";

// levels of admin login

const adminRouter = express.Router();

adminRouter.get("/admin/username", validTokenUserNumber, async (req, res) => {
  const allUserName = await Admin.find().distinct("userName");
  res.status(200).json(formatResponse(allUserName));
});

adminRouter.post(
  "/admin/register",
  validTokenUserNumber,
  validateAdminRegisterInput,
  async (req, res) => {
    const userNumberId = req.user;
    try {
      const { userName } = req.body;

      const existingUserName = await Admin.findOne({
        userName: userName,
      });
      if (existingUserName) {
        return res.status(400).json(formatError("Choose another UserName!!!"));
      }
      const existingAdmin = await Admin.findOne({ userNumberId: userNumberId });
      if (existingAdmin) {
        return res
          .status(400)
          .json(formatResponse(null, "Admin Already Exists"));
      }

      const admin = new Admin({
        userName: userName,
        userNumberId: userNumberId,
      });
      const user = await admin.save();
      const token = jwt.sign(
        { id: user._id, role: "admin" }, //, username: userNumber.userName
        "passwordKey"
      );
      res.status(201).json(formatResponse(token, "Created Admin Successfully"));
    } catch (error) {
      res.status(500).json(formatError(error.message));
    }
  }
);

adminRouter.post(
  "/admin/signin",
  validateAdminRegisterInput,
  validTokenUserNumber,
  async (req, res) => {
    try {
      const { userName } = req.body;

      const admin = await Admin.findOne({ userName: userName });
      if (!admin) {
        return res.status(404).json(formatError("Admin Was Not Found"));
      }
      const token = jwt.sign({ id: admin._id, role: "admin" }, "passwordKey");

      res.status(200).json(formatResponse(token, "Logged In Successfull"));
    } catch (error) {
      console.log(error);
      res.status(500).json(formatError(error.message));
    }
  }
);

export { adminRouter };
