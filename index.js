import express from "express";
import mongoose from "mongoose";
import { authRouter } from "./src/routes/auth/auth.routes.js";
import { userDetailsRouter } from "./src/routes/userRoutes/userDetails.js";
import { studentRouter } from "./src/routes/userRoutes/student.js";
import { investorRouter } from "./src/routes/userRoutes/investor.js";
import { wantrepreneurRouter } from "./src/routes/userRoutes/wantrepreneur.js";
import projectRouter from "./src/routes/projects/project.user.routes.js";
import { adminRouter } from "./src/routes/auth/admin.auth.routes.js";
import communityRouter from "./src/routes/userRoutes/community.js";
import resourcesRouter from "./src/routes/Resources/resources.routes.js";
import adminprojectRouter from "./src/routes/projects/project.admin.routes.js";
import { counsellorRouter } from "./src/routes/userRoutes/counsellor.js";
import {mentorRouter} from "./src/routes/userRoutes/mentor.js"

const app = express();

const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Middleware to parse JSON requests
app.use(express.json());

// Registering route handlers
app.use(authRouter); // Authentication routes
app.use(userDetailsRouter); // User details routes
app.use(studentRouter); // Student routes
app.use(investorRouter); // Investor routes
app.use(wantrepreneurRouter); // Wantrepreneur routes
app.use(communityRouter);
app.use(projectRouter); // Project routes
app.use(adminprojectRouter);
app.use(adminRouter);
app.use("/resources", resourcesRouter);
app.use(mentorRouter);
app.use(counsellorRouter);

// Start the HTTP server
app.listen(port, () => console.log(`Server listening on port ${port}`));
