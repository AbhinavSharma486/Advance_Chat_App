import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ChatHeader from './ChatHeader';
import MessageInput from "./MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { getMessages, subscribeToMessages, unsubscribeFromMessages, reactToMessage, editMessage, deleteMessage, setReply, markMessagesAsSeen } from '../redux/message/chatSlice';
import { formatMessageTime, REACTION_EMOJIS, groupMessagesByDate, getAvatarUrl } from '../lib/util.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ChevronDown, ArrowLeft } from 'lucide-react';


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
  const theme = useSelector((state) => state.theme.theme);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const chatAreaRef = useRef(null);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [swipeStates, setSwipeStates] = useState({}); // { [msgId]: { x, active } }

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


  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingBubble]);

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
    const el = document.querySelector(`[data-datekey='${dateKey}']`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-base-100 p-4 rounded-lg shadow-lg relative">
            <button className="absolute top-2 right-2 btn btn-xs btn-circle" onClick={handleCloseDatePicker}>✕</button>
            <DatePicker
              inline
              selected={selectedDate}
              onChange={handleDateSelect}
              maxDate={new Date()}
              calendarClassName="!bg-base-100"
            />
          </div>
        </div>
      )}
      {/* Remove any absolute debug box */}
      <div className='flex-1 flex flex-col'>
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
        <ChatHeader onOpenDatePicker={handleOpenDatePicker} />
        {/* Scrollable chat area: messages + typing bubble + scroll ref */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 pb-4 bg-base-100 transition-colors duration-300"
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
                      <div className="size-10 rounded-full border">
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
                          <div className="text-xs text-zinc-500 italic truncate max-w-xs">
                            {message.replyTo.text || (message.replyTo.image ? '[Image]' : '')}
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className={`chat-bubble flex flex-col relative group transition-colors duration-300 ${isOwn ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'}`}
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
                          className='sm:max-w-[200px] rounded-md mb-2'
                        />
                      )}
                      {message.video && (
                        <video
                          src={message.video}
                          controls
                          className='sm:max-w-[200px] max-h-48 rounded-md mb-2'
                          style={{ background: '#000' }}
                        />
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
                              <span className="flex items-center justify-end gap-1 text-xs opacity-50 mt-1 pr-1 select-none" style={{ minHeight: 18 }}>
                                {/* (edited) label before time if edited */}
                                {message.edited ? (
                                  <span className="whitespace-nowrap">edited&nbsp;{formatMessageTime(message.createdAt)}</span>
                                ) : (
                                  <span className="whitespace-nowrap">{formatMessageTime(message.createdAt)}</span>
                                )}
                                {message.seen && message.seen.includes(selectedUser._id) ? (
                                  <>
                                    <span title="Seen" className="text-blue-500 dark:text-blue-400" style={{ marginRight: -2 }}>✔</span>
                                    <span title="Seen" className="text-blue-500 dark:text-blue-400 -ml-1">✔</span>
                                  </>
                                ) : (
                                  message.seen && message.seen.length > 0 ? (
                                    <>
                                      <span title="Delivered" className="text-zinc-400 dark:text-zinc-500" style={{ marginRight: -2 }}>✔</span>
                                      <span title="Delivered" className="text-zinc-400 dark:text-zinc-500 -ml-1">✔</span>
                                    </>
                                  ) : (
                                    <span title="Sent" className="text-zinc-400 dark:text-zinc-500">✔</span>
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
                          className="fixed z-30 bg-base-200 border rounded-lg shadow p-2 animate-fade-in"
                          style={{ left: pickerPos.x, top: pickerPos.y, minWidth: 120 }}
                        >
                          <div className="flex gap-1 mb-1 justify-center">
                            {REACTION_EMOJIS.map(emoji => (
                              <button
                                key={emoji}
                                className="text-base px-1.5 py-0.5 bg-transparent border-none shadow-none hover:bg-primary/10 rounded"
                                onClick={() => {
                                  dispatch(reactToMessage(message._id, emoji));
                                  setPickerFor(null);
                                }}
                              >{emoji}</button>
                            ))}
                          </div>
                          <button
                            className="w-full text-left px-2 py-1 hover:bg-base-300 rounded mb-1 text-base-content"
                            onClick={() => {
                              dispatch(setReply(message));
                              setPickerFor(null);
                            }}
                          >Reply</button>
                          {isOwn && !isDeleted && (
                            <button
                              className="w-full text-left px-2 py-1 hover:bg-base-300 rounded mb-1 text-base-content"
                              onClick={() => {
                                setEditingId(message._id);
                                setEditText(message.text);
                                setPickerFor(null);
                              }}
                            >Edit</button>
                          )}
                          {isOwn && !isDeleted && (
                            <button
                              className="w-full text-left text-red-500 px-2 py-1 hover:bg-red-100 rounded mt-1"
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
        <MessageInput />
      </div>
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