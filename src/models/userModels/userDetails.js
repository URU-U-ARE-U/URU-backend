import mongoose from "mongoose";
import Joi from "joi";

const discriminatorOptions = {
  discriminatorKey: "kind",
};

const Diversity = [
  "Male",
  "Female",
  "PhysicallyChallenged",
  "LGBTQCommunity",
  "FirstGeneration",
  "RuralBackground",
  "ForeignReturn",
];

const Zodiac = [
  "Mesham",
  "Rishabam",
  "Mithunam",
  "Kadagam",
  "Simmam",
  "Kanni",
  "Thulam",
  "Viruchigam",
  "Dhanusu",
  "Magaram",
  "Kumbam",
  "Meenam",
];

const Roles = ["Student", "Wantrepreneur", "Investor"];

const userDetailSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: Roles,
    },
    profilePic: {
      type: String,
      required: true,
    },
    phoneNumberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserNumber",
    },
    fullName: {
      type: String,
      required: true,
      maxlength: 100,
    },
    dob: {
      type: Date,
      required: true,
    },
    philosophy: {
      type: String,
      required: true,
      maxlength: 150,
    },
    loveAboutYourSelf: {
      type: String,
      required: true,
      maxlength: 150,
    },
    diversity: {
      type: String,
      required: true,
      enum: Diversity,
    },
    zodiac: {
      type: String,
      required: true,
      enum: Zodiac,
    },

    Native: {
      type: String,
      required: true,
      maxlength: 150,
    },
  },
  discriminatorOptions
);

const UserDetails = mongoose.model("UserDetails", userDetailSchema);

function validateUserDetails(userDetail) {
  const schema = Joi.object({
    role: Joi.string()
      .required()
      .valid(...Roles),
    profilePic: Joi.string().required(),
    fullName: Joi.string().required().max(100),
    dob: Joi.date().iso().required(),
    philosophy: Joi.string().required().max(150),
    loveAboutYourSelf: Joi.string().required().max(150),
    diversity: Joi.string()
      .required()
      .valid(...Diversity),
    zodiac: Joi.string()
      .required()
      .valid(...Zodiac),

    Native: Joi.string().required().max(150),
  });
  return schema.validate(userDetail);
}

export { UserDetails, validateUserDetails };
