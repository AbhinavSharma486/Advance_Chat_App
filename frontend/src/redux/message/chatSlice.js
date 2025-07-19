import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import { axiosInstance } from "../../lib/axios.js";

// Initial State 
const initialState = {
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  reply: null,
  typingUser: null, // userId of the user who is typing
  typingBubble: null
};

// Reducers 
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      state.messages = [];
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessageReactions: (state, action) => {
      const { messageId, reactions } = action.payload;
      const msg = state.messages.find(m => m._id === messageId);
      if (msg) msg.reactions = reactions;
    },
    updateMessageEdit: (state, action) => {
      const { messageId, text, edited, editedAt } = action.payload;
      const msg = state.messages.find(m => m._id === messageId);
      if (msg) {
        msg.text = text;
        msg.edited = edited;
        msg.editedAt = editedAt;
      }
    },
    updateMessageDelete: (state, action) => {
      const { messageId } = action.payload;
      const msg = state.messages.find(m => String(m._id) === String(messageId));
      if (msg) {
        msg.text = "Message deleted";
        msg.image = undefined;
        msg.edited = false;
        msg.editedAt = undefined;
      }
    },
    setReply: (state, action) => {
      state.reply = action.payload;
    },
    clearReply: (state) => {
      state.reply = null;
    },
    setTypingUser: (state, action) => {
      state.typingUser = action.payload;
    },
    clearTypingUser: (state) => {
      state.typingUser = null;
    },
    updateMessagesSeen: (state, action) => {
      const { messageIds, by } = action.payload;

      state.messages.forEach(msg => {

        if (messageIds.includes(msg._id)) {

          if (!msg.seen) msg.seen = [];

          if (!msg.seen.includes(by)) msg.seen.push(by);
        }
      });
    },
    addTypingBubble: (state, action) => {
      state.typingBubble = action.payload;
    },
    removeTypingBubble: (state) => {
      state.typingBubble = null;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.isUsersLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isUsersLoading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state) => {
        state.isUsersLoading = false;
      })
      .addCase(getMessages.pending, (state) => {
        state.isMessagesLoading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isMessagesLoading = false;
        state.messages = action.payload;
      })
      .addCase(getMessages.rejected, (state) => {
        state.isMessagesLoading = false;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const {
  setSelectedUser,
  addMessage,
  updateMessageReactions,
  updateMessageEdit,
  updateMessageDelete,
  setReply,
  clearReply,
  setTypingUser,
  clearTypingUser,
  updateMessagesSeen,
  addTypingBubble,
  removeTypingBubble
} = chatSlice.actions;


export const getUsers = createAsyncThunk("chat/getUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/messages/user");
    return response.data;
  } catch (error) {
    console.log(error.response?.data?.message || "Failed to fetch users");
    return rejectWithValue(error.response.data.message);
  }
});

export const getMessages = createAsyncThunk("chat/getMessages", async (userId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/messages/${userId}`);
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to fetch messages");
    return rejectWithValue(error.response.data.message);
  }
});

export const sendMessage = createAsyncThunk("chat/sendMessage", async (messageData, { getState, rejectWithValue }) => {
  const { selectedUser } = getState().chat;

  try {
    const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to send message");
    return rejectWithValue(error.response.data.message);
  }
});

export const reactToMessage = (messageId, emoji) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(`/messages/react/${messageId}`, { emoji });
    dispatch(updateMessageReactions(res.data));
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to react to message");
  }
};

export const editMessage = (messageId, text) => async (dispatch) => {
  try {
    const res = await axiosInstance.put(`/messages/edit/${messageId}`, { text });
    dispatch(updateMessageEdit(res.data));
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to edit message");
  }
};

export const deleteMessage = (messageId) => async (dispatch) => {
  try {
    const res = await axiosInstance.delete(`/messages/delete/${messageId}`);
    dispatch(updateMessageDelete(res.data));
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete message");
  }
};

export const sendTyping = (to) => (dispatch, getState) => {
  const { socket } = getState().user;

  if (socket) socket.emit("typing", { to });
};

export const sendStopTyping = (to) => (dispatch, getState) => {
  const { socket } = getState().user;
  if (socket) socket.emit("stopTyping", { to });
};

export const markMessagesAsSeen = (messageIds) => async (dispatch, getState) => {
  const { socket } = getState().user;
  const { currentUser } = getState().user;

  try {
    await axiosInstance.post("/messages/seen", { messageIds });
    if (socket) socket.emit("messageSeen", { messageIds, by: currentUser._id });
    dispatch(updateMessagesSeen({ messageIds, by: currentUser._id }));
  } catch (error) {
    toast.error(error.response || "Failed to mark messages as seen");
  }
};

export const subscribeToMessages = () => (dispatch, getState) => {
  const { selectedUser } = getState().chat;
  const { socket, currentUser } = getState().user;
  if (!selectedUser || !socket) return;

  // Remove existing listener before adding a new one
  socket.off("newMessage");
  socket.off("messageReaction");
  socket.off("messageEdited");
  socket.off("messageDeleted");
  socket.off("typing");
  socket.off("stopTyping");
  socket.off("messageSeen");

  const messageListener = (newMessage) => {
    if (newMessage.senderId === selectedUser._id) {
      dispatch(addMessage(newMessage));
      dispatch(removeTypingBubble()); // removing typing bubble on new message
    }
  };

  const reactionListner = (data) => {
    dispatch(updateMessageReactions(data));
  };

  const editListner = (data) => {
    dispatch(updateMessageEdit(data));
  };

  const deleteListner = (data) => {
    dispatch(updateMessageDelete(data));
  };

  const typingListener = (data) => {
    dispatch(setTypingUser(data.from));

    // add typing bubble
    dispatch(addTypingBubble({
      _id: 'typing',
      senderId: data.from,
      receiverId: currentUser._id,
      isTyping: true
    }));
  };

  const stopTypingListener = () => {
    dispatch(clearTypingUser());
    dispatch(removeTypingBubble());
  };

  const seenListener = (data) => {
    dispatch(updateMessagesSeen(data));
  };

  socket.on("newMessage", messageListener);
  socket.on("messageReaction", reactionListner);
  socket.on("messageEdited", editListner);
  socket.on("messageDeleted", deleteListner);
  socket.on("typing", typingListener);
  socket.on("stopTyping", stopTypingListener);
  socket.on("messageSeen", seenListener);
};

export const unsubscribeFromMessages = () => (dispatch, getState) => {
  const { socket } = getState().user;
  if (!socket) return;

  socket.off("newMessage");
  socket.off("messageReaction");
  socket.off("messageEdited");
  socket.off("messageDeleted");
};


export default chatSlice.reducer;