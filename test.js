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
