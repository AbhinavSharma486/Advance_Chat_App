import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useLocation } from "react-router-dom";

import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { checkAuth } from "./redux/user/userSlice";
import Navbar from './components/Navbar';
import SettingsPage from './pages/SettingsPage';
import ForgetPasswordPage from './pages/ForgetPassword';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ProfilePage from './pages/ProfilePage';
import { subscribeToMessages, unsubscribeFromMessages } from "./redux/message/chatSlice";
import { connectSocketThunk } from "./redux/user/userSlice";
import UserProfilePreview from './components/UserProfilePreview';
import { FONT_SIZE_MAP } from "./components/Navbar";

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { currentUser, isCheckingAuth, onlineUsers, socket } = useSelector((state) => state.user);

  const theme = useSelector((state) => state.theme.theme);
  const font = useSelector((state) => state.theme.font);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch, location.pathname, theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (socket) {
      dispatch(subscribeToMessages());
      return () => {
        dispatch(unsubscribeFromMessages());
      };
    }
  }, [socket, dispatch]);

  useEffect(() => {
    if (currentUser && !socket) {
      dispatch(connectSocketThunk());
    }
  }, [currentUser, socket, dispatch]);

  if (isCheckingAuth && !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className='size-10 animate-spin' />
      </div>
    );
  }

  const fontSize = FONT_SIZE_MAP[font] || 'text-base';
  return (
    <div className={`${font} ${fontSize}`}>
      <Navbar />
      <Routes>
        <Route path='/' element={currentUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path='/signup' element={!currentUser ? < SignUpPage /> : <Navigate to="/" />} />
        <Route path='/login' element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path='/forget-password' element={<ForgetPasswordPage />} />
        <Route path='/reset-password/:token' element={!currentUser ? <ResetPasswordPage /> : <Navigate to="/" />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='/verify-email' element={<EmailVerificationPage />} />
        <Route path='/profile' element={currentUser ? <ProfilePage /> : <Navigate to="/" />} />
      </Routes>
      <UserProfilePreview />
      <Toaster />
    </div>
  );
};

export default App;
