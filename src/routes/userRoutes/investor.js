import express from "express";
import { validTokenUserDetail } from "../../middleware/auth.middleware.js";
import {
  Investor,
  validateInvestor,
} from "../../models/userModels/investor.js";
import { UserDetails } from "../../models/userModels/userDetails.js";
import { formatResponse } from "../../utils/response.js";

const investorRouter = express.Router();

investorRouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(formatError("Internal Server Error"));
});

investorRouter.post("/investor", validTokenUserDetail, async (req, res) => {
  try {
    const { error } = validateInvestor(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const user = await UserDetails.findById(req.user);
    // Ensures the authenticated user has the "Investor" tag
    if (!user || user.role !== "Investor") {
      return res
        .status(403)
        .json({ message: "Access forbidden for this user" });
    }

    const newInvestor = new Investor({
      userId: req.user,
      maritalStatus: req.body.maritalStatus,
      nationality: req.body.nationality,
      currentOrganizationName: req.body.currentOrganizationName,
      currentDesignation: req.body.currentDesignation,
      yearsOfExperienceInInvesting: req.body.yearsOfExperienceInInvesting,
      educationalQualification: req.body.educationalQualification,
      investmentRange: req.body.investmentRange,
      aadharId: req.body.aadharId,
    });

    await newInvestor.save();
    res.status(201).json(
      formatResponse(
        {
          fullName: user.fullName,
          tag: user.tag,
          profilePic: user.profilePic,
        },
        "Investor details added successfully"
      )
    );
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

export { investorRouter };
