import React, { useState } from 'react'
import { Input, Button, Label } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify';
import { Link, useNavigate } from "react-router-dom";
import { loginSchema } from '../schemas/login.schema';
import { loginUser } from '../services/authService';
import { motion } from 'framer-motion';
import { Brain, Activity, Sparkles, AlertCircle } from 'lucide-react';

import Loading from './Loading';

const SingIn = () => {
  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setError: setFormFieldError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: 'onBlur'
  });

  async function onSubmitForm(data) {
    setError(false);
    setErrorMessage("");
    try {
      await loginUser(data);
      toast.success("Welcome back!");
      setLoading(true);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(true);
      const responseData = err.response?.data;
      const rawMsg =
        responseData?.message ||
        responseData?.error ||
        responseData?.msg ||
        (typeof responseData === "string" ? responseData : null) ||
        "Incorrect email or password";

      let mainErrorMsg = "";

      // Helper function to translate error messages to English
      function translateErrorMessage(message, field = "") {
        const lowMessage = String(message).toLowerCase();
        if (
          lowMessage.includes("password") ||
          lowMessage.includes("كلمة المرور") ||
          lowMessage.includes("كلمه المرور") ||
          lowMessage.includes("مرور") ||
          lowMessage.includes("الرمز السري")
        ) {
          return "Incorrect password. Please try again.";
        }
        if (
          lowMessage.includes("email not found") ||
          lowMessage.includes("user not found") ||
          lowMessage.includes("غير مسجل") ||
          lowMessage.includes("غير موجود") ||
          lowMessage.includes("المستخدم غير موجود")
        ) {
          return "Email address not found.";
        }
        if (
          lowMessage.includes("email") ||
          lowMessage.includes("البريد")
        ) {
          return "Please enter a valid or registered email.";
        }
        return message;
      }

      // Check if there are field-specific errors in array or object format
      if (responseData?.errors) {
        const errors = responseData.errors;

        if (Array.isArray(errors)) {
          errors.forEach((errItem) => {
            const field = errItem.param || errItem.field || (errItem.path && errItem.path[0]) || "";
            const rawVal = errItem.msg || errItem.message || "";
            if (field && rawVal) {
              const englishVal = translateErrorMessage(rawVal, field);
              setFormFieldError(field, { type: "manual", message: englishVal });
              if (!mainErrorMsg) mainErrorMsg = englishVal;
            }
          });
        } else if (typeof errors === "object") {
          Object.keys(errors).forEach((key) => {
            const errVal = errors[key];
            const rawVal = typeof errVal === "object" ? (errVal.message || errVal.msg) : errVal;
            if (rawVal) {
              const englishVal = translateErrorMessage(rawVal, key);
              setFormFieldError(key, { type: "manual", message: englishVal });
              if (!mainErrorMsg) mainErrorMsg = englishVal;
            }
          });
        }
      }

      // If no field errors were processed or we still need a main error banner
      if (!mainErrorMsg) {
        if (String(rawMsg).toLowerCase().includes("validation")) {
          mainErrorMsg = "Incorrect email or password.";
        } else {
          mainErrorMsg = translateErrorMessage(rawMsg);
        }
      }

      setErrorMessage(mainErrorMsg);
    }
  }

  if (loading) {
    return (
      <Loading
        head={"You're now logged in."}
        prag={"Taking you home…"}
      />
    );
  }

  const inputCls = "w-full px-4 py-3 h-12 text-base rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 dark:focus:ring-teal-400/10 outline-none transition-all duration-300 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500";
  const labelCls = "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2";

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-slate-900 font-sans">
      
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-slate-950">
        {/* Background Gradients & Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-slate-900 to-slate-950" />
        <div className="absolute w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px] -top-32 -left-32 animate-pulse duration-[5000ms]" />
        <div className="absolute w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] bottom-10 right-10 animate-pulse duration-[7000ms]" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center max-w-xl mx-auto">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white/5 p-6 rounded-3xl backdrop-blur-md mb-8 border border-white/10 shadow-2xl"
          >
            <Brain className="w-20 h-20 text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
          </motion.div>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight text-white"
          >
            Unlock Deep Insights
          </motion.h2>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-slate-300 text-lg leading-relaxed mb-10"
          >
            Advanced EEG Analysis and AI-driven mood tracking to elevate your cognitive and emotional well-being.
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-4 items-center justify-center"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-teal-200 bg-teal-900/30 px-5 py-2.5 rounded-full border border-teal-800/50 backdrop-blur-sm">
              <Activity className="w-4 h-4" /> Real-time Tracking
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-200 bg-emerald-900/30 px-5 py-2.5 rounded-full border border-emerald-800/50 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" /> AI Insights
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 relative overflow-y-auto">
        
        {/* Subtle background for mobile */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-white dark:from-slate-900 dark:to-slate-950 lg:hidden -z-10" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md flex flex-col relative z-10"
        >
          {/* Mobile Header Brand */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="bg-teal-100 dark:bg-teal-900/40 p-2.5 rounded-2xl">
              <Brain className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
            <span className="text-teal-600 dark:text-teal-400 font-labrada font-bold text-4xl tracking-tight">ONSY</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg">
              Enter your details to access your account.
            </p>
          </div>

          {/* General Error Banner */}
          {isError && errorMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-600 dark:text-red-400 text-sm font-semibold">{errorMessage}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
            {/* Email Field */}
            <div>
              <Label htmlFor="email" className={labelCls}>
                Email address
              </Label>
              <Input
                {...register("email")}
                type="email"
                className={inputCls}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
                  <AlertCircle className="w-4 h-4" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password" title="password" className={labelCls}>
                Password
              </Label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={`${inputCls} pr-16`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300 focus:outline-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
                  <AlertCircle className="w-4 h-4" /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer w-4 h-4 border-2 border-slate-300 dark:border-slate-600 rounded-md bg-transparent checked:bg-teal-600 checked:border-teal-600 transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-teal-500/30 focus:outline-none" />
                  <svg className="absolute w-4 h-4 pointer-events-none opacity-0 peer-checked:opacity-100 text-white p-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Remember me</span>
              </label>
              <Link to="/ForgetP" className="text-sm font-bold text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className={`w-full h-12 mt-2 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white rounded-xl font-bold text-base shadow-[0_8px_20px_rgba(13,148,136,0.25)] hover:shadow-[0_10px_25px_rgba(13,148,136,0.35)] hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed transform-none hover:shadow-none' : ''}`}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
            
            {/* Sign up link */}
            <div className="mt-12 text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <Link to="/SignUp" className="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline underline-offset-4 transition-all">
                  Sign up now
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default SingIn;