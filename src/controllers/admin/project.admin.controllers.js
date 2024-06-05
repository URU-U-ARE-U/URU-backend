import express from "express";
import mongoose from "mongoose";
import {
  Projects,
  validateProject,
} from "../../models/projects/projectsModel.js";
import {
  ProjectRequest,
  validateProjectProgressMessage,
} from "../../models/projects/projectProgress.js";
import { formatError, formatResponse } from "../../utils/response.js";
import { validTokenAdmin } from "../../middleware/admin.auth.middleware.js";
import { errorHandler } from "../auth.controllers.js";

const approveRequestForProjectAdmin = errorHandler(async (req, res) => {
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

    res.status(200).json(formatResponse(null, "Request approved successfully"));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

const declineRequestForProjectAdmin = errorHandler(async (req, res) => {
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

    res.status(200).json(formatResponse(null, "Request declined successfully"));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

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
          from: "usernumbers",
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
            phone: 1,
            email: 1,
            role: 1,
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

const getReportedProjects = errorHandler(async (req, res) => {
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
});

const deleteReportedProject = errorHandler(async (req, res) => {
  try {
    if (req.role !== "admin")
      return res.status(403).json(formatError("Unauthorized"));

    const project = await Projects.findById(req.params.projectId);

    if (!project) return res.status(404).json(formatError("Project not found"));

    await Projects.findByIdAndDelete(req.params.projectId);
    await ProjectRequest.deleteMany({
      projectId: req.params.projectId,
    });
    
    res.status(200).json(formatResponse(null, "Project deleted successfully"));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

export {
  approveRequestForProjectAdmin,
  declineRequestForProjectAdmin,
  fetchProjectRequests,
  getReportedProjects,
  deleteReportedProject,
};
