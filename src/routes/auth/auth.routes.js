import express from "express";
import { formatError } from "../../utils/response.js";
import { validTokenUserNumber } from "../../middleware/auth.middleware.js";
import {
  createUserDetails,
  LoginUser,
  verifyUser,
  validTokenCheck,
  updateUserType,
} from "../../controllers/auth.controllers.js";

const authRouter = express.Router();

authRouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(formatError("Internal Server Error"));
});

// Create User Endpoint
authRouter.route("/signup").post(createUserDetails);

// Sign In Endpoint
authRouter.route("/signin").post(LoginUser);

//Verfication Endpoint
authRouter.route("/verify").post(verifyUser);

authRouter.route("/tokenIsValid").post(validTokenUserNumber, validTokenCheck);

authRouter.post("/usertype", validTokenUserNumber, updateUserType);

export { authRouter };
