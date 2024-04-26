import mongoose from "mongoose";
import Joi from "joi";

const MaritalStatus = ["Single", "Married", "Divorced"];

const wantrepreneurSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserDetails",
  },
  currentOrganization: {
    type: String,
    required: true,
    maxlength: 50,
  },
  currentDesignation: {
    type: String,
    required: true,
    maxlength: 50,
  },
  yearsExperience: {
    type: Number,
    required: true,
    max: 100,
  },
  educationalQualification: {
    type: String,
    required: true,
    maxlength: 100,
  },
  collegeStudied: {
    type: String,
    required: true,
    maxlength: 100,
  },
  maritalStatus: {
    type: String,
    required: true,
    enum: MaritalStatus,
  },

  spouseName: {
    type: String,
    required: true,
    maxlength: 50,
  },
  spouseOccupation: {
    type: String,
    required: true,
    maxlength: 100,
  },
  aadharId: {
    type: String,
    required: true,
  },
});

function validateWantrepreneur(wantrepreneur) {
  const schema = Joi.object({
    currentOrganization: Joi.string().required().max(50),
    currentDesignation: Joi.string().required().max(50),
    yearsExperience: Joi.number().required().integer().min(0).max(100),
    educationalQualification: Joi.string().required().max(100),
    collegeStudied: Joi.string().required().max(100),
    maritalStatus: Joi.string()
      .valid(...MaritalStatus)
      .required(),
    spouseName: Joi.string().required().max(50),
    spouseOccupation: Joi.string().required().max(100),
    aadharId: Joi.string().required(),
  });
  return schema.validate(wantrepreneur);
}

const Wantrepreneur = mongoose.model("Wantrepreneur", wantrepreneurSchema);

export { Wantrepreneur, validateWantrepreneur };
