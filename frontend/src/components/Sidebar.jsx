import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Users } from 'lucide-react';

import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { getUsers, setSelectedUser } from '../redux/message/chatSlice';
import { getAvatarUrl } from '../lib/util';


const Sidebar = () => {
  const dispatch = useDispatch();

  const { users, selectedUser, isUsersLoading, typingUsers = {} } = useSelector((state) => state.chat);
  const { onlineUsers = [] } = useSelector((state) => state.user || {});

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    dispatch(getUsers());
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
  const filteredUsers = showOnlineOnly ? sortedUsers.filter(user => onlineUserMap[user._id]) : sortedUsers;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 md:w-52 border-r border-base-300 flex flex-col transition-all duration-200">
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
          filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => dispatch(setSelectedUser(user))}
              className={`
                w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors
                ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                `}
            >
              <div className="relative mx-auto lg:mx-0 md:mx-0">
                <img
                  src={getAvatarUrl(user.profilePic)}
                  alt={user.name}
                  className="size-12 object-cover rounded-full"
                  onError={(e) => { e.target.onerror = null; e.target.src = "/avatar.png"; }}
                />
                {
                  onlineUserMap[user._id] && (
                    <span
                      className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900"
                    />
                  )
                }
              </div>

              { /* User info - only visible on larger screens */}
              <div className="hidden lg:block md:block text-left min-w-0">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400 h-5 flex items-center">
                  {typingUsers[user._id] ? (
                    <span className="flex items-center gap-1">typing
                      <span className="flex gap-0.5 ml-1">
                        <span className="dot-typing-header" style={{ animationDelay: '0ms' }}>.</span>
                        <span className="dot-typing-header" style={{ animationDelay: '150ms' }}>.</span>
                        <span className="dot-typing-header" style={{ animationDelay: '300ms' }}>.</span>
                      </span>
                    </span>
                  ) : (
                    onlineUserMap[user._id] ? "Online" : "Offline"
                  )}
                </div>
              </div>
            </button>
          ))
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