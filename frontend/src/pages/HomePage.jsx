import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";

import ChatContainer from '../components/ChatContainer';
import NoChatSelected from '../components/NoChatSelected';
import Sidebar from '../components/Sidebar';

const HomePage = () => {
  const { selectedUser } = useSelector((state) => state.chat);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Auto show chat on mobile when selectedUser changes
  useEffect(() => {
    if (window.innerWidth < 768 && selectedUser) {
      setShowMobileChat(true);
    }
  }, [selectedUser]);

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center md:pt-20 px-0 sm:px-4 h-screen md:h-auto">
        <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-screen md:h-[calc(100vh-8rem)] min-h-screen md:min-h-0">
          {/* Desktop (md+) layout: sidebar + chat */}
          <div className="hidden md:flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
          {/* Mobile layout: only one visible at a time */}
          <div className="flex md:hidden h-full rounded-lg overflow-hidden">
            {/* Show Sidebar if no chat selected or showMobileChat is false */}
            {(!selectedUser || !showMobileChat) && (
              <Sidebar setShowMobileChat={setShowMobileChat} />
            )}
            {/* Show ChatContainer if chat selected and showMobileChat is true */}
            {selectedUser && showMobileChat && (
              <ChatContainer setShowMobileChat={setShowMobileChat} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;