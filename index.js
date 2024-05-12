import express from "express";
import mongoose from "mongoose";
import { authRouter } from "./src/routes/auth/auth.js";
import { userDetailsRouter } from "./src/routes/userRoutes/userDetails.js";
import { studentRouter } from "./src/routes/userRoutes/student.js";
import { investorRouter } from "./src/routes/userRoutes/investor.js";
import { wantrepreneurRouter } from "./src/routes/userRoutes/wantrepreneur.js";
import projectRouter from "./src/routes/projects/project.js";
import { adminRouter } from "./src/routes/userRoutes/admin.js";
import communityRouter from "./src/routes/userRoutes/community.js";

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
app.use(adminRouter);

// Start the HTTP server
app.listen(port, () => console.log(`Server listening on port ${port}`));
