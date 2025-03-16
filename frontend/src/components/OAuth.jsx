import React from "react";
import { AiFillGoogleCircle } from 'react-icons/ai';
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";

import { logInSuccess, logInFailure } from "../redux/user/userSlice";
import { app } from "../../firebase";


export default function OAuth() {
  const auth = getAuth(app);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      const res = await fetch('http://localhost:5001/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoUrl: resultsFromGoogle.user.photoURL,
        }),
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(logInSuccess(data));
        navigate("/");
      }

      toast.success("Google sign-in successful");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Google sign-in failed";
      dispatch(logInFailure(errorMessage));
      toast.error(errorMessage);
    }
  };

  return (
    <button
      type="button"
      className="w-full relative flex items-center justify-center p-0.5 mb-2 mt-1 text-sm font-medium text-gray-900 rounded-full group bg-gradient-to-r from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 border border-transparent"
      onClick={handleGoogleClick}
    >
      <span className="w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-full group-hover:bg-opacity-0">
        <AiFillGoogleCircle className="w-6 h-6 mr-2 inline-block" />
        Continue with Google
      </span>
    </button>
  );
}