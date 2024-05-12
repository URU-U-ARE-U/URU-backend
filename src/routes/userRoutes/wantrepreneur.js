import express from "express";
import { validTokenUserDetail } from "../../middleware/auth.js";
import {
  Wantrepreneur,
  validateWantrepreneur,
} from "../../models/userModels/wantrepreneur.js";
import { UserDetails } from "../../models/userModels/userDetails.js";
import { formatError, formatResponse } from "../../utils/response.js";

const wantrepreneurRouter = express.Router();

wantrepreneurRouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(formatError("Internal Server Error"));
});

wantrepreneurRouter.post(
  "/wantrepreneur",
  validTokenUserDetail,
  async (req, res) => {
    try {
      // Validate the incoming request body
      const { error } = validateWantrepreneur(req.body);

      if (error) {
        return res.status(400).json(formatError(error.details[0].message));
      }

      const user = await UserDetails.findById(req.user);
      // Ensures the authenticated user has the "Wantrepreneur" tag
      if (!user || user.role !== "Wantrepreneur") {
        return res
          .status(403)
          .json(formatError("Access forbidden for this user"));
      }

      // Create a new Wantrepreneur document
      const newWantrepreneur = new Wantrepreneur({
        userId: req.user,
        currentOrganization: req.body.currentOrganization,
        currentDesignation: req.body.currentDesignation,
        yearsOfExperience: req.body.yearsOfExperience,
        educationalQualification: req.body.educationalQualification,
        collegeStudied: req.body.collegeStudied,
        maritalStatus: req.body.maritalStatus,
        spouseNameandOccupation: req.body.spouseNameandOccupation,
        aadharId: req.body.aadharId,
      });

      // Save the Wantrepreneur details to the database
      await newWantrepreneur.save();

      // Respond with success message
      res.status(201).json(
        formatResponse(
          {
            fullName: user.fullName,
            tag: user.tag,
            profilePic: user.profilePic,
          },
          "Wantrepreneur details added successfully"
        )
      );
    } catch (error) {
      res.status(500).json(formatError(error.message));
    }
  }
);

export { wantrepreneurRouter };
