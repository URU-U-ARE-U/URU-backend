import mongoose from "mongoose";
import Joi from "joi";

const Diversity = [
  "Male",
  "Female",
  "PhysicallyChallenged",
  "LGBTQCommunity",
  "FirstGeneration",
  "RuralBackground",
  "ForeignReturn",
];

// eng
const Zodiac = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const Roles = ["Student", "Wantrepreneur", "Investor"];

const userDetailSchema = new mongoose.Schema({
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
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\+91\d{10}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  //min 3
  fullName: {
    type: String,
    required: true,
    maxlength: 100,
  },
  dob: {
    type: Date,
    required: true,
  },
  //min
  philosophy: {
    type: String,
    required: true,
    maxlength: 150,
  },
  //min
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
  description: {
    type: String,
    required: true,
    maxlength: 200,
  },
  links: {
    type: String,
    required: true,
  },

  Native: {
    type: String,
    required: true,
    maxlength: 150,
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
  },
});

const UserDetails = mongoose.model("UserDetails", userDetailSchema);

function validateUserDetails(userDetail) {
  const schema = Joi.object({
    role: Joi.string()
      .required()
      .valid(...Roles),
    description: Joi.string().required().max(200),
    links: Joi.string().required(),
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
