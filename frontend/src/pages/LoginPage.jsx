import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";

import LeftSideOfSignUpAndLoginPage from '../components/LeftSideOfSignUpAndLoginPage';
import { login } from "../redux/user/userSlice";
import OAuth from "../components/OAuth";


const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoggingIn, currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(login(formData, navigate));
  };

  return (
    <div className='min-h-screen grid lg:grid-cols-2 gap-0 lg:gap-8 bg-base-100 place-items-center overflow-x-hidden'>

      {/* LEFT SIDE */}
      <div className="flex flex-col justify-center items-center w-full max-w-full px-2 py-6 sm:px-4 md:px-12">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">

          {/* LOGO */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-2 group">

              <h1 className='text-2xl font-bold mt-2'>Welcome Back</h1>
              <p className='text-base-content/60'>Log in to your account</p>

            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-3'>

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

              <div className="flex items-center mt-3">
                <Link to="/forget-password" className="link link-primary text-sm hover:underline">
                  Forget Password?
                </Link>
              </div>

            </div>

            {/* Submit Button */}
            <div className='flex justify-center'>
              <button type="submit" className="btn btn-primary w-full mt-3 rounded-full">
                {
                  isLoggingIn ? (
                    <>
                      <Loader2 className='size-5 animate-spin' />
                      Loading...
                    </>
                  ) : (
                    "Log In"
                  )
                }
              </button>
            </div>

            {/* OAuth Google Button  */}
            <div className="flex justify-center">
              <OAuth />
            </div>

          </form>

          {/* SignUp Link */}
          <div className="text-center">
            <p className="text-base-content/60">
              Dont have an account ? {" "}
              <Link to="/signup" className='link link-primary'>
                Create account
              </Link>
            </p>
          </div>

        </div>
      </div>


      { /* RIGHT SIDE */}
      <LeftSideOfSignUpAndLoginPage
        title="Welcome back!"
        subtitle="Log in to continue your conversations and catch up with your messages"
        mode="login"
      />
    </div>
  );
};

export default LoginPage;