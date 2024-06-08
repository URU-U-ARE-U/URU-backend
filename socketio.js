import express from "express";
import http from "http";
import socketIo from "socket.io"; 
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {};

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('register', (mobileNumber) => {
        users[mobileNumber] = socket.id;
        console.log(`${mobileNumber} registered with socket ID: ${socket.id}`);
    });

    socket.on('private_message', ({ sender, recipient, message }) => {
        const recipientSocketId = users[recipient];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receive_message', { sender, message });
            console.log(`Private message from ${sender} to ${recipient}: ${message}`);
        } else {
            console.log(`User ${recipient} not found`);
        }
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        for (let mobileNumber in users) {
            if (users[mobileNumber] === socket.id) {
                delete users[mobileNumber];
                console.log(`${mobileNumber} disconnected`);
                break;
            }
        }
    });
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
