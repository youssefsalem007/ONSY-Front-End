import React, { useState, useEffect } from 'react'
import { Button } from "@heroui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import { ForgetPasswordOtp, resendOtp } from '../services/authService';
import OtpInput from 'react-otp-input';

export default function ForgetPOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [isSuccess, setIsSuccess] = useState(false);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error("Session expired, please enter your email again.");
      navigate("/ForgetP");
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (otp.length < 4) {
      toast.error("Please enter the 4-digit code");
      return;
    }
    setIsLoading(true);
    try {
      await ForgetPasswordOtp({ email, otp });
      setIsSuccess(true); 
      toast.success("OTP Verified Successfully");
      navigate('/ResetP', { state: { email, otp } });
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP code";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendOtp(email);
      toast.success("A new code has been sent!");
      setTimer(30); 
    } catch (err) {
      toast.error("Failed to resend. Try again later.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 px-4 py-24 transition-colors duration-300">
      <div className="w-full max-w-lg">
        <form 
          onSubmit={handleVerify}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl px-8 py-12 shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] border border-slate-100 dark:border-slate-700/60 flex flex-col gap-8 transition-all duration-300"
        >
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">OTP verification</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-base sm:text-lg mt-3 px-2">
              Enter the code from the email we sent to{' '}
              <span className="text-slate-800 dark:text-slate-200 font-semibold break-all">{email || "your email"}</span>
            </p>
          </div>

          <div className="flex justify-center">
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={4}
              inputType="text" 
              renderSeparator={<span className="w-3 lg:w-4" />} 
              renderInput={(props) => (
                <input
                  {...props}
                  type="text"
                  className="w-14! h-14! lg:w-20! lg:h-20! text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white bg-white dark:bg-teal-700 border-2 border-slate-200 dark:border-teal-600 rounded-2xl outline-none focus:ring-4 focus:ring-teal-400/40 dark:focus:ring-teal-300/30 focus:border-teal-500 dark:focus:border-teal-400 text-center transition-all shadow-sm dark:shadow-lg"
                />
              )}
            />
          </div>

          <Button 
            type="submit" 
            isLoading={isLoading}
            disabled={isSuccess || isLoading}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#036464] to-teal-500 dark:from-teal-700 dark:to-teal-500 text-white font-bold text-base shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            {isLoading ? "Checking..." : isSuccess ? "Verified!" : "Verify"}
          </Button>

          <p className="text-slate-500 dark:text-slate-400 text-center text-sm">
            Didn't receive code?{" "}
            <button 
              type="button" 
              onClick={handleResend}
              disabled={timer > 0 || isResending}
              className={`font-bold underline ml-1 transition-all ${timer > 0 || isResending ? 'text-slate-400 dark:text-slate-600 no-underline cursor-not-allowed' : 'text-teal-600 dark:text-teal-400 cursor-pointer hover:text-teal-800 dark:hover:text-teal-300'}`}
            >
              {isResending ? "Sending..." : timer > 0 ? `Resend in ${timer}s` : "Resend Now"}
            </button>
          </p>
        </form>
      </div>
    </section>
  )
}