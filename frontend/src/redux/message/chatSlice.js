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
  typingUsers: {}, // { [userId]: true/false }
  typingBubble: null,
  sidebarLastMessages: {}, // { [userId]: lastMessage }
};

// Reducers 
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      state.messages = [];
      state.typingBubble = null; // Only clear typing bubble when switching chats
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateSidebarLastMessage: (state, action) => {
      const msg = action.payload;
      // Always update for both sender and receiver
      if (msg.senderId && msg.receiverId) {
        state.sidebarLastMessages[msg.senderId] = msg;
        state.sidebarLastMessages[msg.receiverId] = msg;
      }
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
      if (!state.typingUsers) state.typingUsers = {};
      state.typingUsers[action.payload] = true;
    },
    clearTypingUser: (state, action) => {
      if (!state.typingUsers) state.typingUsers = {};
      if (action && action.payload) {
        delete state.typingUsers[action.payload];
      } else {
        state.typingUsers = {};
      }
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
        // Force update sidebar last message for both sender and receiver
        const msg = action.payload;
        if (msg.senderId && msg.receiverId) {
          state.sidebarLastMessages[msg.senderId] = msg;
          state.sidebarLastMessages[msg.receiverId] = msg;
        }
      })
      .addCase(getLastMessagesForSidebar.fulfilled, (state, action) => {
        // action.payload: [{ userId, lastMessage }]
        const map = {};
        for (const item of action.payload) {
          map[item.userId] = item.lastMessage;
        }
        state.sidebarLastMessages = map;
      });
  },
});

export const {
  setSelectedUser,
  addMessage,
  updateSidebarLastMessage,
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

  if (socket) {
    socket.emit("typing", { to });
  }
};

export const sendStopTyping = (to) => (dispatch, getState) => {
  const { socket } = getState().user;
  if (socket) {
    socket.emit("stopTyping", { to });
  }
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
  if (!socket) return;

  // Remove existing listener before adding a new one
  socket.off("newMessage");
  socket.off("messageReaction");
  socket.off("messageEdited");
  socket.off("messageDeleted");
  socket.off("typing");
  socket.off("stopTyping");
  socket.off("messageSeen");

  const messageListener = (newMessage) => {
    const { selectedUser } = getState().chat;
    const { currentUser } = getState().user;
    // Show message if it's for the current open chat (either sent or received)
    if (
      selectedUser &&
      (
        (newMessage.senderId === selectedUser._id && newMessage.receiverId === currentUser._id) ||
        (newMessage.senderId === currentUser._id && newMessage.receiverId === selectedUser._id)
      )
    ) {
      dispatch(addMessage(newMessage));
      dispatch(removeTypingBubble());
    }
    // Always update sidebar last message for both users
    dispatch(updateSidebarLastMessage(newMessage));
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
    // Always set typing for this user (for sidebar/header)
    dispatch(setTypingUser(data.from));
    // Only show typing bubble if the event is from the currently selected user
    const { selectedUser } = getState().chat;
    const { currentUser } = getState().user;
    if (selectedUser && data.from === selectedUser._id) {
      dispatch(addTypingBubble({
        _id: 'typing',
        senderId: data.from,
        receiverId: currentUser._id,
        isTyping: true
      }));
    }
  };

  const stopTypingListener = (data) => {
    // Always clear typing for this user (for sidebar/header)
    if (data && data.from) {
      dispatch(clearTypingUser(data.from));
    }
    // Only remove typing bubble if the event is from the currently selected user
    const { selectedUser } = getState().chat;
    if (selectedUser && data && data.from === selectedUser._id) {
      dispatch(removeTypingBubble());
    }
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
  socket.off("typing"); // Ensure typing event is removed
  socket.off("stopTyping"); // Ensure stopTyping event is removed
  socket.off("messageSeen");
};

export const getLastMessagesForSidebar = createAsyncThunk(
  "chat/getLastMessagesForSidebar",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/messages/last-messages");
      return res.data; // [{ userId, lastMessage: {...} }]
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch last messages");
    }
  }
);


export default chatSlice.reducer;