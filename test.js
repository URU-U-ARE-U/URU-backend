import { io } from "socket.io-client";

// Socket.io server URL
const socketUrl = "http://localhost:3000"; // Replace with your Socket.io server URL

// Connect to Socket.io server
const socket = io(socketUrl);

// Socket.io event handlers
socket.on("connect", () => {
  console.log("Connected to Socket.io server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from Socket.io server");
});

socket.on("error", (error) => {
  console.error("Socket.io connection error:", error);
});

// Example: Send a message to the server
socket.emit("chat message", "Hello Socket.io Server!");

// Example: Listen for messages from the server
socket.on("chat message", (msg) => {
  console.log("Received message from server:", msg);
});

// mongodb+srv://uru6647:%40URU22uru@cluster0.z4ejrcs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

// projectRouter.get("/projects", validTokenUserDetail, async (req, res) => {
//   try {
//     const allProjects = await Projects.find();

//     const userRequests = await ProjectRequest.find({
//       userId: req.user,
//     }).populate({
//       path: "projectId",
//       select: "title sdg trl investmentRange description images",
//     });

//     const projectRequestMap = {};
//     userRequests.forEach((request) => {
//       projectRequestMap[request.projectId._id.toString()] = request.status;
//     });

//     const projectsWithRequests = allProjects.map((project) => ({
//       _id: project._id,
//       name: project.title,
//       description: project.description,
//       sdg: project.sdg,
//       trl: project.trl,
//       investmentRange: project.investmentRange,
//       images: project.images,
//       status: projectRequestMap[project._id.toString()] || "NONE",
//     }));

//     res.status(200).json(formatResponse(projectsWithRequests));
//   } catch (error) {
//     res.status(500).json(formatError(error.message));
//   }
// });
