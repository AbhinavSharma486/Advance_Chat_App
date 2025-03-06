import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from 'react';
import { Loader } from 'lucide-react';
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

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { currentUser, isCheckingAuth } = useSelector((state) => state.user);
  const theme = useSelector((state) => state.theme.theme);

  useEffect(() => {
    // Don't run checkAuth on login or signup pages
    if (location.pathname !== "/login" && location.pathname !== "/signup" && location.pathname !== "/settings" && location.pathname !== "/google") {
      dispatch(checkAuth());
    }
  }, [dispatch, location.pathname]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);


  if (isCheckingAuth && !currentUser) {
    return (
      <div className="flex item-center justify-center h-screen">
        <Loader className='size-10 animate-spin' />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path='/' element={currentUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path='/signup' element={!currentUser ? < SignUpPage /> : <Navigate to="/" />} />
        <Route path='/login' element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path='/forget-password' element={!currentUser ? <ForgetPasswordPage /> : <Navigate to="/" />} />
        <Route path='/reset-password/:token' element={!currentUser ? <ResetPasswordPage /> : <Navigate to="/" />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='/verify-email' element={!currentUser ? <EmailVerificationPage /> : <Navigate to="/" />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;