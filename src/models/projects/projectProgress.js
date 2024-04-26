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
  status: {
    type: String,
    enum: ["approved", "declined", "inprogress"],
    default: "inprogress",
  },
});

// projectRequestSchema.pre("findOneAndUpdate", async function (next) {
//   const update = this.getUpdate();
// });

const ProjectRequest = mongoose.model("ProjectRequest", projectRequestSchema);

export { ProjectRequest };
