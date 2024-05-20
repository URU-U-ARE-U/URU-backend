import Joi from "joi";
import mongoose from "mongoose";

const projectRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserNumber",
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Projects",
  },
});

function validateObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function validateSavedProject(message) {
  const schema = Joi.object({
    projectId: Joi.string().custom(validateObjectId, "MongoDB ObjectId"),
  });
  return schema.validate(message);
}

const SavedProjects = mongoose.model("SavedProject", projectRequestSchema);

export { SavedProjects, validateSavedProject };
