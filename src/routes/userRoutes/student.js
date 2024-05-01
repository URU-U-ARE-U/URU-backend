import express from "express";
import { validTokenUserDetail } from "../../middleware/auth.js";
import { Student, validateStudent } from "../../models/userModels/student.js";
import { UserDetails } from "../../models/userModels/userDetails.js";
import { formatError, formatResponse } from "../../utils/response.js";

const studentRouter = express.Router();

studentRouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(formatError("Internal Server Error"));
});

studentRouter.post("/student", validTokenUserDetail, async (req, res) => {
  try {
    // Validate the incoming request body
    const { error } = validateStudent(req.body);
    if (error) {
      return res.status(400).json(formatError(error.details[0].message));
    }

    const user = await UserDetails.findById(req.user);

    // Ensures the authenticated user has the "Student" tag
    if (!user || user.role !== "Student") {
      return res
        .status(403)
        .json(formatError("Access forbidden for this user"));
    }

    // Create a new Student document
    const studentDetails = new Student({
      userId: req.user,
      collegeName: req.body.collegeName,
      degree: req.body.degree,
      batch: req.body.batch,
      collegeLocation: req.body.collegeLocation,
      fatherName: req.body.fatherName,
      fatherOccupation: req.body.fatherOccupation,
      motherName: req.body.motherName,
      motherOccupation: req.body.motherOccupation,
      siblingName: req.body.siblingName,
      siblingOccupation: req.body.siblingOccupation,
      collegeId: req.body.collegeId,
    });

    await studentDetails.save();

    res.status(201).json(
      formatResponse(
        {
          fullName: user.fullName,
          tag: user.tag,
          profilePic: user.profilePic,
        },
        "Student details added successfully"
      )
    );
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

export { studentRouter };
