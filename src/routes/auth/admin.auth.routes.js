import express from "express";
import { validateAdminRegisterInput } from "../../middleware/admin.auth.middleware.js";
import { validTokenUserNumber } from "../../middleware/auth.middleware.js";
import {
  getAllUserNameAdmin,
  registerAdmin,
  signInAdmin,
} from "../../controllers/admin/admin.auth.controllers.js";

const adminRouter = express.Router();

adminRouter
  .route("/admin/username")
  .get(validTokenUserNumber, getAllUserNameAdmin);

adminRouter
  .route("/admin/register")
  .post(validTokenUserNumber, validateAdminRegisterInput, registerAdmin);

adminRouter.post(
  "/admin/signin",
  validateAdminRegisterInput,
  validTokenUserNumber,
  signInAdmin
);

export { adminRouter };
