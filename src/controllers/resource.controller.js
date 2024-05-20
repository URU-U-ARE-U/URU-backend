import express from "express";
import mongoose from "mongoose";
import {
  Resource,
  validateResource,
  ResourceSaved,
} from "../models/Resources/resources.js";
import { formatError, formatResponse } from "../utils/response.js";
import { errorHandler } from "../utils/ErrorHandler.js";

const createResource = errorHandler(async (req, res) => {
  const { error } = validateResource(req.body);
  if (error) return res.status(400).send(formatError(error.details[0].message));

  try {
    let resource = new Resource(req.body);
    resource = await resource.save();
    res.send(formatResponse(resource));
  } catch (err) {
    res.status(500).send(formatError(err.message));
  }
});

const getAllResources = errorHandler(async (req, res) => {
  try {
    const resources = await Resource.find().select(
      "description verified email state district name resourceType contactPerson.phoneNumber"
    );
    res.send(formatResponse(resources));
  } catch (err) {
    res.status(500).send(formatError(err.message));
  }
});
const getResourceById = errorHandler(async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource)
      return res.status(404).send(formatError("Resource not found"));
    res.send(formatResponse(resource));
  } catch (err) {
    res.status(500).send(formatError(err.message));
  }
});
const updateResourceById = errorHandler(async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!resource)
      return res.status(404).send(formatError("Resource not found"));
    res.send(formatResponse(resource));
  } catch (err) {
    res.status(500).send(formatError(err.message));
  }
});

const deleteResourceById = errorHandler(async (req, res) => {
  try {
    const resource = await Resource.findByIdAndRemove(req.params.id);
    if (!resource)
      return res.status(404).send(formatError("Resource not found"));
    res.send(formatResponse(resource));
  } catch (err) {
    res.status(500).send(formatError(err.message));
  }
});

const savedResource = errorHandler(async (req, res) => {
  try {
    const { resourceId } = req.body;

    const resourceSaved = new ResourceSaved({
      resourceId,
      userId: req.user,
    });

    await resourceSaved.save();

    res.status(201).send(formatResponse("Saved Successfully"));
  } catch (error) {
    res.status(500).send(formatError(err.message));
  }
});

const getSavedResourceById = errorHandler(async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user);

    const resourcesSaved = await ResourceSaved.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: "resources",
          localField: "resourceId",
          foreignField: "_id",
          as: "resourceDetails",
        },
      },
      { $unwind: "$resourceDetails" },
      {
        $project: {
          _id: 1,
          userId: 1,
          "resourceDetails.description": 1,
          "resourceDetails.verified": 1,
          "resourceDetails.email": 1,
          "resourceDetails.state": 1,
          "resourceDetails.district": 1,
          "resourceDetails.name": 1,
          "resourceDetails.resourceType": 1,
          "resourceDetails.contactPerson.phoneNumber": 1,
        },
      },
    ]);

    res.status(200).send(resourcesSaved);
  } catch (error) {
    res.status(500).send(error);
  }
});
export {
  createResource,
  getAllResources,
  getResourceById,
  updateResourceById,
  deleteResourceById,
  savedResource,
  getSavedResourceById,
};
