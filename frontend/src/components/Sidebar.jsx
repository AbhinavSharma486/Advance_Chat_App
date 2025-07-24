import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Users } from 'lucide-react';

import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { getUsers, setSelectedUser, getLastMessagesForSidebar } from '../redux/message/chatSlice';
import { getAvatarUrl } from '../lib/util';
import { setSelectedUserForPreview } from '../redux/user/userSlice';


const Sidebar = ({ setShowMobileChat }) => {
  const dispatch = useDispatch();

  const { users, selectedUser, isUsersLoading, typingUsers = {}, sidebarLastMessages, sidebarUnreadCounts } = useSelector(
    (state) => state.chat,
    shallowEqual
  );
  const { onlineUsers = [] } = useSelector((state) => state.user || {});

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    dispatch(getUsers());
    // Remove getLastMessagesForSidebar from here, rely on real-time updates
  }, [dispatch]);

  // Map for quick lookup
  const onlineUserMap = Object.fromEntries(onlineUsers.map(u => [u.userId, u.onlineAt]));
  // Sort users: online at top (by onlineAt desc), then offline
  const sortedUsers = [...users].sort((a, b) => {
    const aOnline = onlineUserMap[a._id];
    const bOnline = onlineUserMap[b._id];
    if (aOnline && bOnline) {
      return bOnline - aOnline; // Most recent online first
    } else if (aOnline) {
      return -1;
    } else if (bOnline) {
      return 1;
    } else {
      return 0;
    }
  });
  let filteredUsers = showOnlineOnly ? sortedUsers.filter(user => onlineUserMap[user._id]) : sortedUsers;
  // Sort by last message time (desc), users with no message at bottom
  filteredUsers = [...filteredUsers].sort((a, b) => {
    const aMsg = sidebarLastMessages?.[String(a._id)];
    const bMsg = sidebarLastMessages?.[String(b._id)];
    if (!aMsg && !bMsg) return 0;
    if (!aMsg) return 1;
    if (!bMsg) return -1;
    return new Date(bMsg.createdAt) - new Date(aMsg.createdAt);
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  // Helper to format time (e.g. 12:34 PM)
  function formatLastMsgTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
    }
  }

  return (
    <aside className="h-full w-full sm:w-64 md:w-52 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 flex-shrink-0">
      <div className="border-b border-base-300 w-full p-5">

        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block md:block">Contacts</span>
        </div>

        { /* Online filter toogle */}
        <div className="mt-3 lg:flex hidden items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-sm text-zinc-500">({onlineUsers.length > 0 ? onlineUsers.length - 1 : 0} online)</span>
        </div>

      </div>

      <div className="overflow-y-auto w-full py-3">
        {
          filteredUsers.map((user) => {
            // Use sidebarLastMessages for preview
            const lastMsg = sidebarLastMessages?.[String(user._id)] || null;
            const unreadCount = sidebarUnreadCounts?.[String(user._id)] || 0;
            return (
              <button
                key={user._id}
                onClick={() => {
                  dispatch(setSelectedUser(user));
                  if (setShowMobileChat && window.innerWidth < 768) {
                    setShowMobileChat(true);
                  }
                }}
                className={`
                  w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors
                  ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                `}
              >
                {/* Avatar */}
                <div className="relative mx-auto lg:mx-0 md:mx-0 flex-shrink-0" onClick={e => {
                  e.stopPropagation();
                  // Pass both small and original avatar URLs for preview
                  dispatch(setSelectedUserForPreview({
                    ...user,
                    smallAvatar: user.profilePic ? user.profilePic.replace('/upload/', '/upload/w_96,h_96,c_fill/') : user.profilePic,
                    highResAvatar: user.profilePic // original 400x400
                  }));
                }} style={{ cursor: 'pointer' }}>
                  <img
                    src={user.profilePic ? user.profilePic.replace('/upload/', '/upload/w_96,h_96,c_fill/') : user.profilePic}
                    alt={user.name}
                    className="size-12 object-cover rounded-full"
                    onError={(e) => { e.target.onerror = null; e.target.src = "/avatar.png"; }}
                  />
                  {onlineUserMap[user._id] && (
                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                  )}
                </div>
                {/* WhatsApp style row layout for all screens, responsive spacing */}
                <div className="flex flex-1 min-w-0 flex-row items-center justify-between text-left">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium truncate text-base sm:text-sm">{user.fullName}</span>
                    <span className="text-xs text-zinc-400 h-5 flex items-center min-w-0">
                      {typingUsers[user._id] ? (
                        <span className="flex items-center gap-1">typing
                          <span className="flex gap-0.5 ml-1">
                            <span className="dot-typing-header" style={{ animationDelay: '0ms' }}>.</span>
                            <span className="dot-typing-header" style={{ animationDelay: '150ms' }}>.</span>
                            <span className="dot-typing-header" style={{ animationDelay: '300ms' }}>.</span>
                          </span>
                        </span>
                      ) : lastMsg ? (
                        <span className={`truncate max-w-[140px] block ${unreadCount > 0 ? 'font-semibold text-primary' : ''}`}>{lastMsg.text || (lastMsg.image ? '📷 Photo' : 'Message')}</span>
                      ) : (
                        <span className="truncate max-w-[140px] block">No messages yet</span>
                      )}
                    </span>
                  </div>
                  {/* Last message time and unread badge */}
                  <div className="flex flex-col items-end ml-2 min-w-[28px]">
                    {lastMsg && lastMsg.createdAt && (
                      <span className="text-[11px] text-zinc-400 flex-shrink-0 whitespace-nowrap">{formatLastMsgTime(lastMsg.createdAt)}</span>
                    )}
                    {unreadCount > 0 && (
                      <span className="mt-1 inline-flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold min-w-[20px] h-5 px-1.5 shadow">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        }

        {
          filteredUsers.length === 0 && (
            <div className="text-center text-zinc-500 py-4">No online users</div>
          )
        }
      </div>

    </aside>
  );
};

export default Sidebar;

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