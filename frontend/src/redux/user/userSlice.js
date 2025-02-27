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

    dispatch(signUpSuccess(res.data));

    toast.success("Account created successfully");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Signup failed";
    dispatch(signUpFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const login = (data, navigate) => async (dispatch) => {
  dispatch(logInStart());

  try {
    const res = await axiosInstance.post("/auth/login", data);
    dispatch(logInSuccess(res.data));

    toast.success("Logged In successfully");
    navigate("/");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Login Failed";
    dispatch(logInFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const logout = (navigate) => async (dispatch) => {
  try {
    await axiosInstance.post("/auth/logout");
    dispatch(logoutSuccess());
    toast.success("Logged out successfully");
    navigate("/login");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Logout failed";
    toast.error(errorMessage);
  }
};

export const checkAuth = () => async (dispatch) => {
  dispatch(setCheckAuth());

  try {
    const res = await axiosInstance.get("/auth/check", { withCredentials: true });

    if (res.data?.user) {
      dispatch(setUser(res.data.user)); // Ensure `user` is extracted correctly
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



export default userSlice.reducer;

