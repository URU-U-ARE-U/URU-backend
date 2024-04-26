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
  fatherName: {
    type: String,
    required: true,
    maxlength: 50,
  },
  fatherOccupation: {
    type: String,
    required: true,
    maxlength: 100,
  },
  motherName: {
    type: String,
    required: true,
    maxlength: 50,
  },
  motherOccupation: {
    type: String,
    required: true,
    maxlength: 100,
  },
  siblingName: {
    type: String,
    required: true,
  },
  siblingOccupation: {
    type: String,
    required: true,
    maxlength: 100,
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
    fatherName: Joi.string().required().max(50),
    fatherOccupation: Joi.string().required().max(100),
    motherName: Joi.string().required().max(50),
    motherOccupation: Joi.string().required().max(100),
    siblingName: Joi.string().required(),
    siblingOccupation: Joi.string().required().max(100),
    collegeId: Joi.string().required(),
  });

  return schema.validate(student);
}

const Student = mongoose.model("Students", studentSchema);

export { Student, validateStudent };
