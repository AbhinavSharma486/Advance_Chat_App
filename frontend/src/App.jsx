import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from 'react';
import { Loader } from 'lucide-react';

import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { checkAuth } from "./redux/user/userSlice";

const App = () => {
  const dispatch = useDispatch();
  const { currentUser, isCheckingAuth } = useSelector((state) => state.user);

  console.log({ currentUser });

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  console.log({ checkAuth });

  if (isCheckingAuth && !currentUser) {
    return (
      <div className="flex item-center justify-center h-screen">
        <Loader className='size-10 animate-spin' />
      </div>
    );
  }

  return (
    <div>
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