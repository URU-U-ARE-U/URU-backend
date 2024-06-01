import express from "express";
import mongoose from "mongoose";
import { Projects, validateProject } from "../models/projects/projectsModel.js";
import {
  ProjectRequest,
  validateProjectProgressMessage,
} from "../models/projects/projectProgress.js";
import { formatError, formatResponse } from "../utils/response.js";
import { validTokenAdmin } from "../middleware/admin.auth.middleware.js";
import { errorHandler } from "./auth.controllers.js";

const createProject = errorHandler(async (req, res) => {
  try {
    const { error } = validateProject(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const role = req.role;
    if (role === "Investor") {
      return res
        .status(400)
        .json(formatError("Investor Cannot Create Project"));
    }
    const project = new Projects({
      userId: req.user,
      ...req.body,
    });

    await project.save();

    res.status(201).json(formatResponse(null, "Project created successfully"));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

const updateProject = errorHandler(async (req, res) => {
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

    res.status(200).json(formatResponse(null, "Project updated successfully"));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

const expressIntrestOnProject = errorHandler(async (req, res) => {
  const userId = req.user;
  try {
    const { error } = validateProjectProgressMessage(req.body);
    if (error) {
      return res.status(400).json(formatError(error.details[0].message));
    }
    const { projectId, message } = req.body;

    if (req.role === "Student") {
      return res
        .status(403)
        .json(formatError("Access forbidden for this user"));
    }

    const projectExits = await Projects.findById(projectId);
    if (!projectExits) {
      return res
        .status(404)
        .json(formatError("Projects with this project Id dosen't exists "));
    }
    if (projectExits.userId == userId) {
      return res
        .status(400)
        .json(formatError("You can't express interest in your own project"));
    }
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
      .json(formatResponse(null, "Interest in project expressed successfully"));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

const fundedProject = errorHandler(async (req, res) => {
  try {
    const fundedProjects = await Projects.find({
      funded: { $exists: true, $not: { $size: 0 } },
      userId: req.user,
    });

    res.status(200).json(formatResponse(fundedProjects));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

const getProjectsWithRequests = errorHandler(async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user);

    const projectsWithRequests = await ProjectRequest.aggregate([
      {
        $match: { userId: userId },
      },
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "project",
        },
      },
      {
        $unwind: "$project",
      },
      {
        $project: {
          _id: "$project._id",
          name: "$project.title",
          description: "$project.description",
          sdg: "$project.sdg",
          trl: "$project.trl",
          investmentRange: "$project.investmentRange",
          images: "$project.images",
          status: "$status",
        },
      },
    ]);

    res.status(200).json(formatResponse(projectsWithRequests));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

const getProjectById = errorHandler(async (req, res) => {
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
});

const deleteProjectRequest = errorHandler(async (req, res) => {
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
});

const deleteProjectWithAllRequest = errorHandler(async (req, res) => {
  try {
    const project = await Projects.findOne({
      userId: req.user,
      _id: req.params.projectId,
    });

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

const repostProject = errorHandler(async (req, res) => {
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

    res.status(200).json(formatResponse(null, "Project reported successfully"));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

const getallProjects = errorHandler(async (req, res) => {
  try {
    const projects = await Projects.aggregate([
      {
        $match: {},
      },
      {
        $lookup: {
          from: "usernumbers",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: "$_id",
          name: "$title",
          publisherName: "$user.email",
          investmentRange: "$investmentRange",
          description: "description",
          sdg: "$sdg",
          trl: "$trl",
          image: { $arrayElemAt: ["$images", 0] },
        },
      },
    ]);
    res.status(200).json(formatResponse(projects));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

export {
  createProject,
  updateProject,
  expressIntrestOnProject,
  fundedProject,
  getProjectsWithRequests,
  getProjectById,
  deleteProjectRequest,
  deleteProjectWithAllRequest,
  repostProject,
  getallProjects,
};
