import express from "express";
import { Projects } from "../../models/projects/projectsModel.js";
import {
  ProjectRequest,
  validateProjectProgressMessage,
} from "../../models/projects/projectProgress.js";
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
      const { error } = validateProjectProgressMessage(req.body);
      if (error) {
        return res.status(400).json(formatError(error.details[0].message));
      }
      const { projectId, message } = req.body;
      // const { projectId } = req.body;
      // if (!projectId)
      //   return res.status(400).json(formatError("Enter a Valid Project Id"));

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
        projectId,
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
        projectId: projectId,
        status: "inprogress",
        message: message,
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
      const role = req.role;

      const projectDetails = await Projects.findById(projectId);

      const isAllowed = role !== "Student";

      res
        .status(200)
        .json(formatResponse({ allowed: isAllowed, project: projectDetails }));
    } catch (error) {
      res.status(500).json(formatError("Internal Server Error"));
    }
  }
);
// delete request

projectRouter.delete(
  "/user/project-requests/delete/:requestId",
  validTokenUserDetail,
  async (req, res) => {
    try {
      // Find the project request by ID
      const projectRequest = await ProjectRequest.findOne({
        userId: req.user,
        _id: req.params.requestId,
      });

      if (!projectRequest)
        return res.status(404).json(formatError("Project request not found"));

      await ProjectRequest.findByIdAndDelete(req.params.requestId);

      res
        .status(200)
        .json(formatResponse(null, "Project request deleted successfully"));
    } catch (error) {
      res.status(500).json(formatError(error.message));
    }
  }
);

// reports in admin for projects
projectRouter.post(
  "/report/:projectId",
  validTokenUserDetail,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user;

      const project = await Projects.findById(projectId);

      if (!project) {
        return res.status(404).json(formatError("Project not found"));
      }
      if (project.reportedBy.includes(userId)) {
        return res
          .status(400)
          .json(formatError("You have already reported this project"));
      }

      project.reportedBy.push(userId);
      project.reportCount++;

      await project.save();

      res
        .status(200)
        .json(formatResponse(null, "Project reported successfully"));
    } catch (error) {
      res.status(500).json(formatError(error.message));
    }
  }
);

// delete project
projectRouter.delete(
  "/user/projects/delete/:projectId",
  validTokenUserDetail,
  async (req, res) => {
    try {
      const project = await Projects.findOne({
        userId: req.user,
        _id: req.params.projectId,
      });

      if (!project)
        return res.status(404).json(formatError("Project not found"));

      await Projects.findByIdAndDelete(req.params.projectId);

      await ProjectRequest.deleteMany({
        projectId: req.params.projectId,
      });

      res
        .status(200)
        .json(formatResponse(null, "Project deleted successfully"));
    } catch (error) {
      res.status(500).json(formatError(error.message));
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

      const project = await Projects.findById(projectRequest.projectId);
      if (!project) {
        // Handle case where project is not found
        return res.status(404).json(formatError("Project not found"));
      }

      // Check if the userId was added to the funded array
      const isUserAdded = project.funded.includes(projectRequest.userId);

      if (isUserAdded) {
        return res
          .status(200)
          .json(formatError("User already funded the project"));
      }

      const updatedRequest = await ProjectRequest.findByIdAndUpdate(
        requestId,
        { status: "approved" },
        { new: true }
      );

      await Projects.findByIdAndUpdate(
        updatedRequest.projectId,
        {
          $addToSet: { funded: updatedRequest.userId },
        },
        { new: true }
      );

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

//  function to fetch project requests based on status
const fetchProjectRequests = async (req, res, status) => {
  try {
    if (req.role !== "admin")
      return res.status(403).json(formatError("Unauthorized"));

    const projectRequests = await ProjectRequest.aggregate([
      {
        $match: { status: status },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "projectDetails",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$userDetails", 0] },
          project: { $arrayElemAt: ["$projectDetails", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: 1,
            fullName: 1,
            dob: 1,
            role: 1,
            phoneNumber: 1,
          },
          project: {
            _id: 1,
            title: 1,
            sdg: 1,
            trl: 1,
            investmentRange: 1,
            description: 1,
          },
          status: 1,
        },
      },
    ]);

    res.status(200).json(projectRequests);
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
};

// Route to fetch inprogress project requests
projectRouter.get(
  "/admin/project-requests-inprogress",
  validTokenAdmin,
  async (req, res) => {
    await fetchProjectRequests(req, res, "inprogress");
  }
);

// Route to fetch approved project requests
projectRouter.get(
  "/admin/project-requests-approved",
  validTokenAdmin,
  async (req, res) => {
    await fetchProjectRequests(req, res, "approved");
  }
);

// Route to fetch declined project requests
projectRouter.get(
  "/admin/project-requests-declined",
  validTokenAdmin,
  async (req, res) => {
    await fetchProjectRequests(req, res, "declined");
  }
);

projectRouter.get(
  "/admin/projects-with-reports",
  validTokenAdmin,
  async (req, res) => {
    try {
      // Check if the requester is an admin
      if (req.role !== "admin")
        return res.status(403).json(formatError("Unauthorized"));

      // Aggregate to get projects with more than 2 reports
      const projectsWithReports = await Projects.aggregate([
        {
          $match: {
            reportCount: { $exists: true, $gte: 2 },
          },
        },
        {
          $sort: { reportCount: -1 }, // Sort in descending order based on reports count
        },
      ]);

      // Send the response
      res.status(200).json(projectsWithReports);
    } catch (error) {
      // Handle errors
      res.status(500).json(formatError(error.message));
    }
  }
);

projectRouter.delete(
  "/admin/project/:projectId",
  validTokenAdmin,
  async (req, res) => {
    try {
      if (req.role !== "admin")
        return res.status(403).json(formatError("Unauthorized"));

      const project = await Projects.findById(req.params.projectId);

      if (!project)
        return res.status(404).json(formatError("Project not found"));

      await Projects.findByIdAndDelete(req.params.projectId);
      await ProjectRequest.deleteMany({
        projectId: req.params.projectId,
      });
      res
        .status(200)
        .json(formatResponse(null, "Project deleted successfully"));
    } catch (error) {
      res.status(500).json(formatError(error.message));
    }
  }
);

export default projectRouter;
