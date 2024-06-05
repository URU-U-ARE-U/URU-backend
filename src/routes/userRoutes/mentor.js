import express from "express";
const mentorRouter = express.Router();
import {createMentor,updateMentor,deleteMentor,viewMentor,allMentors} from "../../controllers/mentor.controllers.js";
import { validTokenAdmin } from "../../middleware/admin.auth.middleware.js";
import { validTokenUserNumber } from "../../middleware/auth.middleware.js";


mentorRouter.route("/mentors")
.post(validTokenAdmin,createMentor)
.get(validTokenUserNumber,allMentors)




mentorRouter.route("/mentors/:mentorId")
.get(validTokenUserNumber,viewMentor)
.delete(validTokenAdmin,deleteMentor)
.patch(validTokenAdmin,updateMentor)




export {mentorRouter}