import { errorHandler } from "./auth.controllers.js";
import { formatError,formatResponse } from "../utils/response.js";
import {validateMentor} from "../models/userModels/mentor.js";
import { Mentor } from "../models/userModels/mentor.js";

const createMentor = errorHandler(async(req,res)=>{
    try {
        if (req.role !== "admin"){
            return res.status(403).json(formatError("Unauthorized"));
        }
        const { error } = validateMentor(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const mentorExists = await Mentor.find({username:req.body.username});
        if(!mentorExists){
            return res.status(400).json(formatError("Choose another UserName!!!"));
           }
        
        const mentor = new Mentor({
            userId: req.user,
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
            links:req.body.links
        });
        const createdMentor = await mentor.save();
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
    const mentor = await Mentor.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!mentor){
        return res.status(404).send(formatError("Mentor not found"));
      }
      res.send(formatResponse(mentor));
    } catch (err) {
      res.status(500).json(formatError(err.message));
    }
  });


  const viewMentor = errorHandler(async(req,res)=>{
    try{
        const id = req.params.mentorId;
        const mentor =await Mentor.findById(id);
        if(!mentor){
            return res.status(404).send(formatError("Mentor not found!"));
        }
        return res.status(200).json(formatResponse(mentor));

    }catch(err){
        res.status(500).send(formatError(err.message));

    }
       
  })



  const allMentors = errorHandler(async(req,res)=>{
    try{
        const { city, district, state,page=1,limit=10} = req.query;
    
        const query = {};
         if (city){
            query.city = city
        };
        if (district){query.district = district};
        if (state){query.state = state};

        const skip = (page - 1) * parseInt(limit, 10);
         const mentors = await Mentor.find(query).skip(skip).limit(parseInt(limit));
        if(!mentors){
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
    const deletedMentor = await Mentor.findByIdAndDelete(id);
    if(!deletedMentor){
        res.status(404).json(formatError("Mentor not found!"));
    }
    return res.status(200).json(formatResponse(deletedMentor,"Mentor deleted successfully!"));
}catch(err){
    return res.status(500).formatError(err.message);
}
})

  export {allMentors,viewMentor,updateMentor,deleteMentor,createMentor}