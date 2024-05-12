import Joi from "joi";
import mongoose from "mongoose";

const projectRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserDetails",
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Projects",
  },
  message: {
    type: String,
    required: true,
    maxlength: 100,
  },
  status: {
    type: String,
    enum: ["approved", "declined", "inprogress", "FundingInProgress", "Funded"],
    default: "inprogress",
  },
});

// projectRequestSchema.pre("findOneAndUpdate", async function (next) {
//   const update = this.getUpdate();
// });

function validateObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function validateProjectProgressMessage(message) {
  const schema = Joi.object({
    projectId: Joi.string().custom(validateObjectId, "MongoDB ObjectId"),
    message: Joi.string().required().max(100),
  });
  return schema.validate(message);
}

const ProjectRequest = mongoose.model("ProjectRequest", projectRequestSchema);

export { ProjectRequest, validateProjectProgressMessage };
