import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

import { axiosInstance } from "../../lib/axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";


const initialState = {
  currentUser: null,
  error: null,
  loading: false,
  isSignInUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [], // [{ userId, onlineAt }]
  socket: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signUpStart: (state) => {
      state.loading = true;
      state.error = null;
      state.isSignInUp = true;
    },
    signUpSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
      state.isSignInUp = false;
    },
    signUpFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isSignInUp = false;
    },
    logInStart: (state) => {
      state.loading = true;
      state.error = null;
      state.isLoggingIn = true;
    },
    logInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
      state.isLoggingIn = false;
    },
    logInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isLoggingIn = false;
    },
    logoutSuccess: (state) => {
      state.currentUser = null;
      state.error = null;
      state.loading = false;
      state.socket = null;
    },
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setCheckAuth: (state) => {
      state.isCheckingAuth = true;
      state.isLoggingIn = false;
    },
    setCheckAuthComplete: (state) => {
      state.isCheckingAuth = false;
    },
    forgotPasswordStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    forgotPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetPasswordStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    resetPasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    resetPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    verifyEmailStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    verifyEmailSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.currentUser = action.payload;
    },
    verifyEmailFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateProfileStart: (state) => {
      state.loading = true;
      state.error = null;
      state.isUpdatingProfile = true;
    },
    updateProfileSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.currentUser = action.payload;
      state.isUpdatingProfile = false;
    },
    updateProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isUpdatingProfile = false;
    },
    deleteProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteProfileSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    deleteProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload; // [{ userId, onlineAt }]
    },
    connectSocket: (state, action) => {
      state.socket = action.payload;
    },
    disconnectSocket: (state) => {
      state.socket = null;
    }
  }
});

export const {
  signUpStart,
  signUpSuccess,
  signUpFailure,
  logInStart,
  logInSuccess,
  logInFailure,
  logoutSuccess,
  setUser,
  setCheckAuth,
  setCheckAuthComplete,
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
  verifyEmailStart,
  verifyEmailSuccess,
  verifyEmailFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  deleteProfileStart,
  deleteProfileSuccess,
  deleteProfileFailure,
  setOnlineUsers,
  connectSocket,
  disconnectSocket
} = userSlice.actions;

export const signup = (data, navigate) => async (dispatch) => {
  dispatch(signUpStart());

  try {
    const res = await axiosInstance.post("/auth/signup", data);

    dispatch(signUpSuccess(res.data));
    dispatch(connectSocketThunk());
    navigate("/verify-email");
    toast.success("OTP has been sent to your email");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Signup failed";
    dispatch(signUpFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const verifyEmail = (code, navigate) => async (dispatch) => {
  dispatch(verifyEmailStart());

  try {
    const response = await axiosInstance.post("/auth/verify-email", { code });
    dispatch(verifyEmailSuccess(response.data.user));
    dispatch(connectSocketThunk());
    navigate("/");
    toast.success("Account created successfully");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Error in verifying email";
    dispatch(verifyEmailFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const login = (data, navigate) => async (dispatch) => {
  dispatch(logInStart());

  try {
    const res = await axiosInstance.post("/auth/login", data);
    dispatch(logInSuccess(res.data));
    dispatch(connectSocketThunk());
    toast.success("Logged In successfully");
    navigate("/");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Login Failed";
    dispatch(logInFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const logout = (navigate) => async (dispatch, getState) => {
  try {
    const { socket, currentUser, onlineUsers } = getState().user;

    if (socket && currentUser) {
      socket.emit("userDisconnected", currentUser._id); // Notify the server
      socket.off("getOnlineUsers"); // Remove listeners
      socket.disconnect(); // Disconnect socket
    }

    await axiosInstance.post("/auth/logout");

    // Remove the current user from the onlineUsers list
    const updatedOnlineUsers = onlineUsers.filter(userId => userId !== currentUser._id);
    dispatch(setOnlineUsers(updatedOnlineUsers));

    dispatch(logoutSuccess());
    dispatch(disconnectSocketThunk());

    toast.success("Logged out successfully");
    navigate("/login");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Logout failed";
    toast.error(errorMessage);
  }
};

export const checkAuth = () => async (dispatch, getState) => {
  dispatch(setCheckAuth());

  try {
    const res = await axiosInstance.get("/auth/check", { withCredentials: true });

    if (res.data?.user) {
      dispatch(setUser(res.data.user)); // Ensure `user` is extracted correctly
      dispatch(connectSocketThunk());
    } else {
      console.warn("Warning: checkAuth response missing user data", res.data);
      dispatch(setUser(null));
    }
  } catch (error) {
    console.error("Error in checkAuth", error.response?.data || error.message);
    dispatch(setUser(null));
  } finally {
    dispatch(setCheckAuthComplete());
  }
};

export const forgotPassword = (email) => async (dispatch) => {
  dispatch(forgotPasswordStart());

  try {
    await axiosInstance.post("/auth/forget-password", { email });
    dispatch(forgotPasswordSuccess());
    toast.success("Password reset link sent to your email");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Password reset failed";
    dispatch(forgotPasswordFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const resetPassword = (token, password, navigate) => async (dispatch) => {
  dispatch(resetPasswordStart());

  try {
    const cleanToken = token.replace(/}$/, ''); // Remove any `{` or `}`
    await axiosInstance.post(`/auth/reset-password/${cleanToken}`, { password });
    dispatch(resetPasswordSuccess());
    toast.success("Password has been successfully reset");
    dispatch(connectSocketThunk());
    navigate("/");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Password reset failed";
    dispatch(resetPasswordFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const updateProfile = (userData) => async (dispatch) => {
  dispatch(updateProfileStart());

  try {
    const res = await axiosInstance.put("/auth/update-profile", userData, {
      withCredentials: true,
    });

    dispatch(updateProfileSuccess(res.data));
    // Only show toast if not just avatar removal
    if (!(Object.keys(userData).length === 2 && userData.profilePic !== undefined && (userData.profilePic === null || userData.profilePic === "") && userData.fullName)) {
      toast.success("Profile updated successfully");
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Profile update failed";
    dispatch(updateProfileFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const deleteProfile = (userId, navigate) => async (dispatch) => {
  dispatch(deleteProfileStart());

  try {
    await axiosInstance.delete(`/auth/delete/${userId}`, {
      withCredentials: true,
    });
    dispatch(deleteProfileSuccess());
    toast.success("Profile deleted successfully");
    navigate("/signup");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Profile deletion failed";
    dispatch(deleteProfileFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const connectSocketThunk = () => async (dispatch, getState) => {
  const { currentUser, socket } = getState().user;

  // Always clean up previous socket if exists
  if (socket) {
    socket.off("getOnlineUsers");
    socket.disconnect();
    dispatch(disconnectSocket());
  }

  if (!currentUser) return;

  const newSocket = io(API_URL, {
    query: { userId: currentUser._id },
    reconnection: true
  });

  newSocket.on("connection", () => {
    console.log("Socket connected:", newSocket.id);
  });

  newSocket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  newSocket.on("getOnlineUsers", (onlineUsers) => {
    console.log("getOnlineUsers event:", onlineUsers);
    dispatch(setOnlineUsers(onlineUsers));
  });

  dispatch(connectSocket(newSocket)); // Store socket in Redux
};

export const disconnectSocketThunk = () => async (dispatch, getState) => {
  const { socket } = getState().user;

  if (socket?.connected) {
    socket.off("getOnlineUsers");
    socket.disconnect();
    dispatch(disconnectSocket());
  }
};

export default userSlice.reducer;