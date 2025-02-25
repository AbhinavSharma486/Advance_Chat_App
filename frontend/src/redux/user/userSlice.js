import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios";

const initialState = {
  currentUser: null,
  error: null,
  loading: false,
  isSignInUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
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
    },
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setCheckAuth: (state) => {
      state.isCheckingAuth = true;
    },
    setCheckAuthComplete: (state) => {
      state.isCheckingAuth = false;
    },
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
  setCheckAuthComplete
} = userSlice.actions;

export const signup = (data) => async (dispatch) => {
  dispatch(signUpStart());

  try {
    const res = await axiosInstance.post("/auth/signup", data);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Signup failed");
    }

    const responseData = await res.json();

    dispatch(signUpSuccess(responseData));

    toast.success("Account created successfully");
  } catch (error) {
    dispatch(signUpFailure(error.message));
    toast.error(error.message);
  }
};

export const login = (data, navigate) => async (dispatch) => {
  dispatch(logInStart());

  try {
    const res = await axiosInstance.post("/auth/login", data);

    dispatch(logInSuccess(res.data));

    toast.success("Log In successfully");
    navigate("/");
  } catch (error) {
    dispatch(logInFailure(error.message));
    toast.error("Login Failed");
  }
};

export const logout = () => async (dispatch) => {
  try {
    await axiosInstance.post("/auth/logout");
    dispatch(logoutSuccess());
    toast.success("Logged out successfully");
  } catch (error) {
    toast.error(error.response.data.message);
  }
};

export const checkAuth = () => async (dispatch) => {
  dispatch(setCheckAuth());

  try {
    const res = await axiosInstance.get("/auth/check");
    dispatch(setUser(res.data));
  } catch (error) {
    console.error("Error in checkAuth", error); // Use console.error for errors
    dispatch(setUser(null));
  } finally {
    dispatch(setCheckAuthComplete());
  }
};



export default userSlice.reducer;

