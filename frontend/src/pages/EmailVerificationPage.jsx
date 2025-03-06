import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageSquare } from 'lucide-react';
import LeftSideOfSignUpAndLoginPage from '../components/LeftSideOfSignUpAndLoginPage';
import { useNavigate } from 'react-router-dom';
import { verifyEmail } from '../redux/user/userSlice';

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.user);

  const handleChange = (index, value) => {
    const newCode = [...code];

    // Handle Pasted content
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");

      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      // Focus on the Last non-empty input or the first empty one
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    }
    else {
      newCode[index] = value;
      setCode(newCode);

      // Move focus to the next input field if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const verificationCode = code.join("");

    if (verificationCode.length === 6) {
      try {
        dispatch(verifyEmail(verificationCode, navigate));
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Auto submit the form when all inputs are filled
  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit"));
    }
  }, [code]);


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
              <h1 className='text-2xl font-bold mt-2'>Verify Your Email</h1>
              <p className='text-gray-300'>
                Enter the 6 digit code sent to your email address
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Enter 6 digit code here */}
            <div className="flex justify-between mt-5">
              {
                code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength='6'
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className='w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-green-500 focus:outline-none'
                  />
                ))
              }
            </div>

            {/* Submit Button */}
            <div className='flex justify-center'>
              <button type="submit" className="btn btn-primary w-full mt-3 rounded-full">
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <LeftSideOfSignUpAndLoginPage
        title="Your security, our priority. Verify with OTP."
        subtitle="For your protection, we've sent a one-time password to your registered email address."
        mode="otp"
      />
    </div>
  );
};

export default EmailVerificationPage;