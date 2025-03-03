import { ArrowLeft, Loader, Mail, MessageSquare } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { forgotPassword } from '../redux/user/userSlice';
import LeftSideOfSignUpAndLoginPage from '../components/LeftSideOfSignUpAndLoginPage';
import toast from 'react-hot-toast';

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      await dispatch(forgotPassword(email));
      setIsSubmitted(true);
    } catch (error) {
      toast.error("Failed to send reset link");
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
              <h1 className='text-2xl font-bold mt-2'>Forget Password</h1>
              <p className='text-gray-300'>
                {
                  !isSubmitted && "Enter your email address and we'll send you a link to reset your password."
                }
              </p>
            </div>
          </div>

          {isSubmitted ? (
            <div className="text-center">
              <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Mail className='h-8 w-8 text-white' />
              </div>

              <p className='text-gray-300 mb-6'>
                If an account exists for {email}, you will receive a password reset link shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-3'>
              {/* Email */}
              <div className="form-control">
                <div className="relative mt-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className='size-5 text-base-content/40' />
                  </div>
                  <input
                    type="email"
                    className={`input input-bordered w-full pl-10 rounded-full`}
                    placeholder='Enter your email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className='flex justify-center'>
                <button type="submit" className="btn btn-primary w-full mt-3 rounded-full">
                  {isSubmitted ? <Loader className='size-6 animate-spin mx-auto' /> : "Send Reset Link"}
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div className='px-8 py-4 bg-opacity-50 flex justify-center'>
            <Link to={"/login"} className='text-sm text-white hover:underline flex items-center'>
              <ArrowLeft className='h-4 w-4 mr-2' /> Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <LeftSideOfSignUpAndLoginPage
        title="Unlock your account with ease."
        subtitle="Lost your way back in? Reset your password, and regain access quickly."
        mode="forget-password"
      />
    </div>
  );
};

export default ForgetPassword;
