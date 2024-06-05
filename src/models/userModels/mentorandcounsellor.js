import mongoose,{Schema} from "mongoose";
import Joi from "joi";


const userType = ["National","International"];


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

const roleType = ["counsellor","mentor"];
const payType = ["paid","free"];
const statusType = ["tick","pending"]

const mentorAndCounsellorSchema = new mongoose.Schema({
   role:{
    type:String,
    enum:roleType,
    required:true
   },
    username:{
        type:String,
        unique:true,
        required:true
    },
    image:{
        type:String,
    },
    philosophy: {
        type: String,
        required: true,
        maxlength: 150,
      },
    nationality:{
        type:String,
        enum:userType,
        required:true
    },
    district:{
       type:String,
       lowercase:true,
       required:true 
    },
    city:{
        type:String,
        lowercase:true,
        required:true
    },
    state:{
        type:String,
        lowercase:true,
        required:true
    },
    contactno:{
        type:String,
        required:true,
        validate: {
            validator: function (v) {
              return /^\+91\d{10}$/.test(v);
            },
            message: (props) => `${props.value} is not a valid phone number!`,
          },
    },
    email:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        required:true
    },
    sdg: {
        type: String,
        required: true,
        enum: SDGS,
    },
    description:{
        type:String,
        required:true,
        maxlength:250
    },
    links:{
        type:String,
        required:true
    },
    payment:{
        type:String,
        enum:payType,
        required:true
    },
    status:{
        type:String,
        enum:statusType,
        required:true
    }

})

function validateMentor(mentor){
    const schema = Joi.object({
        role: Joi.string().valid(...roleType), 
        username: Joi.string().required(),
        image: Joi.string().allow("").optional(),
        philosophy: Joi.string().required().max(150),
        nationality: Joi.string().valid(...userType).required(),
        district: Joi.string().lowercase().required(),
        city: Joi.string().lowercase().required(),
        state: Joi.string().lowercase().required(),
        contactno: Joi.string()
          .required()
          .pattern(new RegExp(/^\+91\d{10}$/))
          .message("must be a valid Indian phone number starting with +91"),
        email: Joi.string().email().required(),
        isVerified: Joi.boolean().required(),
        sdg: Joi.string().valid(...SDGS).required(),
        description: Joi.string().required().max(250),
        links: Joi.string().required(),
        payment: Joi.string().valid(...payType).required(),
        status:Joi.string().valid(...statusType).required()

      });
      return schema.validate(mentor);
}

const MentorAndCounsellor = mongoose.model("MentorAndCounsellor",mentorAndCounsellorSchema)

export {MentorAndCounsellor,validateMentor};