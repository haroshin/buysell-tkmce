import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiMessageSquare,
  FiSend,
  FiArrowLeft,
  FiChevronRight,
  FiImage,
  FiCheck,
  FiCheckCircle,
  FiInbox,
} from 'react-icons/fi';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);

  // Conversations state
  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);

  // Active chat state
  const [activeChat, setActiveChat] = useState(null); // { userId, listingId }
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [chatListing, setChatListing] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Mobile view state
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  // Check for URL params (when coming from ListingDetail "Message Seller")
  useEffect(() => {
    const sellerId = searchParams.get('seller');
    const listingId = searchParams.get('listing');
    if (sellerId && listingId) {
      openChat(sellerId, listingId);
    }
  }, [searchParams]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data.conversations);
    } catch (error) {
      console.error('Failed to fetch conversations', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConvos(false);
    }
  };

  const openChat = async (userId, listingId) => {
    setActiveChat({ userId, listingId });
    setShowChatOnMobile(true);
    setLoadingMessages(true);

    try {
      const { data } = await api.get(`/messages/${userId}/${listingId}`);
      setMessages(data.messages);
      setOtherUser(data.otherUser);
      setChatListing(data.listing);

      // Refresh conversations to update unread counts
      fetchConversations();
    } catch (error) {
      console.error('Failed to load messages', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || sending) return;

    setSending(true);
    try {
      const { data } = await api.post('/messages/send', {
        receiverId: activeChat.userId,
        listingId: activeChat.listingId,
        content: newMessage.trim()
      });

      setMessages((prev) => [...prev, data]);
      setNewMessage('');

      // Update last message in conversations list
      fetchConversations();
    } catch (error) {
      console.error('Failed to send message', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatChatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const defaultImage = 'https://via.placeholder.com/100x100?text=Item';

  return (
    <div className="min-h-screen pt-16 lg:pt-18">
      <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-4.5rem)] flex">

        {/* ============ Conversations Sidebar ============ */}
        <div className={`w-full md:w-96 lg:w-[420px] flex-shrink-0 border-r border-dark-700/50 flex flex-col bg-dark-900
          ${showChatOnMobile ? 'hidden md:flex' : 'flex'}`}
        >
          {/* Sidebar Header */}
          <div className="p-5 border-b border-dark-700/50">
            <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-500/15 flex items-center justify-center">
                <FiMessageSquare className="text-lg text-primary-400" />
              </div>
              Messages
            </h1>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
                  <FiInbox className="text-2xl text-dark-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">No messages yet</h3>
                <p className="text-dark-400 text-sm">
                  When you message a seller or someone contacts you, conversations will appear here.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeChat?.userId === conv.otherUser._id &&
                  activeChat?.listingId === conv.listing._id;
                const isMyMessage = conv.lastMessage.senderId.toString() === user?._id;

                return (
                  <button
                    key={conv._id}
                    onClick={() => openChat(conv.otherUser._id, conv.listing._id)}
                    className={`w-full text-left p-4 flex gap-3 border-b border-dark-800/80 transition-all duration-200 hover:bg-dark-800/60 ${
                      isActive ? 'bg-primary-500/8 border-l-2 border-l-primary-500' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={conv.otherUser.avatar}
                        alt={conv.otherUser.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-dark-700"
                      />
                      {conv.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className={`font-semibold text-sm truncate ${conv.unreadCount > 0 ? 'text-white' : 'text-dark-200'}`}>
                          {conv.otherUser.name}
                        </h3>
                        <span className="text-[11px] text-dark-500 flex-shrink-0 ml-2">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-dark-400 truncate mb-1">
                        <span className="text-dark-500">{conv.listing.title}</span>
                        {' · '}₹{conv.listing.price}
                      </p>
                      <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-dark-200 font-medium' : 'text-dark-500'}`}>
                        {isMyMessage ? 'You: ' : ''}{conv.lastMessage.content}
                      </p>
                    </div>

                    <FiChevronRight className="text-dark-600 flex-shrink-0 mt-4 text-sm" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ============ Chat Area ============ */}
        <div className={`flex-1 flex flex-col bg-dark-950/50
          ${showChatOnMobile ? 'flex' : 'hidden md:flex'}`}
        >
          {!activeChat ? (
            /* No chat selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-dark-800 flex items-center justify-center mx-auto mb-5">
                  <FiMessageSquare className="text-3xl text-dark-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                <p className="text-dark-400 text-sm max-w-xs">
                  Choose from your existing conversations or start a new one from a listing page.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-dark-700/50 bg-dark-900/80 backdrop-blur-sm flex items-center gap-3">
                <button
                  onClick={() => setShowChatOnMobile(false)}
                  className="md:hidden p-2 rounded-xl text-dark-300 hover:bg-dark-800 transition-colors"
                >
                  <FiArrowLeft className="text-lg" />
                </button>

                <img
                  src={otherUser?.avatar || 'https://via.placeholder.com/100'}
                  alt={otherUser?.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-dark-700"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">{otherUser?.name}</h3>
                  <p className="text-dark-500 text-xs truncate">{otherUser?.department}</p>
                </div>

                {chatListing && (
                  <Link
                    to={`/listing/${chatListing._id}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/30 transition-all text-xs"
                  >
                    <img
                      src={chatListing.images?.[0] || defaultImage}
                      alt={chatListing.title}
                      className="w-7 h-7 rounded object-cover"
                    />
                    <div className="hidden sm:block max-w-[120px]">
                      <p className="text-dark-200 truncate font-medium">{chatListing.title}</p>
                      <p className="text-accent-400 font-bold">₹{chatListing.price}</p>
                    </div>
                  </Link>
                )}
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-dark-500 text-sm">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender._id === user?._id;
                    const showAvatar = idx === 0 || messages[idx - 1]?.sender._id !== msg.sender._id;

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}
                      >
                        {/* Other user avatar */}
                        {!isMe && showAvatar && (
                          <img
                            src={msg.sender.avatar}
                            alt={msg.sender.name}
                            className="w-8 h-8 rounded-full object-cover mr-2 mt-1 flex-shrink-0"
                          />
                        )}
                        {!isMe && !showAvatar && <div className="w-8 mr-2 flex-shrink-0" />}

                        <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? 'bg-primary-500 text-white rounded-br-md'
                                : 'bg-dark-800 text-dark-100 border border-dark-700 rounded-bl-md'
                            }`}
                          >
                            {msg.content}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                            <span className="text-[10px] text-dark-600">
                              {formatChatTime(msg.createdAt)}
                            </span>
                            {isMe && (
                              <FiCheck className={`text-xs ${msg.isRead ? 'text-accent-400' : 'text-dark-600'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSend}
                className="p-4 border-t border-dark-700/50 bg-dark-900/80 backdrop-blur-sm"
              >
                <div className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-sm text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all resize-none"
                      style={{ maxHeight: '120px' }}
                      id="message-input"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="w-11 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:bg-dark-700 disabled:text-dark-500 text-white flex items-center justify-center transition-all duration-200 flex-shrink-0"
                    id="send-message-btn"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiSend className="text-lg" />
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Messages;
