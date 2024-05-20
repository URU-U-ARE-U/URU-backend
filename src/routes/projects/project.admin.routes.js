import express from "express";
import {
  approveRequestForProjectAdmin,
  declineRequestForProjectAdmin,
  fetchProjectRequests,
  getReportedProjects,
  deleteReportedProject,
} from "../../controllers/admin/project.admin.controllers.js";
import { validTokenAdmin } from "../../middleware/admin.auth.middleware.js";
const adminprojectRouter = express.Router();
//ADMIN

// Approve a project investment request
adminprojectRouter
  .route("/approve-request/:requestId")
  .put(validTokenAdmin, approveRequestForProjectAdmin);

// Decline a project investment request
adminprojectRouter
  .route("/decline-request/:requestId")
  .put(validTokenAdmin, declineRequestForProjectAdmin);

// Route to fetch inprogress project requests
adminprojectRouter.get(
  "/admin/project-requests-inprogress",
  validTokenAdmin,
  async (req, res) => {
    await fetchProjectRequests(req, res, "inprogress");
  }
);

// Route to fetch approved project requests
adminprojectRouter.get(
  "/admin/project-requests-approved",
  validTokenAdmin,
  async (req, res) => {
    await fetchProjectRequests(req, res, "approved");
  }
);

// Route to fetch declined project requests
adminprojectRouter.get(
  "/admin/project-requests-declined",
  validTokenAdmin,
  async (req, res) => {
    await fetchProjectRequests(req, res, "declined");
  }
);

adminprojectRouter
  .route("/admin/projects-with-reports")
  .get(validTokenAdmin, getReportedProjects);

adminprojectRouter
  .route("/admin/project/:projectId")
  .delete(validTokenAdmin, deleteReportedProject);

// function isAdmin(req, res, next) {
//   if (req.user && req.user.role === "admin") {
//     next();
//   } else {
//     console.log("unauth");
//     res.status(403).json(formatError("Unauthorized"));
//   }
// }
export default adminprojectRouter;
