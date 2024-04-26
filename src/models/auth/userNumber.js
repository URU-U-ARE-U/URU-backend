import Joi from "joi";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  phone: {
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
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /\S+@\S+\.\S+/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  // userName: {
  //   type: String,
  //   unique: true,
  //   minlength: 8,
  //   maxlength: 16,
  //   required: true,
  // },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
    select: false, // Exclude OTP expiry from user data retrieval
  },
});

const UserNumber = mongoose.model("UserNumber", userSchema);

function validateUserNumber(userNumber) {
  const schema = Joi.object({
    phone: Joi.string()
      .pattern(/^\+91\d{10}$/)
      .required(),
    email: Joi.string().email().required(),
    // userName: Joi.string().min(8).max(16).required(),
  });

  return schema.validate(userNumber);
}

export { UserNumber, validateUserNumber };
