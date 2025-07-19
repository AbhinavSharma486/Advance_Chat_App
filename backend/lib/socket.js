import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  }
});

// Stores online users: { userId: socketId }
const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Notify all users
  }

  // Handle user deletion
  socket.on("deleteUser", (userId) => {
    if (userSocketMap[userId]) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Update all clients
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Notify all users
    }
  });

  // Typing indicator 
  socket.on("typing", ({ to }) => {
    const receiverSocketId = userSocketMap[to];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { from: userId });
    }
  });

  socket.on("stopTyping", ({ to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { from: userId });
    }
  });

  // Read receipts
  socket.on("messageSeen", ({ messageIds, by }) => {
    // messageIds: array of message _id, by: userId who saw
    io.emit("messageSeen", { messageIds, by });
  });
});

export { io, app, server };