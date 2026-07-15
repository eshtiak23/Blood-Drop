/**
 * socket/index.js — Socket.IO Server Setup
 *
 * Manages real-time WebSocket connections for the chat system.
 *
 * Features:
 * - JWT authentication on connection (only logged-in users can connect)
 * - Tracks which users are online (userId → socketId mapping)
 * - Handles: joining conversations, sending messages, typing indicators
 * - Auto-reconnection support on the client
 *
 * How it works:
 * 1. Client connects with their JWT token
 * 2. Server verifies the token and registers the user as "online"
 * 3. When a user opens a chat, they "join" that conversation room
 * 4. Messages are emitted to the room for instant delivery
 * 5. Typing indicators are broadcast to the other user in real-time
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export function initSocket(io) {
  // Map of userId → socketId for online users
  const onlineUsers = new Map();

  // Make onlineUsers available to Express routes via req.onlineUsers
  io.onlineUsers = onlineUsers;

  // Authentication middleware — runs before every connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("User not found"));
      socket.userId = user._id.toString();
      socket.userName = user.name;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] ${socket.userName} connected (${socket.userId})`);

    // Register user as online
    onlineUsers.set(socket.userId, socket.id);
    io.emit("user:online", { userId: socket.userId });

    // Join a conversation room
    socket.on("chat:join", (conversationId) => {
      socket.join(conversationId);
    });

    // Leave a conversation room
    socket.on("chat:leave", (conversationId) => {
      socket.leave(conversationId);
    });

    // Send message — broadcast to conversation room
    socket.on("message:send", (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit("message:new", data);
    });

    // Typing indicator — broadcast to conversation room except sender
    socket.on("typing:start", (conversationId) => {
      socket.to(conversationId).emit("typing:start", {
        userId: socket.userId,
        userName: socket.userName,
        conversationId,
      });
    });

    socket.on("typing:stop", (conversationId) => {
      socket.to(conversationId).emit("typing:stop", {
        userId: socket.userId,
        conversationId,
      });
    });

    // Mark messages as seen — notify the sender
    socket.on("message:seen", (data) => {
      const { conversationId, seenBy } = data;
      socket.to(conversationId).emit("message:seen", { conversationId, seenBy });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`[Socket] ${socket.userName} disconnected (${socket.userId})`);
      onlineUsers.delete(socket.userId);
      io.emit("user:offline", { userId: socket.userId });
    });
  });

  return onlineUsers;
}
