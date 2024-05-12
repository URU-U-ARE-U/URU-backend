import express from "express";
import jwt from "jsonwebtoken";
import {
  Community,
  validateCommunity,
} from "../../models/userModels/community.js";
import { validTokenUserNumber } from "../../middleware/auth.js";
import { formatError, formatResponse } from "../../utils/response.js";

const communityRouter = express.Router();

communityRouter.post("/community", validTokenUserNumber, async (req, res) => {
  const { error } = validateCommunity(req.body);
  if (error) return res.status(400).send(formatError(error.details[0].message));

  const community = new Community({
    role: req.role,
    fullName: req.body.fullName,
    dob: req.body.dob,
    loveAboutSelf: req.body.loveAboutSelf,
    philosophy: req.body.philosophy,
    phoneNumberId: req.user,
    phoneNumber: req.phone,
  });

  try {
    const profile = await community.save();
    const token = jwt.sign(
      { id: profile._id, role: profile.role },
      "passwordKey"
    );
    res
      .status(201)
      .json(formatResponse(token, "User details saved successfully"));
  } catch (error) {
    res.status(500).send(formatError(error.message));
  }
});

export default communityRouter;
