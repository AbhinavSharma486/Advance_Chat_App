import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from "react-redux";

import LeftSideOfSignUpAndLoginPage from '../components/LeftSideOfSignUpAndLoginPage';
import { signup } from "../redux/user/userSlice";
import OAuth from "../components/OAuth";


const SignUpPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const dispatch = useDispatch();
  const isSignInUp = useSelector((state) => state.user.isSignInUp);

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) {
      dispatch(signup(formData, navigate));
      navigate("/verify-email");
    }
  };

  return (
    <div className='min-h-screen grid lg:grid-cols-2 gap-0 lg:gap-8 bg-base-100 place-items-center overflow-x-hidden'>

      {/* LEFT SIDE */}
      <div className="flex flex-col justify-center items-center w-full max-w-full px-2 py-6 sm:px-4 md:px-12 pt-16">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          {/* LOGO */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-2 group">
              <h1 className='text-2xl font-bold mt-2'>Create Account</h1>
              <p className='text-base-content/60'>Get started with your free account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-3'>

            {/* FullName */}
            <div className="form-control">
              <label className='label'>
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className='size-5 text-base-content/40' />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10 rounded-full`}
                  placeholder='Jhon Doe'
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className='size-5 text-base-content/40' />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10 rounded-full`}
                  placeholder='you@gmail.com'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className='label'>
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className='size-5 text-base-content/40' />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10 rounded-full`}
                  placeholder='••••••••'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            {/* Submit Button */}
            <div className='flex justify-center'>
              <button type="submit" className="btn btn-primary w-full mt-1 rounded-full">
                {
                  isSignInUp ? (
                    <>
                      <Loader2 className='size-5 animate-spin' />
                      Loading...
                    </>
                  ) : (
                    "Create Account"
                  )
                }
              </button>
            </div>

            {/* OAuth Google Button  */}
            <div className="flex justify-center">
              <OAuth />
            </div>

          </form>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account ? {" "}
              <Link to="/login" className='link link-primary'>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>


      { /* RIGHT SIDE */}
      <LeftSideOfSignUpAndLoginPage
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
        mode="signup"
      />
    </div >
  );
};

export default SignUpPage;