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
  addMessage
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

export const subscribeToMessages = () => (dispatch, getState) => {
  const { selectedUser } = getState().chat;
  const { socket } = getState().user;

  if (!selectedUser || !socket) return;

  // Remove previous listener if exists
  if (socket.listenerRef) {
    socket.off("newMessage", socket.listenerRef);
  }

  // Define the listener function
  const messageListener = (newMessage) => {
    if (newMessage.senderId === selectedUser._id) {
      dispatch(addMessage(newMessage));
    }
  };

  // Store reference to the function
  socket.listenerRef = messageListener;

  // Subscribe to new messages
  socket.on("newMessage", messageListener);
};

export const unsubscribeFromMessages = () => (dispatch, getState) => {
  const { socket } = getState().user;
  const { selectedUser } = getState().chat;

  if (!socket || !selectedUser) return;

  // Use the stored function reference to properly remove the listener
  socket.off("newMessage", socket.listenerRef);

  // Remove reference after unsubscribing
  socket.listenerRef = null;
};


export default chatSlice.reducer;