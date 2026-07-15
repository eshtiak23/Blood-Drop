/**
 * ChatPage.jsx — Main Chat Page
 *
 * Full chat interface with:
 * - Desktop: 360px sidebar + full conversation panel
 * - Mobile: single panel (conversation list OR active conversation)
 *
 * This page uses ChatContext for all state and operations.
 * It handles URL params (/:userId) to auto-open a conversation
 * when navigating from a donor profile's "Chat" button.
 *
 * Features:
 * - Real-time messaging via Socket.IO
 * - Typing indicators
 * - Online status
 * - Unread badges
 * - Image sending
 * - Message seen indicators (✓✓)
 * - Auto-scroll to bottom on new messages
 * - Loading skeletons
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
  const messagesContainerRef = useRef(null);
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
  // Only runs once per userId change — uses ref to prevent re-runs from openConversation reference changes
  useEffect(() => {
    if (userId && user && !conversationOpenedRef.current) {
      conversationOpenedRef.current = true;
      openConversation(userId).then(() => {
        if (isMobile) setShowSidebar(false);
      });
    }
    // Reset ref when userId changes (navigating to a different user)
    return () => {
      if (userId) conversationOpenedRef.current = false;
    };
  }, [userId, user]);

  // Reset conversationOpenedRef when userId changes
  useEffect(() => {
    conversationOpenedRef.current = false;
  }, [userId]);

  // Auto-scroll to bottom — only when NEW messages are added (not on initial load)
  useEffect(() => {
    if (messages.length === 0) return;

    // On first load of messages, scroll to bottom instantly (no smooth)
    if (!hasScrolledRef.current && messages.length > 0) {
      hasScrolledRef.current = true;
      prevMessagesLengthRef.current = messages.length;
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "instant" });
      }
      return;
    }

    // Only scroll on new messages (not when messages are just reloaded)
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

  // Check if other user is typing in active conversation
  const otherUserId = otherUser?._id;
  const isOtherTyping = activeConversation && otherUserId
    ? isUserTyping(activeConversation._id, otherUserId)
    : false;

  return (
    <div className="chat-page" style={{
      display: "flex",
      height: "100dvh",
      marginTop: "-64px",
      paddingTop: 64,
      background: "var(--bg-secondary)",
      overflow: "hidden",
    }}>
      {/* Sidebar */}
      <div style={{
        width: isMobile ? "100%" : 360,
        flexShrink: 0,
        display: isMobile ? (showSidebar ? "block" : "none") : "block",
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

      {/* Conversation Panel */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        height: "100%",
        background: "var(--bg-card)",
        borderLeft: isMobile ? "none" : "1px solid var(--border-light)",
      }}>
        {/* On mobile, only show conversation when sidebar is hidden */}
        {isMobile && showSidebar ? null : (
          activeConversation && otherUser ? (
            <>
              {/* Header */}
              <ConversationHeader
                user={otherUser}
                onBack={isMobile ? handleBack : null}
                isOnline={isOtherOnline}
              />

              {/* Messages Area */}
              <div
                ref={messagesContainerRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "12px 0",
                  background: "var(--bg-secondary)",
                }}
              >
                {loadingMessages ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                    <Loader2 size={24} color="var(--red)" style={{ animation: "spin 1s linear infinite" }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      No messages yet. Say hello! 👋
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => {
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
                    })}
                  </>
                )}

                {/* Typing indicator */}
                {isOtherTyping && (
                  <TypingIndicator userName={otherUser.name?.split(" ")[0]} />
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <ChatInput
                onSend={handleSend}
                onTyping={startTyping}
                onStopTyping={stopTyping}
              />
            </>
          ) : (
            <EmptyState />
          )
        )}
      </div>

      <style>{`
        .chat-page {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 40;
        }
        @media (max-width: 768px) {
          .chat-page {
            height: 100vh;
            height: 100dvh;
          }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
