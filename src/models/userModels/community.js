import mongoose from "mongoose";
import Joi from "joi";

const communitySchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: "Community",
    default: "Community",
  },
  profilePic: {
    type: String,
  },
  phoneNumberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserNumber",
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
  fullName: {
    type: String,
    required: true,
    maxlength: 100,
  },
  dob: {
    type: Date,
    required: true,
  },
  loveAboutSelf: {
    type: String,
    required: true,
    maxlength: 150,
  },
  philosophy: {
    type: String,
    required: true,
    maxlength: 150,
  },
});

function validateCommunity(community) {
  const schema = Joi.object({
    profilePic: Joi.string(),
    fullName: Joi.string().required().max(100),
    dob: Joi.date().iso().required(),
    loveAboutSelf: Joi.string().required().max(150),
    philosophy: Joi.string().required().max(150),
  });
  return schema.validate(community);
}

const Community = mongoose.model("Community", communitySchema);

export { Community, validateCommunity };

//Data normalization
//Performance
//Scalability
