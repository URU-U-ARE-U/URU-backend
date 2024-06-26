import { errorHandler } from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import { formatError, formatResponse } from "../utils/response.js";
import {
  UserNumber,
  validateUserNumber,
  Roles,
} from "../models/auth/userNumber.js";

import {
  sendOtpViaTwilio,
  generateOtp,
  generateOtpExiry,
  isValidIndianPhoneNumber,
  generateToken,
} from "../utils/authGenerators.js";

const createUserDetails = errorHandler(async (req, res) => {
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

const LoginUser = errorHandler(async (req, res) => {
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
      user.otp = null;
    }

    const otp = generateOtp();

    user.otp = otp;
    user.otpExpiry = generateOtpExiry();
    await user.save();

    sendOtpViaTwilio(user.phone, user.otp);

    res.status(200).json(formatResponse(null, "OTP sent successfully"));
  } catch (error) {
    console.log(error);
    res.status(500).json(formatError(error.message));
  }
});

const verifyUser = errorHandler(async (req, res) => {
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

    const payload = { id: user._id };

    const token = generateToken(payload, process.env.SECRET_KEY);

    res.status(200).json(formatResponse(token, "Login successful"));

    // Clear used OTP after successful verification
    user.otp = null;
    await user.save();
  } catch (error) {
    console.error(error);
    res.status(500).json(formatError(error.message));
  }
});

const validTokenCheck = errorHandler(async (req, res) => {
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

const updateUserType = errorHandler(async (req, res) => {
  try {
    const { role } = req.body;

    const existingUser = await UserNumber.findById(req.user);
    if (existingUser.role) {
      return res
        .status(200)
        .json(formatResponse(null, "User role already assigned "));
    }

    if (!Roles.includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    const updatedUser = await UserNumber.findByIdAndUpdate(
      req.user,
      { role },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json(formatError("User not found"));
    }

    const payload = { id: updatedUser.id };
    const token = generateToken(payload, process.env.SECRET_KEY);

    res
      .status(200)
      .json(formatResponse(token, "User role updated successfully"));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

export {
  createUserDetails,
  LoginUser,
  verifyUser,
  validTokenCheck,
  errorHandler,
  updateUserType,
};
