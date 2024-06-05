import { errorHandler } from "./auth.controllers.js";
import { formatError,formatResponse } from "../utils/response.js";
import {validateMentor} from "../models/userModels/mentorandcounsellor.js";
import { MentorAndCounsellor } from "../models/userModels/mentorandcounsellor.js";

const createMentor = errorHandler(async(req,res)=>{
    try {
        if (req.role !== "admin"){
            return res.status(403).json(formatError("Unauthorized"));
        }
        const { error } = validateMentor(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const isExists = await MentorAndCounsellor.find({username:req.body.username});
        if(!isExists){
            return res.status(400).json(formatError("Choose another UserName!!!"));
           }
        
        const data = new MentorAndCounsellor({
            role:"mentor",
            username:req.body.username,
            philosophy:req.body.philosophy,
            nationality:req.body.nationality,
            district:req.body.district,
            city:req.body.city,
            state:req.body.state,
            contactno:req.body.contactno,
            email:req.body.email,
            isVerified:req.body.isVerified,
            sdg:req.body.sdg,
            description:req.body.description,
            links:req.body.links,
            payment:req.body.payment,
            status:req.body.status

            
        });
        const createdMentor = await data.save();
        return res.status(200).json(formatResponse((createdMentor)));
    }
    catch(err){
        return res.status(401).json(formatError("Something went wrong!"));
    }
}
)











const updateMentor = errorHandler(async(req,res)=>{
    try{
        if (req.role !== "admin"){
            return res.status(403).json(formatError("Unauthorized"));
        }
    const id = req.params.mentorId;
    const updatedMentor = await MentorAndCounsellor.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updatedMentor){
        return res.status(404).send(formatError("Mentor not found"));
      }
      res.status(200).json(formatResponse(updatedMentor));
    } catch (err) {
      res.status(500).json(formatError(err.message));
    }
  });


  const viewMentor = errorHandler(async(req,res)=>{
    try{
        const id = req.params.mentorId;
        const mentor =await MentorAndCounsellor.findById(id);
        if(!mentor){
            return res.status(404).send(formatError("Mentor or counsellor not found!"));
        }
        return res.status(200).json(formatResponse(mentor));

    }catch(err){
        res.status(500).send(formatError(err.message));

    }
       
  })



  const allMentors = errorHandler(async(req,res)=>{
    try{
        const { city, district, state,page=1,limit=10} = req.query;
    
        const query = {role: "mentor"};
        
         if (city){
            query.city = city
        };
        if (district){query.district = district};
        if (state){query.state = state};

        const skip = (page - 1) * parseInt(limit, 10);
         const mentors = await MentorAndCounsellor.find(query).skip(skip).limit(parseInt(limit));
        if(!mentors&&mentors.length==0){
            return res.status(500).formatError("No mentor to display!");
        }
        return res.status(200).json(formatResponse(mentors));
    }catch(err){
        return res.status(500).formatError(err.message);
    }

  })

  


const deleteMentor = errorHandler(async(req,res)=>{
    try{
        if (req.role !== "admin"){
            return res.status(403).json(formatError("Unauthorized"));
        }
    const id = req.params.mentorId;
    const deletedMentor = await MentorAndCounsellor.findByIdAndDelete(id);
    if(!deletedMentor){
        res.status(404).json(formatError("Mentor not found!"));
    }
    return res.status(200).json(formatResponse(deleteMentor,"Mentor deleted successfully!"));
}catch(err){
    return res.status(500).formatError(err.message);
}
})

  export {allMentors,updateMentor,deleteMentor,createMentor,viewMentor}