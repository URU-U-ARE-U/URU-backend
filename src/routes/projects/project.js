import express from "express";
import { Projects } from "../../models/projects/projectsModel.js";
import { ProjectRequest } from "../../models/projects/projectProgress.js";
import { validTokenUserDetail } from "../../middleware/auth.js";
import { formatResponse, formatError } from "../../utils/response.js";
import { validateProjectInput } from "../../middleware/project.js";
import { validTokenAdmin } from "../../middleware/admin.js";
import { UserDetails } from "../../models/userModels/userDetails.js";
import { UserNumber } from "../../models/auth/userNumber.js";

const projectRouter = express.Router();

// Error Handling Middleware
projectRouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(formatError("Internal Server Error"));
});

// function isAdmin(req, res, next) {
//   if (req.user && req.user.role === "admin") {
//     next();
//   } else {
//     console.log("unauth");
//     res.status(403).json(formatError("Unauthorized"));
//   }
// }

// Create a new project
projectRouter.post(
  "/project",
  validTokenUserDetail,
  validateProjectInput,
  async (req, res) => {
    try {
      const project = new Projects({
        userId: req.user,
        ...req.body,
      });

      await project.save();

      res
        .status(201)
        .json(formatResponse(null, "Project created successfully"));
    } catch (error) {
      res.status(500).json(formatError(error.message));
    }
  }
);

// Update a project
projectRouter.put(
  "/project/:projectId",
  validTokenUserDetail,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user;

      // Check if the project exists and belongs to the authenticated user
      const project = await Projects.findOne({ _id: projectId, userId });
      if (!project) {
        return res.status(404).json(formatError("Project not found"));
      }

      // Update project fields based on request body
      Object.assign(project, req.body);

      // Save the updated project
      await project.save();

      res
        .status(200)
        .json(formatResponse(null, "Project updated successfully"));
    } catch (error) {
      res.status(500).json(formatError(error.message));
    }
  }
);

// Express interest in a project
projectRouter.post(
  "/express-interest",
  validTokenUserDetail,
  async (req, res) => {
    const userId = req.user;
    try {
      const { projectId } = req.body;
      if (!projectId)
        return res.status(400).json(formatError("Enter a Valid Project Id"));

      // if (req.role === "Student") {
      //   return res
      //     .status(403)
      //     .json(formatError("Access forbidden for this user"));
      // }

      const projectExits = await Projects.findById(projectId);
      if (!projectExits)
        return res
          .status(404)
          .json(formatError("Projects with this project Id dosen't exists "));
      const requestExists = await ProjectRequest.findOne({
        userId: userId,
        projectId: projectId,
      });

      if (requestExists)
        return res
          .status(400)
          .json(formatError("Project Intrest Already Submitted"));

      const hasFunded = await Projects.exists({
        _id: projectId,
        funded: userId,
      });
      if (hasFunded) {
        return res
          .status(400)
          .json(formatError("User has already funded this project"));
      }

      const newProjectRequest = new ProjectRequest({
        userId,
        projectId,
        status: "inprogress",
      });

      await newProjectRequest.save();

      res
        .status(201)
        .json(
          formatResponse(null, "Interest in project expressed successfully")
        );
    } catch (error) {
      res.status(500).json(formatError(error.message));
    }
  }
);

// Get funded projects for the authenticated user
projectRouter.get(
  "/funded-projects",
  validTokenUserDetail,
  async (req, res) => {
    try {
      const fundedProjects = await Projects.find({
        funded: { $exists: true, $not: { $size: 0 } },
        userId: req.user,
      });

      res.status(200).json(formatResponse(fundedProjects));
    } catch (error) {
      res.status(500).json(formatError(error.message));
    }
  }
);

// Get projects with request status for the authenticated user
projectRouter.get("/projects", validTokenUserDetail, async (req, res) => {
  try {
    const allProjects = await Projects.find();

    const userRequests = await ProjectRequest.find({
      userId: req.user,
    }).populate({
      path: "projectId",
      select: "title sdg trl investmentRange description images",
    });

    const projectRequestMap = {};
    userRequests.forEach((request) => {
      projectRequestMap[request.projectId._id.toString()] = request.status;
    });

    const projectsWithRequests = allProjects.map((project) => ({
      _id: project._id,
      name: project.title,
      description: project.description,
      sdg: project.sdg,
      trl: project.trl,
      investmentRange: project.investmentRange,
      images: project.images,
      status: projectRequestMap[project._id.toString()] || "NONE",
    }));

    res.status(200).json(formatResponse(projectsWithRequests));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

// Get extended project details
projectRouter.get(
  "/project-extended/:projectId",
  validTokenUserDetail,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const role = req.role; // Assuming role is retrieved from auth middleware

      const projectDetails = await Projects.findById(projectId);

      const isAllowed = role !== "Student"; // Check if user is not a student

      res
        .status(200)
        .json(formatResponse({ allowed: isAllowed, project: projectDetails }));
    } catch (error) {
      res.status(500).json(formatError("Internal Server Error"));
    }
  }
);

//ADMIN

// Approve a project investment request
projectRouter.put(
  "/approve-request/:requestId",
  validTokenAdmin,
  async (req, res) => {
    try {
      if (req.role !== "admin")
        return res.status(403).json(formatError("Unauthorized"));
      const { requestId } = req.params;
      const projectRequest = await ProjectRequest.findById(requestId);
      if (!projectRequest) {
        return res.status(404).json(formatError("Project request not found"));
      }

      const updatedRequest = await ProjectRequest.findByIdAndUpdate(
        requestId,
        { status: "approved" },
        { new: true }
      );

      const project = await Projects.findByIdAndUpdate(
        updatedRequest.projectId,
        {
          $addToSet: { funded: updatedRequest.userId },
        },
        { new: true }
      );

      if (!project) {
        // Handle case where project is not found
        return res.status(404).json({ error: "Project not found" });
      }

      // // Check if the userId was added to the funded array
      // const isUserAdded = project.funded.includes(updatedRequest.userId);

      // if (isUserAdded) {
      //   res
      //     .status(200)
      //     .json(formatResponse(null, "User already funded the project"));
      // } else {
      //   res
      //     .status(200)
      //     .json(formatResponse(null, "User funded the project successfully"));
      // }
      // const io = getIo();

      // // Emit a targeted Socket.io event to the project publisher
      // io.to(project.userId).emit("requestApproved", {
      //   requestId: updatedRequest._id,
      //   projectId: updatedRequest.projectId,
      //   projectName: project.title,
      //   userId: updatedRequest.userId,
      // });

      res
        .status(200)
        .json(formatResponse(null, "Request approved successfully"));
    } catch (error) {
      res.status(500).json(formatError(error.message));
    }
  }
);

// Decline a project investment request
projectRouter.put(
  "/decline-request/:requestId",
  validTokenAdmin,

  async (req, res) => {
    try {
      if (req.role !== "admin")
        return res.status(403).json(formatError("Unauthorized"));
      const { requestId } = req.params;

      const projectRequest = await ProjectRequest.findById(requestId);

      if (!projectRequest) {
        return res.status(404).json(formatError("Project request not found"));
      }
      if (projectRequest.status === "approved") {
        await Projects.findByIdAndUpdate(projectRequest.projectId, {
          $pull: { funded: projectRequest.userId },
        });

        await ProjectRequest.findByIdAndUpdate(
          requestId,
          { status: "declined" },
          { new: true }
        );
      }

      res
        .status(200)
        .json(formatResponse(null, "Request declined successfully"));
    } catch (error) {
      res.status(500).json(formatError(error.message));
    }
  }
);
// .populate({
//   path: "projectId",
//   select: "title sdg trl investmentRange description images",
// })

projectRouter.get(
  "/admin/project-requests",
  validTokenAdmin,
  async (req, res) => {
    try {
      if (req.role !== "admin")
        return res.status(403).json(formatError("Unauthorized"));

      const projectRequests = await ProjectRequest.find()
        .populate({
          path: "projectId",
          select: "title sdg trl investmentRange description",
        })
        .populate({
          path: "userId",
          select: "fullName dob role phoneNumberId",
        })
        .exec(); // Execute population query

      // Extract userIds to fetch UserNumbers
      const userIds = projectRequests.map(
        (request) => request.userId.phoneNumberId
      );

      // Fetch UserNumbers for the userIds
      const userNumbers = await UserNumber.find({ _id: { $in: userIds } });

      // Create a map of userId to phoneNumber for easy access
      const userIdToPhoneMap = {};
      userNumbers.forEach((userNumber) => {
        userIdToPhoneMap[userNumber._id.toString()] = userNumber.phone;
      });

      // Add phoneNumber property to each projectRequests object
      projectRequests.forEach((request) => {
        const phoneNumber = userIdToPhoneMap[request.userId.phoneNumberId];
        if (phoneNumber) {
          // Add phoneNumber property to projectRequests object
          request.phoneNumber = phoneNumber;
        }
      });

      res.status(200).json(projectRequests);
    } catch (error) {
      res.status(500).json(formatError(error.message));
    }
  }
);

projectRouter.get(
  "/admi/project-requests",
  validTokenAdmin,
  async (req, res) => {
    try {
      if (req.role !== "admin")
        return res.status(403).json(formatError("Unauthorized"));

      const projectRequests = await ProjectRequest.find()
        .populate({
          path: "projectId",
          select: "title sdg trl investmentRange description ",
        })
        .populate({
          path: "userId",
          select: "fullName dob role phoneNumberId",
        })
        .exec(); // Execute population query

      const userIds = projectRequests.map(
        (request) => request.userId.phoneNumberId
      );

      const userNumbers = await UserNumber.find({ _id: { $in: userIds } });
      console.log(userNumbers);
      const userIdToPhoneMap = {};
      userNumbers.forEach((userNumber) => {
        userIdToPhoneMap[userNumber._id.toString()] = userNumber.phone;
      });
      projectRequests.forEach(async (request) => {
        const phoneNumber = await userIdToPhoneMap[
          request.userId.phoneNumberId
        ];
        if (phoneNumber) {
          // Add phone number directly to the projectRequests object
          request.userId.phone = phoneNumber;
        }
      });

      // projectRequests.forEach((request) => {
      //   const userNumber = userNumbers.find((num) =>
      //     num._id.equals(request.userId.phoneNumberId)
      //   );
      //   if (userNumber) {
      //     request.phone = userNumber.phone;
      //     console.log(request.phone);
      //   }
      // });

      res.status(200).json(projectRequests);
    } catch (error) {
      res.status(500).json(formatError(error.message));
    }
  }
);

//delete

export default projectRouter;
