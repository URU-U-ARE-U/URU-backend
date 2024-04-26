import Joi from "joi";
import mongoose from "mongoose";

const MaritalStatus = ["Single", "Married", "Divorced"];

const investorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserDetails",
  },
  maritalStatus: {
    type: String,
    required: true,
    enum: MaritalStatus,
  },
  nationality: {
    type: String,
    required: true,
    maxlength: 50,
  },
  currentOrganizationName: {
    type: String,
    required: true,
    maxlength: 100,
  },
  currentDesignation: {
    type: String,
    required: true,
    maxlength: 100,
  },
  yearsOfExperienceInInvesting: {
    type: Number,
    required: true,
    max: 100,
  },
  educationalQualification: {
    type: String,
    required: true,
    maxlength: 100,
  },
  investmentRange: {
    type: Number,
    required: true,
  },
  aadharId: {
    type: String,
    required: true,
  },
});

const Investor = mongoose.model("Investors", investorSchema);

function validateInvestor(investor) {
  const schema = Joi.object({
    // userId: Joi.string()
    //   .regex(/^[0-9a-fA-F]{24}$/)
    //   .required(),
    maritalStatus: Joi.string().valid("Single", "Married").required(),
    nationality: Joi.string().required().max(50),
    currentOrganizationName: Joi.string().required().max(100),
    currentDesignation: Joi.string().required().max(100),
    yearsOfExperienceInInvesting: Joi.number()
      .required()
      .integer()
      .min(0)
      .max(100),
    educationalQualification: Joi.string().required().max(100),
    investmentRange: Joi.number().required().min(0),
    aadharId: Joi.string().required(),
  });

  return schema.validate(investor);
}

export { Investor, validateInvestor };
