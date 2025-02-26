import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: localStorage.getItem('chat-theme') || 'dark',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      const theme = action.payload;
      localStorage.setItem('chat-theme', theme);
      state.theme = theme;
    }
  }
});

export const { setTheme } = themeSlice.actions;

export default themeSlice.reducer;