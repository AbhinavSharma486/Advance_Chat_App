import React, { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { getAvatarUrl } from '../lib/util';
import { setSelectedUserForPreview } from '../redux/user/userSlice';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.15;

const UserProfilePreview = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.selectedUserForPreview);
  const onlineUsers = useSelector(state => state.user.onlineUsers) || [];
  const [scale, setScale] = useState(1);
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const imgRef = useRef(null);
  if (!user) return null;
  const isOnline = onlineUsers.some(u => u.userId === user._id);

  // Mouse wheel zoom (desktop/laptop)
  const handleWheel = (e) => {
    if (e.ctrlKey) return; // Let browser zoom if ctrl is pressed
    e.preventDefault();
    let newScale = scale + (e.deltaY < 0 ? SCALE_STEP : -SCALE_STEP);
    newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    setScale(newScale);
  };

  // Pinch zoom (mobile/tablet)
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = getTouchDistance(e.touches);
      setLastTouchDistance(dist);
    }
  };
  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDistance) {
      const dist = getTouchDistance(e.touches);
      let newScale = scale * (dist / lastTouchDistance);
      newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      setScale(newScale);
      setLastTouchDistance(dist);
    }
  };
  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) setLastTouchDistance(null);
  };
  function getTouchDistance(touches) {
    const [a, b] = touches;
    return Math.sqrt(
      Math.pow(a.clientX - b.clientX, 2) + Math.pow(a.clientY - b.clientY, 2)
    );
  }

  // Double click/tap to reset zoom
  const handleDoubleClick = () => setScale(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-base-100 rounded-xl shadow-lg p-8 w-full max-w-xs flex flex-col items-center">
        <button
          className="absolute top-3 right-3 text-base-content/60 hover:text-base-content"
          onClick={() => dispatch(setSelectedUserForPreview(null))}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="mb-4 select-none">
          <img
            ref={imgRef}
            src={user.highResAvatar || user.profilePic}
            alt={user.fullName}
            className="w-24 h-24 rounded-full object-cover border-4 border-primary shadow"
            onError={e => { e.target.onerror = null; e.target.src = '/avatar.png'; }}
            style={{
              transform: `scale(${scale})`,
              transition: 'transform 0.2s',
              touchAction: 'none',
              cursor: scale > 1 ? 'grab' : 'pointer',
            }}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleClick}
            draggable={false}
          />
          {scale > 1 && (
            <button
              className="absolute top-2 left-2 bg-base-200 px-2 py-1 rounded text-xs"
              style={{ zIndex: 10 }}
              onClick={handleDoubleClick}
            >
              Reset Zoom
            </button>
          )}
        </div>
        <h2 className="text-xl font-semibold mb-2 text-center">{user.fullName}</h2>
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-block w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-zinc-400'} ring-2 ring-zinc-900`}></span>
          <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        {/* You can add more public info here if needed */}
      </div>
    </div>
  );
};

export default UserProfilePreview; 