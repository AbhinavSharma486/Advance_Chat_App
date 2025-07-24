import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Calendar, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { setSelectedUser } from '../redux/message/chatSlice';
import { getAvatarUrl } from '../lib/util';


const ChatHeader = ({ onOpenDatePicker, onDeleteChat }) => {
  const dispatch = useDispatch();

  const { selectedUser, typingUsers = {} } = useSelector((state) => state.chat);
  const onlineUsers = useSelector((state) => state.user?.onlineUsers) || [];
  // Map for quick lookup
  const onlineUserMap = Object.fromEntries(onlineUsers.map(u => [u.userId, u.onlineAt]));

  // Dropdown state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div className='p-2.5 border-b border-base-300'>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">

          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={getAvatarUrl(selectedUser?.profilePic)}
                alt={selectedUser?.fullName}
                onError={(e) => { e.target.onerror = null; e.target.src = "/avatar.png"; }}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className='text-sm text-base-content/70 h-5 flex items-center'>
              {typingUsers[selectedUser._id] ? (
                <span className="flex items-center gap-1">
                  {onlineUserMap[selectedUser._id] && (
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 ring-2 ring-zinc-900" title="Online"></span>
                  )}
                  typing
                  <span className="flex gap-0.5 ml-1">
                    <span className="dot-typing-header" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="dot-typing-header" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="dot-typing-header" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  {onlineUserMap[selectedUser._id] && (
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 ring-2 ring-zinc-900" title="Online"></span>
                  )}
                  {onlineUserMap[selectedUser._id] ? "Online" : "Offline"}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative">
          {/* Calendar button */}
          <button onClick={onOpenDatePicker} title="Jump to date" className="btn btn-ghost btn-sm">
            <Calendar className="size-5" />
          </button>
          {/* Three-dot menu */}
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} title="More options" className="btn btn-ghost btn-sm">
              <MoreVertical className="size-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-base-100 border border-base-200 rounded shadow-lg z-50">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-base-200 text-red-600"
                  onClick={() => {
                    setMenuOpen(false);
                    if (onDeleteChat) onDeleteChat();
                  }}
                >
                  Delete Chat
                </button>
              </div>
            )}
          </div>
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