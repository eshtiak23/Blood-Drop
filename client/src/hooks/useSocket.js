/**
 * useSocket.js — Socket.IO Connection Hook
 *
 * Manages the WebSocket connection to the server.
 * Handles:
 * - Connecting when user is logged in
 * - Disconnecting when user logs out or component unmounts
 * - Reconnection on network issues
 * - Exposes the socket instance for other components
 *
 * Usage:
 *   const socket = useSocket();
 *   socket?.emit("message:send", data);
 *   socket?.on("message:new", handler);
 */

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext.jsx";

export default function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect if user is logged in
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem("blooddrop_token");
    if (!token) return;

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const SERVER_URL = API_URL.replace("/api", "");

    const newSocket = io(SERVER_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("[Socket] Connected:", newSocket.id);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    newSocket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [isAuthenticated, user]);

  return socket;
}
