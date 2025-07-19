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
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Cleanup: send stopTyping when unmounting or switching user
  useEffect(() => {
    return () => {
      if (selectedUser?._id) {
        dispatch(sendStopTyping(selectedUser._id));
      }
    };
  }, [selectedUser, dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

    if (!text.trim() && !imagePreview) return;

    try {
      dispatch(sendMessage({
        text: text.trim(),
        image: imagePreview,
      }));

      // clear form
      setText("");
      setImagePreview(null);

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
      {
        imagePreview && (
          <div className='mb-3 flex items-center gap-2'>
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className='w-20 h-20 object-cover rounded-lg border border-zinc-700'
              />
              <button
                onClick={removeImage}
                className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center'
                type='button'
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )
      }

      <form onSubmit={handleSendMessage} className='flex items-center gap-2'>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className='w-full input input-bordered rounded-lg input-sm sm:input-md'
            placeholder='Type a message...'
            value={text}
            onChange={handleTyping}
          />

          <input
            type='file'
            accept='image/*'
            className='hidden'
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type='button'
            className={`hidden sm:flex btn btn-circle btn-sm
              ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        <button
          type='submit'
          className={`btn btn-sm btn-circle ${(!text.trim() && !imagePreview) ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>

      </form>
    </div>
  );
};

export default MessageInput;