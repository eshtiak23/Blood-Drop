/**
 * ChatContext.jsx — Chat State Management
 *
 * Central hub for all chat-related state and operations.
 * Manages:
 * - List of conversations (sidebar)
 * - Active conversation and its messages
 * - Online users tracking
 * - Typing indicators
 * - Unread message count (for navbar badge)
 * - Sending/receiving messages
 *
 * Usage:
 *   const { conversations, messages, sendMessage, ... } = useChat();
 *
 * This context uses useSocket() internally and provides
 * all real-time functionality to chat components.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext.jsx";
import useSocket from "../hooks/useSocket.js";
import * as chatService from "../services/chatService.js";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const socket = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const activeConversationRef = useRef(activeConversation);
  activeConversationRef.current = activeConversation;

  // Load conversations on mount
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingConversations(true);
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error("[Chat] Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnread = async () => {
      try {
        const count = await chatService.getUnreadCount();
        setUnreadTotal(count);
      } catch (err) { /* silent */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Socket.IO event handlers
  useEffect(() => {
    if (!socket || !user) return;

    // Rejoin active conversation room on reconnect
    const handleConnect = () => {
      const active = activeConversationRef.current;
      if (active) {
        socket.emit("chat:join", active._id);
      }
    };
    socket.on("connect", handleConnect);

    // Track online users
    socket.on("user:online", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("user:offline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    // Receive new message
    socket.on("message:new", (message) => {
      // If this message belongs to the active conversation, add it
      const active = activeConversationRef.current;
      if (active && message.conversationId === active._id) {
        setMessages((prev) => [...prev, message]);
        // Auto-mark as seen if we're viewing this conversation
        chatService.markSeen(active._id).catch(() => {});
        socket.emit("message:seen", { conversationId: active._id, seenBy: user._id });
      }

      // Update conversations list (move to top, update last message)
      setConversations((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((c) => c._id === message.conversationId);
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            lastMessage: {
              text: message.text || (message.image ? "📷 Image" : ""),
              senderId: message.senderId._id || message.senderId,
              createdAt: message.createdAt,
            },
            // Increment unread if not active conversation
            unreadCount: active && message.conversationId === active._id
              ? 0
              : (updated[idx].unreadCount || 0) + 1,
          };
          // Move to top
          const [item] = updated.splice(idx, 1);
          updated.unshift(item);
        }
        return updated;
      });

      // Update unread total if not in active conversation
      if (!active || message.conversationId !== active._id) {
        setUnreadTotal((prev) => prev + 1);
      }
    });

    // Typing indicators
    socket.on("typing:start", ({ userId, conversationId }) => {
      setTypingUsers((prev) => new Set([...prev, `${conversationId}:${userId}`]));
    });

    socket.on("typing:stop", ({ userId, conversationId }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(`${conversationId}:${userId}`);
        return next;
      });
    });

    // Messages seen
    socket.on("message:seen", ({ conversationId }) => {
      setMessages((prev) =>
        prev.map((m) => (m.conversationId === conversationId ? { ...m, seen: true } : m))
      );
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("user:online");
      socket.off("user:offline");
      socket.off("message:new");
      socket.off("typing:start");
      socket.off("typing:stop");
      socket.off("message:seen");
    };
  }, [socket, user]);

  // Open a conversation with a specific user
  const openConversation = useCallback(
    async (otherUserId) => {
      try {
        const conv = await chatService.getOrCreateConversation(otherUserId);
        setActiveConversation(conv);

        // Join the Socket.IO room
        if (socket) {
          socket.emit("chat:join", conv._id);
        }

        // Load messages
        setLoadingMessages(true);
        try {
          const msgs = await chatService.getMessages(conv._id);
          setMessages(msgs);

          // Mark as seen
          await chatService.markSeen(conv._id);
          setUnreadTotal((prev) => {
            const unreadInConv = conversations.find((c) => c._id === conv._id)?.unreadCount || 0;
            return Math.max(0, prev - unreadInConv);
          });

          // Update conversation in list
          setConversations((prev) =>
            prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0 } : c))
          );

          // Emit seen event
          if (socket) {
            socket.emit("message:seen", { conversationId: conv._id, seenBy: user._id });
          }
        } finally {
          setLoadingMessages(false);
        }

        return conv;
      } catch (err) {
        console.error("[Chat] Failed to open conversation:", err);
        return null;
      }
    },
    [socket, user, conversations]
  );

  // Send a message
  const sendChatMessage = useCallback(
    async (text, image = "") => {
      if (!activeConversation) return null;
      try {
        const message = await chatService.sendMessage(activeConversation._id, text, image);
        setMessages((prev) => [...prev, message]);

        // Update conversation in list
        setConversations((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((c) => c._id === activeConversation._id);
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              lastMessage: { text: text || (image ? "📷 Image" : ""), senderId: user._id, createdAt: new Date().toISOString() },
              unreadCount: 0,
            };
            const [item] = updated.splice(idx, 1);
            updated.unshift(item);
          }
          return updated;
        });

        // Note: Real-time delivery to the receiver is handled by the server
        // controller (chatController.js sendMessage) which emits via Socket.IO
        // directly to the receiver. We don't emit here to avoid duplicate messages.

        return message;
      } catch (err) {
        console.error("[Chat] Failed to send message:", err);
        return null;
      }
    },
    [activeConversation, socket, user]
  );

  // Start typing indicator
  const startTyping = useCallback(() => {
    if (socket && activeConversation) {
      socket.emit("typing:start", activeConversation._id);
    }
  }, [socket, activeConversation]);

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (socket && activeConversation) {
      socket.emit("typing:stop", activeConversation._id);
    }
  }, [socket, activeConversation]);

  // Check if a user is typing in a conversation
  const isUserTyping = useCallback(
    (conversationId, userId) => {
      return typingUsers.has(`${conversationId}:${userId}`);
    },
    [typingUsers]
  );

  // Close active conversation
  const closeConversation = useCallback(() => {
    if (socket && activeConversation) {
      socket.emit("chat:leave", activeConversation._id);
    }
    setActiveConversation(null);
    setMessages([]);
  }, [socket, activeConversation]);

  const value = {
    conversations,
    activeConversation,
    messages,
    onlineUsers,
    typingUsers,
    unreadTotal,
    loadingConversations,
    loadingMessages,
    loadConversations,
    openConversation,
    sendChatMessage,
    startTyping,
    stopTyping,
    isUserTyping,
    closeConversation,
    setActiveConversation,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
