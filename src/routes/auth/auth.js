import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { formatError, formatResponse } from "../../utils/response.js";
import { validTokenUserNumber } from "../../middleware/auth.js";
import {
  UserNumber,
  validateUserNumber,
} from "../../models/auth/userNumber.js";

import {
  sendOtpViaTwilio,
  generateOtp,
  generateOtpExiry,
  isValidIndianPhoneNumber,
} from "../../utils/authGenerators.js";

import { UserDetails } from "../../models/userModels/userDetails.js";

const authRouter = express.Router();

authRouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(formatError("Internal Server Error"));
});

// Create UserNumber
authRouter.post("/signup", async (req, res) => {
  try {
    const { error } = validateUserNumber(req.body);
    if (error) {
      res.status(400).json(formatError(error.details[0].message));
      return;
    }
    const { phone, email } = req.body;

    const existingUser = await UserNumber.findOne({ phone });
    if (existingUser) {
      return res.status(400).json(formatError("Phone number already exists"));
    }
    const existingEmail = await UserNumber.findOne({ email });
    if (existingEmail) {
      return res.status(400).json(formatError("EmailId already exists"));
    }

    const otp = generateOtp();
    const isExpiry = generateOtpExiry();

    const user = new UserNumber({ phone, email, otp, isExpiry }); //userName
    await user.save();

    sendOtpViaTwilio(phone, otp);

    res.status(201).json(formatResponse(null, "OTP sent successfully"));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

// Sign In Endpoint
authRouter.post("/signin", async (req, res) => {
  try {
    const { phone } = req.body;

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

//Verfication Endpoint
authRouter.post("/verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;

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

    // Check for expired OTP
    if (user.otpExpiry && user.otpExpiry < Date.now()) {
      return res.status(400).json(formatError("Invalid or expired OTP"));
    }

    if (!user.otp) {
      return res
        .status(400)
        .json(formatError("Invalid OTP verification setup")); // Handle missing hash case
    }

    const isValid = user.otp === otp; //  compareOtp

    if (!isValid) {
      return res.status(401).json(formatError("Incorrect OTP"));
    }

    const token = jwt.sign({ id: user._id }, "passwordKey");

    res.status(200).json(formatResponse(token, "Login successful"));

    // Clear used OTP after successful verification
    user.otp = null;
    await user.save();
  } catch (error) {
    console.error(error);
    res.status(500).json(formatError(error.message));
  }
});

authRouter.get("/userdetail/token", validTokenUserNumber, async (req, res) => {
  try {
    const userdetail = await UserDetails.findOne({ phoneNumberId: req.user });
    if (!userdetail) {
      return res.status(400).json(formatError("No UserDetails Exists"));
    }
    const token = jwt.sign(
      { id: userdetail._id, role: userdetail.role },
      "passwordKey"
    );

    res.status(200).json(formatResponse(token, "User details Token"));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

authRouter.post("/tokenIsValid", validTokenUserNumber, async (req, res) => {
  try {
    const id = req.user;
    const token = req.token;
    if (id && token) {
      return res.json(true);
    } else {
      return res.json(false);
    }
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

export { authRouter };

// authRouter.get("/username", async (req, res) => {
//   const allUserName = await UserNumber.find().distinct("userName");
//   res.status(200).json({ test: allUserName });
// });

//Check if userName already exists
// const existingUserName = await UserNumber.findOne({ userName });
// if (existingUserName) {
//   return res.status(400).json({ message: "Choose another UserName!!!" });
// }
