import express from "express";
import { validTokenUserNumber } from "../../middleware/auth.middleware.js";
import {
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
} from "../../controllers/project.user.controllers.js";

const projectRouter = express.Router();

// Error Handling Middleware
projectRouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(formatError("Internal Server Error"));
});

// Create a new project
projectRouter.route("/project").post(validTokenUserNumber, createProject);

// Update a project
projectRouter
  .route("/project/:projectId")
  .put(validTokenUserNumber, updateProject);

//get all projects to display it
projectRouter.route("/getProjects").get(getallProjects);

// Express interest in a project
projectRouter
  .route("/express-interest")
  .post(validTokenUserNumber, expressIntrestOnProject);

// Get funded projects for the authenticated user
projectRouter
  .route("/funded-projects")
  .get(validTokenUserNumber, fundedProject);

// Get projects with request status for the authenticated user
projectRouter
  .route("/projects")
  .get(validTokenUserNumber, getProjectsWithRequests);

// Get extended project details
projectRouter
  .route("/project-extended/:projectId")
  .get(validTokenUserNumber, getProjectById);

// delete request
projectRouter
  .route("/user/project-requests/delete/:requestId")
  .delete(validTokenUserNumber, deleteProjectRequest);

// delete project
projectRouter
  .route("/user/projects/delete/:projectId")
  .delete(validTokenUserNumber, deleteProjectWithAllRequest);

// reports the projects
projectRouter
  .route("/report/:projectId")
  .post(validTokenUserNumber, repostProject);

export default projectRouter;
