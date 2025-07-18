import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ChatHeader from './ChatHeader';
import MessageInput from "./MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { getMessages, subscribeToMessages, unsubscribeFromMessages, reactToMessage, editMessage, deleteMessage, setReply } from '../redux/message/chatSlice';
import { formatMessageTime, REACTION_EMOJIS } from '../lib/util.js';


const ChatContainer = () => {
  const dispatch = useDispatch();

  const { messages = [], isMessagesLoading, selectedUser } = useSelector((state) => state.chat);
  const { currentUser } = useSelector((state) => state.user);
  const messageEndRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showReactions, setShowReactions] = useState({});
  const [pickerFor, setPickerFor] = useState(null);
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 });
  const pickerRef = useRef();

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

      dispatch(unsubscribeFromMessages());
      dispatch(subscribeToMessages(selectedUser._id));
    }

    return () => {
      dispatch(unsubscribeFromMessages());
    };

  }, [selectedUser, dispatch]);

  // 🔹 NEW: Subscribe on page reload when currentUser is available
  useEffect(() => {
    if (currentUser?._id) {
      dispatch(subscribeToMessages());
    }

    return () => {
      dispatch(unsubscribeFromMessages());
    };
  }, [currentUser, dispatch]);


  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {
          messages.map((message, index) => {
            const isOwn = message.senderId === currentUser._id;
            const isDeleted = message.text === "Message deleted";
            const myReaction = message.reactions?.find(r => r.userId === currentUser._id);
            return (
              <div
                key={message._id}
                className={`chat ${isOwn ? "chat-end" : "chat-start"}`}
                onContextMenu={e => {
                  e.preventDefault();
                  setPickerFor(message._id);
                  setPickerPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setShowReactions(r => ({ ...r, [message._id]: false }))}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        isOwn
                          ? currentUser.profilePic || "/avatar.png"
                          : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                    />
                  </div>
                </div>

                <div className="chat-header mb-1 flex items-center gap-2">
                  {message.edited && !isDeleted && (
                    <span className="text-xs text-yellow-400 ml-1">(edited)</span>
                  )}
                </div>

                <div className="chat-bubble flex flex-col relative group">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className='sm:max-w-[200px] rounded-md mb-2'
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
                        className="input input-sm"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        autoFocus
                      />
                      <button type="submit" className="btn btn-xs btn-primary">Save</button>
                      <button type="button" className="btn btn-xs" onClick={() => setEditingId(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      {/* Replied message snippet at the top of the bubble (improved styling) */}
                      {message.replyTo && (
                        <div className="mb-2 p-2 rounded-t bg-base-100 border-l-4 border-primary/80" style={{ marginLeft: '-0.5rem', marginRight: '-0.5rem' }}>
                          <div className="font-semibold text-primary text-xs mb-0.5">{message.replyTo.senderId?.fullName || 'User'}</div>
                          <div className="text-xs text-zinc-500 italic truncate max-w-xs">
                            {message.replyTo.text || (message.replyTo.image ? '[Image]' : '')}
                          </div>
                        </div>
                      )}
                      {/* Message text and time in a row, time at right */}
                      <div className="flex items-end w-full">
                        <span className={isDeleted ? "italic text-zinc-400" : ""} style={{ flex: '1 1 auto' }}>{message.text}</span>
                        <span style={{ minWidth: 8 }} />
                        <span className="text-xs opacity-50 ml-2 whitespace-nowrap" style={{ flex: 'none' }}>{formatMessageTime(message.createdAt)}</span>
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
                        className="w-full text-left px-2 py-1 hover:bg-base-300 rounded mb-1"
                        onClick={() => {
                          dispatch(setReply(message));
                          setPickerFor(null);
                        }}
                      >Reply</button>
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
          })
        }
        <div ref={messageEndRef}></div>
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;