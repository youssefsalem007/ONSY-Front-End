import React, { useState } from 'react'
import { Input, Button, Label } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify';
import { Link, useNavigate } from "react-router-dom";
import { loginSchema } from '../schemas/login.schema';
import { loginUser } from '../services/authService';
import google from "../assets/Group.png"
import aro from "../assets/Vector.png"
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

  return (
    <>
      <section className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 px-4 pt-20 pb-4 sm:px-6 lg:px-8 transition-colors duration-300 overflow-hidden">

        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="w-full max-w-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] border border-slate-100 dark:border-slate-700/60 flex flex-col gap-4 transition-all duration-300 hover:shadow-[0_8px_50px_rgb(0,0,0,0.09)] dark:hover:shadow-[0_8px_50px_rgb(0,0,0,0.4)]"
        >
          {/* Brand Header */}
          <div className="text-teal-600 dark:text-teal-400 font-labrada font-bold text-3xl sm:text-4xl text-center tracking-tight">
            ONSY
          </div>

          {/* Welcome Text */}
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-1">
              Welcome back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">
              Continue your mental wellness journey
            </p>
          </div>

          {/* General Error Banner */}
          {isError && errorMessage && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl px-4 py-3 animate-[fadeIn_0.3s_ease-out]">
              <svg className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {/* Email Field */}
            <div className="w-full">
              <Label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Email address
              </Label>
              <Input
                {...register("email")}
                type="email"
                className="w-full px-4 py-3 h-auto text-base rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 dark:focus:ring-teal-400/10 outline-none transition-all duration-300 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1.5 font-medium animate-pulse">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="w-full">
              <Label htmlFor="password" title="password" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Password
              </Label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 h-auto text-base rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 dark:focus:ring-teal-400/10 outline-none transition-all duration-300 text-slate-800 dark:text-slate-100 pr-16 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                <p className="text-red-500 dark:text-red-400 text-sm mt-1.5 font-medium animate-pulse">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end -mt-2">
              <span
                onClick={() => navigate("/ForgetP")}
                className="text-sm font-semibold text-teal-600 dark:text-teal-400 cursor-pointer hover:text-teal-800 dark:hover:text-teal-300 transition-colors duration-300"
              >
                Forgot password?
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className={`w-full h-11 bg-gradient-to-r from-[#036464] to-teal-500 dark:from-teal-700 dark:to-teal-500 text-white rounded-xl font-bold text-base shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 hover:-translate-y-0.5 transition-all duration-300 ease-out flex justify-center items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? "Loading..." : "Log in"}
            </Button>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-px bg-slate-200 dark:bg-slate-600 flex-1"></div>
              <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">Or sign up with</p>
              <div className="h-px bg-slate-200 dark:bg-slate-600 flex-1"></div>
            </div>

            {/* Google Button */}
            <div className="w-full bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 p-3 rounded-xl flex justify-between items-center cursor-pointer group hover:border-teal-300 dark:hover:border-teal-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">
              <div className="flex items-center gap-3">
                <img src={google} alt="Google logo" className="w-5 h-5 object-contain" />
                <p className="font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">
                  Sign up with Google
                </p>
              </div>
              <img src={aro} className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" alt="Arrow right" />
            </div>
          </div>

          {/* Signup Link */}
          <p className="text-slate-500 dark:text-slate-400 text-center text-sm font-medium">
            Don't have an account?{' '}
            <Link
              to={'/SignUp'}
              className="text-teal-600 dark:text-teal-400 font-bold hover:text-teal-800 dark:hover:text-teal-300 hover:underline underline-offset-4 transition-all duration-300"
            >
              Sign up
            </Link>
          </p>

        </form>
      </section>
    </>
  )
}

export default SingIn;