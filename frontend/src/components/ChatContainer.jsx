import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ChatHeader from './ChatHeader';
import MessageInput from "./MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { getMessages, subscribeToMessages, unsubscribeFromMessages, reactToMessage, editMessage, deleteMessage, setReply, markMessagesAsSeen, setSelectedUser, updateSidebarLastMessage } from '../redux/message/chatSlice';
import { formatMessageTime, REACTION_EMOJIS, groupMessagesByDate, getAvatarUrl } from '../lib/util.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ChevronDown, ArrowLeft, AlertTriangle } from 'lucide-react';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';


const ChatContainer = ({ setShowMobileChat }) => {
  const dispatch = useDispatch();

  const { messages = [], isMessagesLoading, selectedUser, typingBubble } = useSelector((state) => state.chat);
  const { currentUser } = useSelector((state) => state.user);
  const messageEndRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showReactions, setShowReactions] = useState({});
  const [pickerFor, setPickerFor] = useState(null);
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 });
  const pickerRef = useRef();
  // For responsive context menu positioning
  const [pickerAdjustedPos, setPickerAdjustedPos] = useState({ x: 0, y: 0 });
  const theme = useSelector((state) => state.theme.theme);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const chatAreaRef = useRef(null);
  const lastScrolledUserId = useRef(null);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [swipeStates, setSwipeStates] = useState({}); // { [msgId]: { x, active } }
  const [mediaPreview, setMediaPreview] = useState(null); // { type, url }
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Touch event handlers for swipe-to-reply
  const touchData = useRef({}); // { [msgId]: { startX, lastX, swiping } }

  const handleTouchStart = (msgId, e) => {
    if (window.innerWidth < 320 || window.innerWidth > 767) return;
    const touch = e.touches[0];
    touchData.current[msgId] = { startX: touch.clientX, lastX: touch.clientX, swiping: true };
    setSwipeStates(s => ({ ...s, [msgId]: { x: 0, active: false } }));
  };

  const handleTouchMove = (msgId, e) => {
    if (window.innerWidth < 320 || window.innerWidth > 767) return;
    if (!touchData.current[msgId]?.swiping) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchData.current[msgId].startX;
    if (deltaX > 0) {
      setSwipeStates(s => ({ ...s, [msgId]: { x: Math.min(deltaX, 80), active: deltaX > 40 } }));
    }
    touchData.current[msgId].lastX = touch.clientX;
  };

  const handleTouchEnd = (msgId, message) => {
    if (window.innerWidth < 320 || window.innerWidth > 767) return;
    const state = swipeStates[msgId];
    if (state?.active) {
      dispatch(setReply(message));
    }
    setSwipeStates(s => ({ ...s, [msgId]: { x: 0, active: false } }));
    touchData.current[msgId] = null;
  };

  // Close emoji picker/dropdown on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerFor(null);
      }
    };
    if (pickerFor) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [pickerFor]);

  // Adjust context menu position so it never overflows the viewport
  useLayoutEffect(() => {
    if (!pickerFor || !pickerRef.current) return;
    const menu = pickerRef.current;
    const { innerWidth, innerHeight } = window;
    const rect = menu.getBoundingClientRect();
    let x = pickerPos.x;
    let y = pickerPos.y;
    // If menu overflows right, shift left
    if (x + rect.width > innerWidth - 8) x = innerWidth - rect.width - 8;
    // If menu overflows left, shift right
    if (x < 8) x = 8;
    // If menu overflows bottom, try to open above the click/touch point
    if (y + rect.height > innerHeight - 8) {
      // Try to open above
      const aboveY = y - rect.height;
      if (aboveY >= 8) {
        y = aboveY;
      } else {
        // If still overflows top, clamp to 8
        y = 8;
      }
    }
    // If menu overflows top, shift down
    if (y < 8) y = 8;
    setPickerAdjustedPos({ x, y });
  }, [pickerFor, pickerPos]);


  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(getMessages(selectedUser._id));
    }
    return () => {
      // Remove all subscribeToMessages and unsubscribeFromMessages logic from this file
    };
  }, [selectedUser, dispatch]);

  // Restore: Subscribe globally when currentUser is set
  useEffect(() => {
    if (currentUser?._id) {
      // Remove all subscribeToMessages and unsubscribeFromMessages logic from this file
    }
    return () => {
      // Remove all subscribeToMessages and unsubscribeFromMessages logic from this file
    };
  }, [currentUser, dispatch]);

  // Mark messages as seen when chat is open or messages change 
  useEffect(() => {
    if (selectedUser && messages.length > 0) {
      const unseen = messages.filter(
        m => m.receiverId === currentUser._id && (!m.seen || !m.seen.includes(currentUser._id))
      ).map(m => m._id);

      if (unseen.length > 0) {
        dispatch(markMessagesAsSeen(unseen));
      }
    }
  }, [selectedUser, messages, currentUser, dispatch]);

  // WhatsApp-style: Always jump to last message when messages are loaded (robust MutationObserver version)
  useEffect(() => {
    if (
      !isMessagesLoading &&
      selectedUser?._id &&
      messages.length > 0 &&
      chatAreaRef.current
    ) {
      const chatArea = chatAreaRef.current;
      const scrollToBottom = () => {
        chatArea.scrollTop = chatArea.scrollHeight;
      };
      // If already at bottom, scroll immediately
      if (chatArea.scrollHeight > 0) {
        scrollToBottom();
      } else {
        // Otherwise, observe for DOM changes
        const observer = new MutationObserver(() => {
          scrollToBottom();
          observer.disconnect();
        });
        observer.observe(chatArea, { childList: true, subtree: true });
        // Clean up
        return () => observer.disconnect();
      }
    }
  }, [isMessagesLoading, selectedUser?._id, messages.length]);
  // (Optional) Smooth scroll for new messages in same chat
  // useEffect(() => {
  //   if (!isMessagesLoading && selectedUser?._id && lastScrolledUserId.current === selectedUser._id) {
  //     messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [messages, typingBubble]);

  // Scroll event handler for chat area
  useEffect(() => {
    const chatArea = chatAreaRef.current;
    if (!chatArea) return;
    const handleScroll = () => {
      // Show button if not near the bottom (e.g., 150px from bottom)
      const threshold = 150;
      const atBottom = chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight < threshold;
      setShowJumpToLatest(!atBottom);
    };
    chatArea.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    return () => chatArea.removeEventListener('scroll', handleScroll);
  }, [messages, typingBubble]);
  // Handler for jump to latest
  const handleJumpToLatest = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handler to open date picker
  const handleOpenDatePicker = () => setShowDatePicker(true);
  // Handler to close date picker
  const handleCloseDatePicker = () => setShowDatePicker(false);
  // Handler for date select
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    // Scroll to the first message of this date
    const dateKey = date.toDateString();
    setTimeout(() => {
      if (chatAreaRef.current) {
        const el = chatAreaRef.current.querySelector(`[data-datekey='${dateKey}']`);
        if (el) {
          chatAreaRef.current.scrollTo({
            top: el.offsetTop - chatAreaRef.current.offsetTop,
            behavior: 'smooth'
          });
        }
      }
    }, 100); // Wait for modal to close and DOM to update
  };

  // Add ESC key close for modal
  useEffect(() => {
    if (!mediaPreview) return;
    const handler = (e) => {
      if (e.key === 'Escape') setMediaPreview(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mediaPreview]);

  // Clear chat handler
  const handleDeleteChat = () => {
    setShowDeleteModal(true);
  };
  const confirmDeleteChat = async () => {
    if (!selectedUser?._id) return;
    try {
      await axiosInstance.delete(`/messages/clear/${selectedUser._id}`);
      toast.success('Chat cleared!');
      setShowDeleteModal(false);
      // Clear sidebar last message for this user
      dispatch(updateSidebarLastMessage({ _id: '', senderId: currentUser._id, receiverId: selectedUser._id, text: '', createdAt: null }));
      dispatch(setSelectedUser(null));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clear chat');
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Mobile back button */}
        {setShowMobileChat && (
          <div className="md:hidden flex items-center p-2 border-b border-base-300 bg-base-100">
            <button
              onClick={() => setShowMobileChat(false)}
              className="mr-2 p-2 rounded-full hover:bg-base-200 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="font-semibold">Back</span>
          </div>
        )}
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <>
      {/* Delete Chat Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative bg-base-100 border border-base-300 rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col items-center text-base-content">
            <button
              className="absolute top-3 right-3 text-base-content/60 hover:text-base-content btn btn-ghost btn-circle"
              onClick={() => setShowDeleteModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <AlertTriangle className="w-12 h-12 text-warning mb-2" />
            <h2 className="text-lg font-semibold mb-2 text-center">Delete Chat?</h2>
            <p className="text-base-content/70 text-center mb-4">Are you sure you want to delete this chat? This will clear all messages for you. This action cannot be undone.</p>
            <div className="flex gap-3 w-full mt-2">
              <button
                className="btn btn-ghost flex-1"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 text-white bg-red-600 hover:bg-red-700 border-none btn rounded-lg"
                onClick={confirmDeleteChat}
              >
                Delete Chat
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-2" data-theme={theme}>
          <div className="bg-base-100 p-2 sm:p-4 rounded-lg shadow-lg relative w-full max-w-xs sm:max-w-sm">
            <button
              className="absolute top-2 right-2 btn btn-sm btn-circle sm:btn-xs"
              style={{ zIndex: 10 }}
              onClick={handleCloseDatePicker}
              aria-label="Close calendar"
            >
              ✕
            </button>
            <div className="flex justify-center">
              <DatePicker
                inline
                selected={selectedDate}
                onChange={handleDateSelect}
                maxDate={new Date()}
                calendarClassName="!bg-base-100 custom-datepicker-theme"
              />
            </div>
          </div>
        </div>
      )}
      {/* Remove any absolute debug box */}
      <div className='flex-1 flex flex-col min-h-0 w-full md:px-6 lg:px-12 md:max-w-none lg:max-w-4xl mx-auto md:min-w-0 flex-1 max-w-full overflow-x-hidden'>
        {/* Mobile back button */}
        {setShowMobileChat && (
          <div className="md:hidden flex items-center p-2 border-b border-base-300 bg-base-100">
            <button
              onClick={() => setShowMobileChat(false)}
              className="mr-2 p-2 rounded-full hover:bg-base-200 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="font-semibold">Back</span>
          </div>
        )}
        <ChatHeader onOpenDatePicker={handleOpenDatePicker} onDeleteChat={handleDeleteChat} />
        {/* Scrollable chat area: messages + typing bubble + scroll ref */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden max-w-full xxs:p-2 xs:p-2 p-4 xxs:space-y-2 xs:space-y-3 space-y-4 xxs:pb-2 xs:pb-3 pb-4 bg-base-100 transition-colors duration-300 min-h-0"
          ref={chatAreaRef}
          style={{ position: 'relative' }}
        >
          {/* Group messages by date and render with date separators */}
          {groupMessagesByDate([
            ...messages,
            typingBubble && typingBubble.senderId !== currentUser._id
              ? { _id: 'typing-bubble', isTypingBubble: true }
              : null
          ].filter(Boolean)).map((group, groupIdx) => (
            <div key={group.dateKey || groupIdx}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-2">
                <span
                  className="px-4 py-1 rounded-full bg-base-300 text-xs font-semibold text-base-content/70 shadow-sm cursor-pointer hover:bg-primary/20 transition"
                  onClick={() => setShowDatePicker(true)}
                  title="Jump to date"
                >
                  {group.dateLabel}
                </span>
              </div>
              {/* Messages for this date */}
              {group.messages.map((message, index) => {
                if (message.isTypingBubble) {
                  return (
                    <div
                      key="typing-bubble"
                      className="chat chat-start typing-bubble-animate typing-bubble-visible"
                    >
                      <div className="chat-image avatar">
                        <div className="size-10 rounded-full border">
                          <img src={getAvatarUrl(selectedUser?.profilePic)} alt="profile pic" onError={(e) => { e.target.onerror = null; e.target.src = "/avatar.png"; }} />
                        </div>
                      </div>
                      <div className="chat-bubble flex flex-col relative group">
                        <span className="flex gap-1 items-center">
                          typing
                          <span className="flex gap-0.5">
                            <span className="dot-typing" style={{ animationDelay: '0ms' }}>.</span>
                            <span className="dot-typing" style={{ animationDelay: '150ms' }}>.</span>
                            <span className="dot-typing" style={{ animationDelay: '300ms' }}>.</span>
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                }
                const isOwn = message.senderId === currentUser._id;
                const isDeleted = message.text === "Message deleted";
                const myReaction = message.reactions?.find(r => r.userId === currentUser._id);
                // Assign a data-datekey to the first message of each date group for scrolling
                const isFirstOfDate = index === 0;
                return (
                  <div
                    key={message._id}
                    className={`chat ${isOwn ? "chat-end" : "chat-start"}`}
                    onMouseLeave={() => setShowReactions(r => ({ ...r, [message._id]: false }))}
                    onTouchStart={e => handleTouchStart(message._id, e)}
                    onTouchMove={e => handleTouchMove(message._id, e)}
                    onTouchEnd={() => handleTouchEnd(message._id, message)}
                    style={
                      window.innerWidth >= 320 && window.innerWidth <= 767 && swipeStates[message._id]?.x
                        ? { transform: `translateX(${swipeStates[message._id].x}px)`, transition: swipeStates[message._id].active ? 'transform 0.2s' : undefined }
                        : undefined
                    }
                    {...(isFirstOfDate ? { 'data-datekey': group.dateKey } : {})}
                  >
                    <div className="chat-image avatar">
                      <div className="xxs:size-8 xs:size-9 size-10 rounded-full border">
                        <img
                          src={
                            isOwn
                              ? getAvatarUrl(currentUser.profilePic)
                              : getAvatarUrl(selectedUser.profilePic)
                          }
                          alt="profile pic"
                          onError={(e) => { e.target.onerror = null; e.target.src = "/avatar.png"; }}
                        />
                      </div>
                    </div>

                    <div className="chat-header mb-1 flex items-center gap-2">
                      {/* Replied message snippet at the top of the bubble (improved styling) */}
                      {message.replyTo && (
                        <div className="mb-2 p-2 rounded-t bg-base-100 border-l-4 border-primary/80" style={{ marginLeft: '-0.5rem', marginRight: '-0.5rem' }}>
                          <div className="font-semibold text-primary text-xs mb-0.5">{message.replyTo.senderId?.fullName || 'User'}</div>
                          <div className="xxs:text-[10px] xs:text-xs text-xs text-zinc-500 italic truncate xxs:max-w-[70vw] xs:max-w-[80vw] max-w-xs">
                            {message.replyTo.text || (message.replyTo.image ? '[Image]' : '')}
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className={`chat-bubble flex flex-col relative group transition-colors duration-300 ${isOwn ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'} xxs:max-w-[90vw] xs:max-w-[90vw] sm:max-w-[70%] max-w-[80%] xxs:text-xs xs:text-sm`}
                      onContextMenu={e => {
                        e.preventDefault();
                        setPickerFor(message._id);
                        setPickerPos({ x: e.clientX, y: e.clientY });
                      }}
                    >
                      {/* Swipe-to-reply icon feedback */}
                      {window.innerWidth >= 320 && window.innerWidth <= 767 && swipeStates[message._id]?.x > 20 && !isOwn && (
                        <span className="absolute -left-8 top-1/2 -translate-y-1/2 text-primary text-2xl transition-opacity duration-200 opacity-80">
                          ↩️
                        </span>
                      )}
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Attachment"
                          className='xxs:max-w-[80vw] xs:max-w-[80vw] sm:max-w-[200px] rounded-md mb-2 cursor-pointer'
                          onClick={() => setMediaPreview({ type: 'image', url: message.image })}
                        />
                      )}
                      {message.video && (
                        <div
                          className='xxs:max-w-[80vw] xs:max-w-[80vw] sm:max-w-[200px] max-h-48 rounded-md mb-2 cursor-pointer bg-black flex items-center justify-center relative overflow-hidden'
                          style={{ aspectRatio: '16/9' }}
                          onClick={() => setMediaPreview({ type: 'video', url: message.video })}
                        >
                          <video
                            src={message.video}
                            className='w-full h-full object-contain pointer-events-none select-none'
                            style={{ background: '#000' }}
                            tabIndex={-1}
                            preload='metadata'
                            muted
                            playsInline
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-white text-4xl opacity-80 pointer-events-none">
                            ▶
                          </span>
                        </div>
                      )}
                      {editingId === message._id && !isDeleted ? (
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                            dispatch(editMessage(message._id, editText));
                            setEditingId(null);
                          }}
                          className="flex gap-2 items-center"
                        >
                          <input
                            className="input input-sm w-full text-base-content"
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            autoFocus
                          />
                          <button type="submit" className="btn btn-xs btn-primary">Save</button>
                          <button type="button" className="btn btn-xs" onClick={() => setEditingId(null)}>Cancel</button>
                        </form>
                      ) : (
                        <>
                          {/* Message text and time/tick row at bottom right */}
                          <div className="flex flex-col w-full relative">
                            <span className={isDeleted ? "italic text-zinc-400" : ""} style={{ flex: '1 1 auto' }}>{message.text}</span>
                            {/* Time and ticks row, right-aligned at bottom */}
                            {(isOwn && !isDeleted) ? (
                              <span className="flex items-center justify-end gap-1 text-xs mt-1 pr-1 select-none" style={{ minHeight: 18 }}>
                                {/* (edited) label before time if edited */}
                                {message.edited ? (
                                  <span className="whitespace-nowrap">edited&nbsp;{formatMessageTime(message.createdAt)}</span>
                                ) : (
                                  <span className="whitespace-nowrap">{formatMessageTime(message.createdAt)}</span>
                                )}
                                {message.seen && message.seen.includes(selectedUser._id) ? (
                                  <>
                                    <span title="Seen" className="text-blue-600 dark:text-blue-400 font-bold" style={{ marginRight: -2 }}>✔</span>
                                    <span title="Seen" className="text-blue-600 dark:text-blue-400 font-bold -ml-1">✔</span>
                                  </>
                                ) : (
                                  message.seen && message.seen.length > 0 ? (
                                    <>
                                      <span title="Delivered" className="text-gray-500 dark:text-gray-400 font-bold" style={{ marginRight: -2 }}>✔</span>
                                      <span title="Delivered" className="text-gray-500 dark:text-gray-400 font-bold -ml-1">✔</span>
                                    </>
                                  ) : (
                                    <span title="Sent" className="text-gray-400 dark:text-gray-500 font-bold">✔</span>
                                  )
                                )}
                              </span>
                            ) : (
                              !isOwn && (
                                <span className="flex items-center justify-end text-xs opacity-50 mt-1 pr-1 select-none" style={{ minHeight: 18 }}>
                                  {/* (edited) label before time if edited */}
                                  {message.edited ? (
                                    <span className="whitespace-nowrap">edited&nbsp;{formatMessageTime(message.createdAt)}</span>
                                  ) : (
                                    <span className="whitespace-nowrap">{formatMessageTime(message.createdAt)}</span>
                                  )}
                                </span>
                              )
                            )}
                          </div>
                        </>
                      )}
                      {/* Custom Dropdown for right-click (emoji + delete) */}
                      {pickerFor === message._id && (
                        <div
                          ref={pickerRef}
                          className={
                            `fixed z-30 bg-base-200 border rounded-lg shadow animate-fade-in ` +
                            (window.innerWidth <= 420
                              ? 'p-1 xxs:w-[90vw] xs:w-[90vw] w-[90vw] max-w-[220px] text-xs'
                              : 'p-2 w-auto max-w-xs text-base')
                          }
                          style={{
                            left: pickerAdjustedPos.x,
                            top: pickerAdjustedPos.y,
                            minWidth: 100,
                            maxWidth: window.innerWidth <= 420 ? 220 : 320,
                            width: window.innerWidth <= 420 ? '90vw' : undefined,
                          }}
                        >
                          <div className={window.innerWidth <= 420 ? 'flex gap-0.5 mb-1 justify-center' : 'flex gap-1 mb-1 justify-center'}>
                            {REACTION_EMOJIS.map(emoji => (
                              <button
                                key={emoji}
                                className={window.innerWidth <= 420
                                  ? 'text-base px-1 py-0.5 bg-transparent border-none shadow-none hover:bg-primary/10 rounded'
                                  : 'text-base px-1.5 py-0.5 bg-transparent border-none shadow-none hover:bg-primary/10 rounded'}
                                onClick={() => {
                                  dispatch(reactToMessage(message._id, emoji));
                                  setPickerFor(null);
                                }}
                              >{emoji}</button>
                            ))}
                          </div>
                          <button
                            className={window.innerWidth <= 420
                              ? 'w-full text-left px-1 py-0.5 hover:bg-base-300 rounded mb-1 text-base-content text-xs'
                              : 'w-full text-left px-2 py-1 hover:bg-base-300 rounded mb-1 text-base-content'}
                            onClick={() => {
                              dispatch(setReply(message));
                              setPickerFor(null);
                            }}
                          >Reply</button>
                          {isOwn && !isDeleted && (
                            <button
                              className={window.innerWidth <= 420
                                ? 'w-full text-left px-1 py-0.5 hover:bg-base-300 rounded mb-1 text-base-content text-xs'
                                : 'w-full text-left px-2 py-1 hover:bg-base-300 rounded mb-1 text-base-content'}
                              onClick={() => {
                                setEditingId(message._id);
                                setEditText(message.text);
                                setPickerFor(null);
                              }}
                            >Edit</button>
                          )}
                          {isOwn && !isDeleted && (
                            <button
                              className={window.innerWidth <= 420
                                ? 'w-full text-left text-red-500 px-1 py-0.5 hover:bg-red-100 rounded mt-1 text-xs'
                                : 'w-full text-left text-red-500 px-2 py-1 hover:bg-red-100 rounded mt-1'}
                              onClick={() => {
                                dispatch(deleteMessage(message._id));
                                setPickerFor(null);
                              }}
                            >Delete</button>
                          )}
                        </div>
                      )}
                      {/* Show only current user's reaction at bottom-left */}
                      {!isDeleted && myReaction && (
                        <div className="absolute -bottom-6 left-2 text-base px-1.5 py-0.5" style={{ background: 'none', border: 'none', boxShadow: 'none' }}>
                          {myReaction.emoji}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messageEndRef}></div>
          {/* Jump to latest button */}
          {showJumpToLatest && (
            <button
              className="fixed bottom-24 right-8 z-50 btn btn-circle btn-primary shadow-lg animate-bounce"
              onClick={handleJumpToLatest}
              title="Jump to latest message"
            >
              <ChevronDown className="size-6" />
            </button>
          )}
        </div>
        {/* MessageInput always at bottom on mobile/tablet */}
        <div className="sticky bottom-0 left-0 right-0 bg-base-100 z-30 pt-1 pb-1 sm:static sm:z-auto">
          <MessageInput />
        </div>
      </div>
      {/* Media Preview Modal */}
      {mediaPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setMediaPreview(null)}>
          <div className="relative max-w-full max-h-full w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 z-10 bg-base-200 rounded-full p-1" onClick={() => setMediaPreview(null)}>
              <span style={{ fontSize: 24, fontWeight: 'bold' }}>×</span>
            </button>
            {mediaPreview.type === 'image' ? (
              <img src={mediaPreview.url} alt="Preview" className="max-w-[90vw] max-h-[80vh] w-auto h-auto rounded-lg shadow-lg object-contain" />
            ) : (
              <video
                src={mediaPreview.url}
                controls
                autoPlay
                className="w-[96vw] max-w-[480px] sm:max-w-[90vw] max-h-[80vh] h-auto rounded-lg shadow-lg bg-black object-contain"
                style={{ background: '#000' }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatContainer;

<style>
  {`
.typing-bubble-animate {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.3s cubic-bezier(.4,0,.2,1), transform 0.3s cubic-bezier(.4,0,.2,1);
}
.typing-bubble-visible {
  opacity: 1;
  transform: translateY(0);
}
  `}
</style>;