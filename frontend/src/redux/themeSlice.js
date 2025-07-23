import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: localStorage.getItem('chat-theme') || 'dark',
  font: localStorage.getItem('chat-font') || 'system',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      const theme = action.payload;
      localStorage.setItem('chat-theme', theme);
      state.theme = theme;
    },
    setFont: (state, action) => {
      const font = action.payload;
      localStorage.setItem('chat-font', font);
      state.font = font;
    },
  }
});

export const { setTheme, setFont } = themeSlice.actions;

export default themeSlice.reducer;