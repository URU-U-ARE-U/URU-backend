import express from "express";
import { Projects } from "../../models/projects/projectsModel.js";
import { ProjectRequest } from "../../models/projects/projectProgress.js";
import { validTokenUserDetail } from "../../middleware/auth.js";
import { formatResponse, formatError } from "../../utils/response.js";
import { validateProjectInput } from "../../middleware/project.js";

const projectRouter = express.Router();

// Error Handling Middleware
projectRouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(formatError("Internal Server Error"));
});

// Need to Build a admin route
// function isAdmin(req, res, next) {
//   if (req.user && req.user.role === "admin") {
//     next();
//   } else {
//     res.status(403).json({ error: "Unauthorized" });
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
    try {
      const { projectId } = req.body;
      const userId = req.user;

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

// Approve a project investment request
projectRouter.put("/approve-request/:requestId", async (req, res) => {
  try {
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

    res.status(200).json(formatResponse(null, "Request approved successfully"));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

// Decline a project investment request
projectRouter.put("/decline-request/:requestId", async (req, res) => {
  try {
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

    res.status(200).json(formatResponse(null, "Request declined successfully"));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});
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

export default projectRouter;
