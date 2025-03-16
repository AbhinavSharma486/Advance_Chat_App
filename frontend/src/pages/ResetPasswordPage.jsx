import React, { useState } from 'react';
import { Eye, EyeOff, Lock, MessageSquare } from "lucide-react";
import { resetPassword } from '../redux/user/userSlice';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import LeftSideOfSignUpAndLoginPage from '../components/LeftSideOfSignUpAndLoginPage';


const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const { token } = useParams();
  const cleanToken = token.replace(/}$/, ''); // Remove trailing `}`

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    // Dispatch forgotPassword action with the password
    try {
      dispatch(resetPassword(cleanToken, password, navigate));
    } catch (err) {
      toast.error('Error resetting password');
    }
  };

  return (
    <div className='min-h-screen grid lg:grid-cols-2'>
      {/* LEFT SIDE */}
      <div className='flex justify-center items-center p-6 sm:p-12 mt-5'>
        <div className="w-full max-w-md space-y-1">

          {/* LOGO */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className='size-6 text-primary' />
              </div>
              <h1 className='text-2xl font-bold mt-2'>Reset Password</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-3'>

            {/* New Password */}
            <div className="form-control">
              <label className='label'>
                <span className="label-text font-medium">New Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className='size-5 text-base-content/40' />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10 rounded-full`}
                  placeholder='••••••••'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {
                    showPassword ? (
                      <EyeOff className='size-5 text-base-content/40' />
                    ) : (
                      <Eye className="size-5 text-base-content/40" />
                    )
                  }
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-control">
              <label className='label'>
                <span className="label-text font-medium">Confirm New Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className='size-5 text-base-content/40' />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10 rounded-full`}
                  placeholder='••••••••'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {
                    showConfirmPassword ? (
                      <EyeOff className='size-5 text-base-content/40' />
                    ) : (
                      <Eye className="size-5 text-base-content/40" />
                    )
                  }
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className='flex justify-center'>
              <button type="submit" className="btn btn-primary w-full mt-3 rounded-full">
                Set New Password
              </button>
            </div>

          </form>
        </div>
      </div >

      {/* RIGHT SIDE */}
      <LeftSideOfSignUpAndLoginPage
        title="Reset Password"
        subtitle="Reset password quickly, secure your account, and regain access with simple clicks."
        mode="reset-password"
      />
    </div >
  );
};

export default ResetPasswordPage;
