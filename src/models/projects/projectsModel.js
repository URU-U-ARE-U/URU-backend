import mongoose from "mongoose";
import Joi from "joi";

const SDGS = [
  "Group1",
  "Group2",
  "Group3",
  "Group4",
  "Group5",
  "Group6",
  "Group7",
  "Group8",
  "Group9",
  "Group10",
  "Group11",
  "Group12",
  "Group13",
  "Group14",
  "Group15",
  "Group16",
  "Group17",
];

const TRLS = [
  "Level1",
  "Level2",
  "Level3",
  "Level4",
  "Level5",
  "Level6",
  "Level7",
  "Level8",
  "Level9",
];
const InvestmentRange = [
  "10,000 and below",
  "50,000 and below",
  "50,000 to 100,000",
  "Not required",
];

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
});

const uniqueFeatureSchema = new mongoose.Schema({
  feature: {
    type: String,
    required: true,
    maxlength: 100,
  },
});

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserDetails",
  },
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 40,
  },
  sdg: {
    type: String,
    required: true,
    enum: SDGS,
  },
  trl: {
    type: String,
    required: true,
    enum: TRLS,
  },
  problem: {
    type: String,
    required: true,
    maxlength: 150,
  },
  solution: {
    type: String,
    required: true,
    maxlength: 300,
  },
  uniqueFeatures: {
    type: [String],
    validator: function (array) {
      return array.every((str) => str.length <= 100);
    },
  },
  teamMembers: {
    type: [teamMemberSchema],
    validate: {
      validator: function (array) {
        return array.length <= 4;
      },
      message: "Team members array exceeds 4 members",
    },
  },
  investmentRange: {
    type: String,
    required: true,
    enum: InvestmentRange,
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
  },
  images: [String],
  pdf: String,
  funded: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "UserDetails",
  },
});

// projectSchema.pre("save", function (next) {
//   const maxTeamMembers = 4;
//   if (this.teamMembers.length > maxTeamMembers) {
//     const error = new Error(
//       `Team members array exceeds maximum lenght of ${maxTeamMembers}`
//     );
//     return next(error);
//   }
//   next();
// });

function validateProject(project) {
  const schema = Joi.object({
    title: Joi.string().min(5).max(40).required(),
    sdg: Joi.string()
      .valid(...SDGS)
      .required(),
    trl: Joi.string()
      .valid(...TRLS)
      .required(),
    problem: Joi.string().max(150).required(),
    solution: Joi.string().max(300).required(),
    uniqueFeatures: Joi.array().items(Joi.string().max(100).required()),
    teamMembers: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          number: Joi.string().required(),
        })
      )
      .max(4),
    investmentRange: Joi.string()
      .valid(...InvestmentRange)
      .required(),
    description: Joi.string().max(500).required(),
    images: Joi.array().items(Joi.string()),
    pdf: Joi.string(),
  });
  return schema.validate(project, { abortEarly: false });
}

const Projects = mongoose.model("Projects", projectSchema);

export { Projects, validateProject };
