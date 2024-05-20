import { Admin } from "../../models/userModels/admin.js";
import { formatError, formatResponse } from "../../utils/response.js";
import { errorHandler } from "../auth.controllers.js";
import { generateToken } from "../../utils/authGenerators.js";

const getAllUserNameAdmin = errorHandler(async (req, res) => {
  const allUserName = await Admin.find().distinct("userName");
  res.status(200).json(formatResponse(allUserName));
});

const registerAdmin = errorHandler(async (req, res) => {
  const userNumberId = req.user;
  try {
    const { userName } = req.body;

    const existingUserName = await Admin.findOne({
      userName: userName,
    });
    if (existingUserName) {
      return res.status(400).json(formatError("Choose another UserName!!!"));
    }
    const existingAdmin = await Admin.findOne({ userNumberId: userNumberId });
    if (existingAdmin) {
      return res.status(400).json(formatResponse(null, "Admin Already Exists"));
    }

    const admin = new Admin({
      userName: userName,
      userNumberId: userNumberId,
    });
    const user = await admin.save();
    const payload = { id: user._id, role: "admin" };
    const token = generateToken(payload, process.env.SECRET_KEY);
    res.status(201).json(formatResponse(token, "Created Admin Successfully"));
  } catch (error) {
    res.status(500).json(formatError(error.message));
  }
});

const signInAdmin = errorHandler(async (req, res) => {
  try {
    const { userName } = req.body;

    const admin = await Admin.findOne({ userName: userName });
    if (!admin) {
      return res.status(404).json(formatError("Admin Was Not Found"));
    }
    const payload = { id: admin._id, role: "admin" };
    const token = generateToken(payload, process.env.SECRET_KEY);

    res.status(200).json(formatResponse(token, "Logged In Successfull"));
  } catch (error) {
    console.log(error);
    res.status(500).json(formatError(error.message));
  }
});

export { getAllUserNameAdmin, registerAdmin, signInAdmin };
