import React, { useState } from 'react'
import { Button, Label, Input } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from "../schemas/signup.schema";
import { toast } from 'react-toastify';
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from '../services/authService';
import { motion } from 'framer-motion';
import { Brain, Network, HeartPulse, AlertCircle } from 'lucide-react';

const SignUp = () => {
  const [isError, setError] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, setError: setFormError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", dateOfBirth: "", gender: "", password: "", confirmPassword: "" },
    mode: 'onBlur'
  });

  const calculateAge = (dob) => {
    const birthday = new Date(dob);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  async function onSubmitForm(data) {
    setError(false);
    try {
      const finalData = { firstName: data.firstName, lastName: data.lastName, email: data.email, age: calculateAge(data.dateOfBirth), gender: data.gender, password: data.password, confirmPassword: data.confirmPassword };
      const result = await registerUser(finalData);
      toast.success("Account created successfully!");
      navigate('/verification', { state: { email: finalData.email } });
      console.log("Success Result:", result);
    } catch (err) {
      setError(true);
      const responseData = err.response?.data;
      const rawMsg = responseData?.message || "Something went wrong!";
      let mainErrorMsg = "";

      // Helper function to translate error messages to English for Sign Up
      function translateSignUpError(message, field = "") {
        const lowMessage = String(message).toLowerCase();
        
        if (
          (lowMessage.includes("email") && (lowMessage.includes("exist") || lowMessage.includes("use") || lowMessage.includes("take"))) ||
          lowMessage.includes("مسجل بالفعل") ||
          lowMessage.includes("مستخدم بالفعل")
        ) {
          return "This email address is already registered.";
        }
        if (lowMessage.includes("email") || lowMessage.includes("البريد")) {
          return "Please enter a valid email address.";
        }
        if (
          lowMessage.includes("password") ||
          lowMessage.includes("كلمة المرور") ||
          lowMessage.includes("كلمه المرور") ||
          lowMessage.includes("الرمز السري")
        ) {
          return "Password must be at least 8 characters and meet all requirements.";
        }
        if (lowMessage.includes("required") || lowMessage.includes("مطلوب")) {
          const fieldName = field ? (field.charAt(0).toUpperCase() + field.slice(1)) : "Field";
          return `${fieldName} is required.`;
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
              const englishVal = translateSignUpError(rawVal, field);
              setFormError(field, { type: "manual", message: englishVal });
              if (!mainErrorMsg) mainErrorMsg = englishVal;
            }
          });
        } else if (typeof errors === "object") {
          Object.keys(errors).forEach((key) => {
            const errVal = errors[key];
            const rawVal = typeof errVal === "object" ? (errVal.message || errVal.msg) : errVal;
            if (rawVal) {
              const englishVal = translateSignUpError(rawVal, key);
              setFormError(key, { type: "manual", message: englishVal });
              if (!mainErrorMsg) mainErrorMsg = englishVal;
            }
          });
        }
      }

      // If no field-specific error was matched, show the toast/general error
      if (!mainErrorMsg) {
        if (String(rawMsg).toLowerCase().includes("validation")) {
          mainErrorMsg = "Please verify the information you entered.";
        } else {
          mainErrorMsg = translateSignUpError(rawMsg);
        }
      }

      toast.error(mainErrorMsg);
      console.error("API Error:", err);
    }
  }

  const inputCls = "w-full px-4 py-2.5 h-11 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 dark:focus:ring-teal-400/10 outline-none transition-all duration-300 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500";
  const labelCls = "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5";
  const errorCls = "text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium flex items-center gap-1 animate-pulse";

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-slate-900 font-sans">
      
      {/* Left Side - Visuals (Right aligned for SignUp to alternate layout, but kept standard split here) */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-slate-950 order-2">
        {/* Background Gradients & Effects */}
        <div className="absolute inset-0 bg-gradient-to-tl from-teal-900/50 via-slate-900 to-slate-950" />
        <div className="absolute w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[150px] top-10 left-10 animate-pulse duration-[6000ms]" />
        <div className="absolute w-[400px] h-[400px] bg-teal-600/20 rounded-full blur-[100px] -bottom-20 -right-20 animate-pulse duration-[8000ms]" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center max-w-xl mx-auto">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white/5 p-6 rounded-3xl backdrop-blur-md mb-8 border border-white/10 shadow-2xl"
          >
            <Network className="w-20 h-20 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
          </motion.div>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight text-white"
          >
            Join the Revolution
          </motion.h2>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-slate-300 text-lg leading-relaxed mb-10"
          >
            Create an account to track your emotions, interact with our AI, and explore deep neurological insights.
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-4 items-center justify-center"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-200 bg-emerald-900/30 px-5 py-2.5 rounded-full border border-emerald-800/50 backdrop-blur-sm">
              <HeartPulse className="w-4 h-4" /> Emotion Tracking
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form (Left aligned here due to order-2 on the visual side) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 relative overflow-y-auto order-1">
        
        {/* Subtle background for mobile */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-900 dark:to-slate-950 lg:hidden -z-10" />

        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[500px] flex flex-col relative z-10"
        >
          {/* Mobile Header Brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2.5 rounded-2xl">
              <Brain className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-labrada font-bold text-4xl tracking-tight">ONSY</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
              Create an account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">
              Let's personalize your experience.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="firstName" className={labelCls}>First name</Label>
                <Input {...register("firstName")} type="text" className={inputCls} placeholder="Sara" />
                {errors.firstName && <p className={errorCls}><AlertCircle className="w-3.5 h-3.5" /> {errors.firstName.message}</p>}
              </div>
              <div>
                <Label htmlFor="lastName" className={labelCls}>Last name</Label>
                <Input {...register("lastName")} type="text" className={inputCls} placeholder="Ahmed" />
                {errors.lastName && <p className={errorCls}><AlertCircle className="w-3.5 h-3.5" /> {errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <Label htmlFor="email" className={labelCls}>Email address</Label>
              <Input {...register("email")} type="email" className={inputCls} placeholder="your@email.com" />
              {errors.email && <p className={errorCls}><AlertCircle className="w-3.5 h-3.5" /> {errors.email.message}</p>}
            </div>

            {/* Date & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="dateOfBirth" className={labelCls}>Date of Birth</Label>
                <Input {...register("dateOfBirth")} type="date" className={inputCls} />
                {errors.dateOfBirth && <p className={errorCls}><AlertCircle className="w-3.5 h-3.5" /> {errors.dateOfBirth.message}</p>}
              </div>
              <div>
                <Label htmlFor="gender" className={labelCls}>Gender</Label>
                <div className="relative">
                  <select {...register("gender")} className={`${inputCls} appearance-none cursor-pointer pr-10`}>
                    <option value="" disabled hidden>Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
                {errors.gender && <p className={errorCls}><AlertCircle className="w-3.5 h-3.5" /> {errors.gender.message}</p>}
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="password" className={labelCls}>Password</Label>
                <div className="relative">
                  <Input {...register("password")} type={showPassword ? "text" : "password"} className={`${inputCls} pr-14`} placeholder="Min 8 chars" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors focus:outline-none">{showPassword ? "Hide" : "Show"}</button>
                </div>
                {errors.password && <p className={errorCls}><AlertCircle className="w-3.5 h-3.5" /> {errors.password.message}</p>}
              </div>
              <div>
                <Label htmlFor="confirmPassword" className={labelCls}>Confirm Password</Label>
                <div className="relative">
                  <Input {...register("confirmPassword")} type={showConfirmPassword ? "text" : "password"} className={`${inputCls} pr-14`} placeholder="Confirm pass" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors focus:outline-none">{showConfirmPassword ? "Hide" : "Show"}</button>
                </div>
                {errors.confirmPassword && <p className={errorCls}><AlertCircle className="w-3.5 h-3.5" /> {errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} className={`w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white font-bold text-base shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_10px_25px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed transform-none hover:shadow-none' : ''}`}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="mt-10 text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link to={'/SignIn'} className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline underline-offset-4 transition-all">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default SignUp;