import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Calendar } from 'lucide-react';

import { setSelectedUser } from '../redux/message/chatSlice';


const ChatHeader = ({ onOpenDatePicker }) => {
  const dispatch = useDispatch();

  const { selectedUser, typingUsers = {} } = useSelector((state) => state.chat);
  const onlineUsers = useSelector((state) => state.user?.onlineUsers) || [];

  return (
    <div className='p-2.5 border-b border-base-300'>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">

          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser?.profilePic || "/avatar.png"}
                alt={selectedUser?.fullName}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className='text-sm text-base-content/70 h-5 flex items-center'>
              {typingUsers[selectedUser._id] ? (
                <span className="flex items-center gap-1">typing
                  <span className="flex gap-0.5 ml-1">
                    <span className="dot-typing-header" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="dot-typing-header" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="dot-typing-header" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                </span>
              ) : (
                onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Calendar button */}
          <button onClick={onOpenDatePicker} title="Jump to date" className="btn btn-ghost btn-sm">
            <Calendar className="size-5" />
          </button>
          {/* Close button */}
          <button onClick={() => dispatch(setSelectedUser(null))}>
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;

<style>
  {`
  .dot-typing-header {
    display: inline-block;
    font-size: 1.2em;
    opacity: 0.7;
    animation: typing-bounce-header 1s infinite both;
  }
  @keyframes typing-bounce-header {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
    40% { transform: translateY(-4px); opacity: 1; }
  }
  `}
</style>;