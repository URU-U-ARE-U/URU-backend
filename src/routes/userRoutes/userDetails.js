import express from "express";
import { validTokenUserNumber } from "../../middleware/auth.js";
import {
  UserDetails,
  validateUserDetails,
} from "../../models/userModels/userDetails.js";
import jwt from "jsonwebtoken";
import { formatError, formatResponse } from "../../utils/response.js";

const userDetailsRouter = express.Router();

userDetailsRouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(formatError("Internal Server Error"));
});

userDetailsRouter.post(
  "/userdetails",
  validTokenUserNumber,
  async (req, res) => {
    try {
      const { error } = validateUserDetails(req.body);
      if (error) {
        return res.status(400).json(formatError(error.details[0].message));
      }

      const userId = req.user;

      const existingUser = await UserDetails.findOne({ phoneNumberId: userId });
      if (existingUser) {
        return res.status(400).json(formatError("User details already exist"));
      }
      // const userNumber = await UserNumber.findById(userId);

      const userDetails = new UserDetails({
        profilePic: req.body.profilePic,
        role: req.body.role,
        phoneNumberId: userId,
        fullName: req.body.fullName,
        dob: req.body.dob,
        philosophy: req.body.philosophy,
        loveAboutYourSelf: req.body.loveAboutYourSelf,
        diversity: req.body.diversity,
        zodiac: req.body.zodiac,
        profilePhoto: req.body.profilePhoto,
        Native: req.body.Native,
      });

      const user = await userDetails.save();
      const token = jwt.sign(
        { id: user._id, role: user.role }, //, username: userNumber.userName
        "passwordKey"
      );

      res
        .status(201)
        .json(formatResponse(token, "User details saved successfully"));
    } catch (error) {
      res.status(500).json(formatError(error.message));
    }
  }
);

export { userDetailsRouter };
