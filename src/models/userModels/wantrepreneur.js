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
  yearsOfExperience: {
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

  spouseNameandOccupation: {
    type: String,
    required: true,
    maxlength: 150,
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
    yearsOfExperience: Joi.number().required().integer().min(0).max(100),
    educationalQualification: Joi.string().required().max(100),
    collegeStudied: Joi.string().required().max(100),
    maritalStatus: Joi.string()
      .valid(...MaritalStatus)
      .required(),
    spouseNameandOccupation: Joi.string().required().max(150),
    aadharId: Joi.string().required(),
  });
  return schema.validate(wantrepreneur);
}

const Wantrepreneur = mongoose.model("Wantrepreneur", wantrepreneurSchema);

export { Wantrepreneur, validateWantrepreneur };
