import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

import { sendMessage, clearReply, sendTyping, sendStopTyping } from '../redux/message/chatSlice.js';


const MessageInput = () => {
  const dispatch = useDispatch();
  const reply = useSelector(state => state.chat.reply);
  const { selectedUser } = useSelector(state => state.chat);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const [text, setText] = useState("");
  const [mediaPreview, setMediaPreview] = useState(null); // { type, url }
  const fileInputRef = useRef(null);

  // Cleanup: send stopTyping when unmounting or switching user
  useEffect(() => {
    return () => {
      if (selectedUser?._id) {
        dispatch(sendStopTyping(selectedUser._id));
      }
    };
  }, [selectedUser, dispatch]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview({ type: isImage ? 'image' : 'video', url: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTyping = (e) => {
    setText(e.target.value);

    if (selectedUser?._id) {
      dispatch(sendTyping(selectedUser._id));
      if (typingTimeout) clearTimeout(typingTimeout);
      setTypingTimeout(setTimeout(() => {
        dispatch(sendStopTyping(selectedUser._id));
      }, 3000)); // Increased from 1000ms to 3000ms
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() && !mediaPreview) return;

    try {
      dispatch(sendMessage({
        text: text.trim(),
        image: mediaPreview?.type === 'image' ? mediaPreview.url : undefined,
        video: mediaPreview?.type === 'video' ? mediaPreview.url : undefined,
        replyTo: reply?._id || null,
      }));

      // clear form
      setText("");
      setMediaPreview(null);

      if (fileInputRef.current) fileInputRef.current.value = "";
      dispatch(clearReply());
    } catch (error) {
      console.log("Failed to send message : ", error);
    }
  };


  return (
    <div className='p-4 w-full'>
      {/* Reply Preview */}
      {reply && (
        <div className="mb-2 p-2 rounded bg-base-200 border-l-4 border-primary flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-500">Replying to {reply.senderId?.fullName || 'User'}</div>
            <div className="text-sm font-medium truncate max-w-xs">
              {reply.text || (reply.image ? '[Image]' : '')}
            </div>
          </div>
          <button className="btn btn-xs btn-ghost ml-2" onClick={() => dispatch(clearReply())}><X size={16} /></button>
        </div>
      )}
      {mediaPreview && (
        <div className='mb-3 flex items-center gap-2'>
          <div className="relative">
            {mediaPreview.type === 'image' ? (
              <img
                src={mediaPreview.url}
                alt="Preview"
                className='w-20 h-20 object-cover rounded-lg border border-zinc-700'
              />
            ) : (
              <video
                src={mediaPreview.url}
                controls
                className='w-28 h-20 object-cover rounded-lg border border-zinc-700'
              />
            )}
            <button
              onClick={removeMedia}
              className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center'
              type='button'
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className='flex items-center gap-2 flex-wrap sm:flex-nowrap'>
        <div className="flex-1 flex gap-2 min-w-0">
          <input
            type="text"
            className='w-full input input-bordered rounded-lg input-sm sm:input-md min-w-0'
            placeholder='Type a message...'
            value={text}
            onChange={handleTyping}
          />

          <input
            type='file'
            accept='image/*,video/*'
            className='hidden'
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button
            type='button'
            className={`flex btn btn-circle btn-sm ${mediaPreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload image or video"
          >
            <Image size={20} />
          </button>
        </div>

        <button
          type='submit'
          className={`btn btn-sm btn-circle mt-2 sm:mt-0 ${(!text.trim() && !mediaPreview) ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!text.trim() && !mediaPreview}
          aria-label="Send message"
        >
          <Send size={22} />
        </button>

      </form>
    </div>
  );
};

export default MessageInput;