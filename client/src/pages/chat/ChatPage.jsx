/**
 * ChatPage.jsx — Main Chat Page
 *
 * Full chat interface with responsive layout:
 * - Desktop (≥768px): 360px sidebar + full conversation panel side by side
 * - Mobile (<768px): single panel — conversation list OR active conversation
 *
 * Uses the full available viewport height via flex layout from App.jsx.
 * No position:fixed or position:absolute — pure responsive flexbox.
 *
 * Features:
 * - Real-time messaging via Socket.IO
 * - Typing indicators, online status, unread badges
 * - Image sending, message seen indicators (✓✓)
 * - Auto-scroll only on new messages (no scroll on initial load or reload)
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChat } from "../../context/ChatContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import ChatSidebar from "../../components/chat/ChatSidebar.jsx";
import ChatBubble from "../../components/chat/ChatBubble.jsx";
import ChatInput from "../../components/chat/ChatInput.jsx";
import TypingIndicator from "../../components/chat/TypingIndicator.jsx";
import ConversationHeader from "../../components/chat/ConversationHeader.jsx";
import EmptyState from "../../components/chat/EmptyState.jsx";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    onlineUsers,
    typingUsers,
    loadingConversations,
    loadingMessages,
    openConversation,
    sendChatMessage,
    startTyping,
    stopTyping,
    isUserTyping,
    closeConversation,
  } = useChat();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(!userId);
  const messagesEndRef = useRef(null);
  const conversationOpenedRef = useRef(false);
  const prevMessagesLengthRef = useRef(0);
  const hasScrolledRef = useRef(false);

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-open conversation when navigating from /chat/:userId
  // Only runs once per userId change — ref prevents re-runs from openConversation reference changes
  useEffect(() => {
    conversationOpenedRef.current = false;
  }, [userId]);

  useEffect(() => {
    if (userId && user && !conversationOpenedRef.current) {
      conversationOpenedRef.current = true;
      openConversation(userId).then(() => {
        if (isMobile) setShowSidebar(false);
      });
    }
  }, [userId, user, openConversation]);

  // Auto-scroll — only when NEW messages are added (not on initial load or reload)
  useEffect(() => {
    if (messages.length === 0) return;

    if (!hasScrolledRef.current && messages.length > 0) {
      hasScrolledRef.current = true;
      prevMessagesLengthRef.current = messages.length;
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "instant" });
      }
      return;
    }

    if (messages.length > prevMessagesLengthRef.current) {
      prevMessagesLengthRef.current = messages.length;
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  // Reset scroll tracking when conversation changes
  useEffect(() => {
    hasScrolledRef.current = false;
    prevMessagesLengthRef.current = 0;
  }, [activeConversation?._id]);

  // Handle selecting a conversation from sidebar
  const handleSelectConversation = useCallback(async (conv) => {
    await openConversation(conv.otherUser._id);
    if (isMobile) setShowSidebar(false);
    navigate("/chat", { replace: true });
  }, [openConversation, isMobile, navigate]);

  // Handle back button on mobile
  const handleBack = useCallback(() => {
    closeConversation();
    setShowSidebar(true);
    navigate("/chat", { replace: true });
  }, [closeConversation, navigate]);

  // Handle sending a message
  const handleSend = useCallback((text, image) => {
    sendChatMessage(text, image);
  }, [sendChatMessage]);

  // Get the other user in active conversation
  const otherUser = activeConversation?.participants?.find((p) => p._id !== user?._id);
  const isOtherOnline = otherUser ? onlineUsers.has(otherUser._id) : false;

  const otherUserId = otherUser?._id;
  const isOtherTyping = activeConversation && otherUserId
    ? isUserTyping(activeConversation._id, otherUserId)
    : false;

  // Mobile: show sidebar OR conversation, not both
  const showConversationPanel = !isMobile || !showSidebar;
  const showSidebarPanel = !isMobile || showSidebar;

  return (
    <div style={{
      display: "flex",
      width: "100%",
      height: "100%",
      background: "var(--bg-secondary)",
      overflow: "hidden",
    }}>
      {/* Sidebar */}
      {showSidebarPanel && (
        <div style={{
          width: isMobile ? "100%" : 360,
          flexShrink: 0,
          height: "100%",
        }}>
          <ChatSidebar
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            activeId={activeConversation?._id}
            onlineUsers={onlineUsers}
            user={user}
          />
        </div>
      )}

      {/* Conversation Panel */}
      {showConversationPanel && (
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100%",
          background: "var(--bg-card)",
          borderLeft: isMobile ? "none" : "1px solid var(--border-light)",
        }}>
          {activeConversation && otherUser ? (
            <>
              <ConversationHeader
                user={otherUser}
                onBack={isMobile ? handleBack : null}
                isOnline={isOtherOnline}
              />

              {/* Messages Area */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px 0",
                background: "var(--bg-secondary)",
              }}>
                {loadingMessages ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                    <Loader2 size={24} color="var(--red)" style={{ animation: "spin 1s linear infinite" }} />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      No messages yet. Say hello! 👋
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                    const prevMsg = messages[idx - 1];
                    const showAvatar = !prevMsg ||
                      (prevMsg.senderId?._id || prevMsg.senderId) !== (msg.senderId?._id || msg.senderId);
                    return (
                      <ChatBubble
                        key={msg._id}
                        message={msg}
                        isMine={isMine}
                        showAvatar={showAvatar}
                      />
                    );
                  })
                )}

                {isOtherTyping && (
                  <TypingIndicator userName={otherUser.name?.split(" ")[0]} />
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input — always at bottom */}
              <ChatInput
                onSend={handleSend}
                onTyping={startTyping}
                onStopTyping={stopTyping}
              />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
