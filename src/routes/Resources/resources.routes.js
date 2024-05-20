import express from "express";
import { validTokenUserNumber } from "../../middleware/auth.middleware.js";
import { validTokenAdmin } from "../../middleware/admin.auth.middleware.js";
import {
  createResource,
  getAllResources,
  getResourceById,
  updateResourceById,
  deleteResourceById,
  savedResource,
  getSavedResourceById,
} from "../../controllers/resource.controller.js";
const resourcesRouter = express.Router();

resourcesRouter
  .route("/")
  .post(validTokenAdmin, createResource) // Create a new resource
  .get(validTokenUserNumber, getAllResources); // Get all resources card version

resourcesRouter
  .route("/:id")
  .get(validTokenUserNumber, getResourceById) // Get a single resource by ID
  .patch(validTokenAdmin, updateResourceById) // Update a resource by ID
  .delete(validTokenAdmin, deleteResourceById); // Delete a resource by ID

//SAVED RESOURCE ROUTES
resourcesRouter
  .route("/resourcesave")
  .post(validTokenUserNumber, savedResource)
  .get(validTokenUserNumber, getSavedResourceById);

export default resourcesRouter;
