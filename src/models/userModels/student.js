import mongoose from "mongoose";
import { UserDetails } from "./userDetails.js";
import Joi from "joi";

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserDetails",
  },
  collegeName: {
    type: String,
    required: true,
    maxlength: 50,
  },
  degree: {
    type: String,
    required: true,
    maxlength: 100,
  },
  batch: {
    type: String,
    required: true,
    maxlength: 15,
  },
  collegeLocation: {
    type: String,
    required: true,
    maxlength: 200,
  },

  fatherNameandOccupation: {
    type: String,
    required: true,
    maxlength: 200,
  },

  motherNameandOccupation: {
    type: String,
    required: true,
    maxlength: 200,
  },

  siblingNameandOccupation: {
    type: [
      {
        type: String,
        required: true,
        maxlength: 200,
      },
    ],
    required: true,
  },

  collegeId: {
    type: String,
    required: true,
  },
});

function validateStudent(student) {
  const schema = Joi.object({
    collegeName: Joi.string().required().max(50),
    degree: Joi.string().required().max(100),
    batch: Joi.string().required().max(15),
    collegeLocation: Joi.string().required().max(200),
    fatherNameandOccupation: Joi.string().required().max(200),
    motherNameandOccupation: Joi.string().required().max(200),
    siblingNameandOccupation: Joi.string().required().max(200),
    collegeId: Joi.string().required(),
  });

  return schema.validate(student);
}

const Student = mongoose.model("Students", studentSchema);

export { Student, validateStudent };
