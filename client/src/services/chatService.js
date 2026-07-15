/**
 * chatService.js — Chat API Service
 *
 * All API calls related to the chat system.
 * Uses the shared axios instance from api.js which already
 * handles JWT token attachment and 401 redirects.
 *
 * Available functions:
 * - getConversations() → List all conversations
 * - getOrCreateConversation(userId) → Start or resume a chat
 * - getMessages(conversationId) → Load messages (paginated)
 * - sendMessage(data) → Send a message (text or image)
 * - markSeen(conversationId) → Mark messages as read
 * - getUnreadCount() → Total unread messages (for navbar badge)
 */

import api from "./api.js";

/** Fetch all conversations for the current user */
export const getConversations = async () => {
  const res = await api.get("/chat/conversations");
  return res.data.conversations;
};

/** Create or get existing conversation with a specific user */
export const getOrCreateConversation = async (userId) => {
  const res = await api.post(`/chat/conversation/${userId}`);
  return res.data.conversation;
};

/** Fetch messages for a conversation (paginated) */
export const getMessages = async (conversationId, limit = 50, before = null) => {
  let url = `/chat/messages/${conversationId}?limit=${limit}`;
  if (before) url += `&before=${before}`;
  const res = await api.get(url);
  return res.data.messages;
};

/** Send a new message (text and/or image as base64) */
export const sendMessage = async (conversationId, text, image = "") => {
  const res = await api.post("/chat/send", { conversationId, text, image });
  return res.data.message;
};

/** Mark all messages in a conversation as seen */
export const markSeen = async (conversationId) => {
  const res = await api.patch(`/chat/seen/${conversationId}`);
  return res.data;
};

/** Get total unread message count across all conversations */
export const getUnreadCount = async () => {
  const res = await api.get("/chat/unread-count");
  return res.data.unreadCount;
};
