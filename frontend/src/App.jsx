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

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { currentUser, isCheckingAuth } = useSelector((state) => state.user);

  useEffect(() => {
    // Don't run checkAuth on login or signup pages
    if (location.pathname !== "/login" && location.pathname !== "/signup") {
      dispatch(checkAuth());
    }
  }, [dispatch, location.pathname]);


  if (isCheckingAuth && !currentUser) {
    return (
      <div className="flex item-center justify-center h-screen">
        <Loader className='size-10 animate-spin' />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={currentUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path='/signup' element={!currentUser ? < SignUpPage /> : <Navigate to="/" />} />
        <Route path='/login' element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;