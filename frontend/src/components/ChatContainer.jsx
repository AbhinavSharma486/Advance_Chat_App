import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ChatHeader from './ChatHeader';
import MessageInput from "./MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { getMessages, subscribeToMessages, unsubscribeFromMessages } from '../redux/message/chatSlice';
import { formatMessageTime } from '../lib/util.js';


const ChatContainer = () => {
  const dispatch = useDispatch();

  const { messages = [], isMessagesLoading, selectedUser } = useSelector((state) => state.chat);
  const { currentUser } = useSelector((state) => state.user);
  const messageEndRef = useRef(null);

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
          messages.map((message, index) => (
            <div
              key={message._id}
              className={`chat ${message.senderId === currentUser._id ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === currentUser._id
                        ? currentUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              <div className="chat-header mb-1">
                <time className='text-xs opacity-50 ml-1'>
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              <div className="chat-bubble flex flex-col">
                {
                  message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className='sm:max-w-[200px] rounded-md mb-2'
                    />
                  )
                }
                {message.text && <p>{message.text}</p>}
              </div>

            </div>
          ))
        }
        <div ref={messageEndRef}></div>
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;