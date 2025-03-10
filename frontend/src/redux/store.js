import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from "./user/userSlice.js";
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import themeReducer from "./themeSlice.js";
import chatReducer from "./message/chatSlice.js";

const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
  chat: chatReducer
});


const persistConfig = {
  key: 'root',
  storage,
  version: 1
};

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  })
});

export const persistor = persistStore(store);