import express from "express";
import { Admin } from "../../models/userModels/admin.js";
import { formatError, formatResponse } from "../../utils/response.js";
import {
  validateAdminRegisterInput,
  validTokenAdmin,
} from "../../middleware/admin.js";
import { validTokenUserNumber } from "../../middleware/auth.js";
import { UserNumber } from "../../models/auth/userNumber.js";

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
      const existingAdmin = await Admin.find({ userNumberId: userNumberId });
      if (existingAdmin) {
        return res
          .status(400)
          .json(formatResponse(null, "Admin Already Exists"));
      }

      const { userName } = req.body;
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

authRouter.post("/signin", validTokenAdmin, async (req, res) => {
  try {
    const { userName, adminCode } = req.body;

    const validNumber = isValidIndianPhoneNumber(phone);

    if (!validNumber) {
      return res
        .status(400)
        .json(
          formatError(
            "The phone number you entered is invalid. Please enter a valid Indian phone number (starting with +91 and 10 digits long)."
          )
        );
    }

    const user = await UserNumber.findOne({ phone });
    if (!user) {
      return res.status(404).json(formatError("Phone number not found"));
    }

    if (user.otpExpiry && user.otpExpiry < Date.now()) {
      user.otp = null; // Clear expired OTP
    }

    const otp = generateOtp();

    user.otp = otp;
    user.otpExpiry = generateOtpExiry(); // Expires in 30 minutes
    await user.save();

    sendOtpViaTwilio(user.phone, user.otp);

    res.status(200).json(formatResponse(null, "OTP sent successfully"));
  } catch (error) {
    console.log(error);
    res.status(500).json(formatError(error.message));
  }
});

export { adminRouter };
