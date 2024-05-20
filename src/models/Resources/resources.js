import mongoose from "mongoose";
import Joi from "joi";

const resourceTypes = [
  "Instruments",
  "Labs",
  "Prototyping",
  "Testing",
  "Software",
  "Fabrication",
];

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
  "Delhi",
  "Puducherry",
  "Ladakh",
  "Jammu and Kashmir",
];

const resourceSchema = new mongoose.Schema({
  resourceType: {
    type: String,
    enum: resourceTypes,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    enum: indianStates,
    required: true,
  },
  address: {
    type: String,
    required: true,
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
  contactPerson: {
    name: {
      type: String,
      required: true,
      maxlength: 150,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    required: true,
    maxlength: 800,
  },
  links: {
    type: [String],
    required: true,
  },
});

const validateResource = (resource) => {
  const schema = Joi.object({
    resourceType: Joi.string()
      .valid(...resourceTypes)
      .required(),
    name: Joi.string().required(),
    logo: Joi.string().required(),
    district: Joi.string().required(),
    state: Joi.string()
      .valid(...indianStates)
      .required(),
    address: Joi.string().required(),
    email: Joi.string().email().required(),
    contactPerson: Joi.object({
      name: Joi.string().required().max(150),
      phoneNumber: Joi.string().required(),
    }).required(),
    verified: Joi.boolean().default(false),
    description: Joi.string().required().max(800),
    links: Joi.array().items(Joi.string()).required(),
  });

  return schema.validate(resource);
};

const Resource = mongoose.model("Resource", resourceSchema);

const resourceSavedSchema = new mongoose.Schema({
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resource",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserNumber",
  },
});
const ResourceSaved = mongoose.model("ResourceSaved", resourceSavedSchema);

export { Resource, validateResource, ResourceSaved };
