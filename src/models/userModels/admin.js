import Joi from "joi";
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  userNumberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserNumber",
    required: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
    minlength: 8,
    maxlength: 16,
  },
});

const Admin = mongoose.model("Admin", adminSchema);

function validateAdmin(admin) {
  const schema = Joi.object({
    userName: Joi.string().min(8).max(16).required(),
    adminCode: Joi.string().required(),
  });

  return schema.validate(admin);
}

export { Admin, validateAdmin };
