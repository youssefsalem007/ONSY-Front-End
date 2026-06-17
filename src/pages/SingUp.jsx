import React, { useState, useEffect, useRef } from 'react'
import { Button, Label } from "@heroui/react";
import { Input } from '@heroui/react';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from "../schemas/signup.schema";
import { toast } from 'react-toastify';
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from '../services/authService';

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

  const inputCls = "w-full h-11 px-4 text-sm font-semibold rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition-all duration-300 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500";
  const labelCls = "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1";
  const errorCls = "text-red-500 dark:text-red-400 text-xs mt-0.5 font-medium";

  return (
    <section className="h-screen w-full bg-gradient-to-br from-slate-50 via-white to-teal-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 transition-colors duration-300 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
        <div className="w-full max-w-xl mx-auto">
          <form
            onSubmit={handleSubmit(onSubmitForm)}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl px-6 py-7 sm:px-8 sm:py-8 shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] border border-slate-100 dark:border-slate-700/60 flex flex-col gap-4 transition-all duration-300"
          >
            <div className="text-teal-600 dark:text-teal-400 font-labrada text-3xl sm:text-4xl text-center font-bold tracking-tight">ONSY</div>
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Create an account</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base mt-0.5">Let's personalize your experience</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col flex-1">
                  <Label htmlFor="firstName" className={labelCls}>First name</Label>
                  <Input {...register("firstName")} type="text" className={inputCls} placeholder="Sara" />
                  {errors.firstName && <p className={errorCls}>{errors.firstName.message}</p>}
                </div>
                <div className="flex flex-col flex-1">
                  <Label htmlFor="lastName" className={labelCls}>Last name</Label>
                  <Input {...register("lastName")} type="text" className={inputCls} placeholder="Ahmed" />
                  {errors.lastName && <p className={errorCls}>{errors.lastName.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="email" className={labelCls}>Email address</Label>
                <Input {...register("email")} type="email" className={inputCls} placeholder="your@email.com" />
                {errors.email && <p className={errorCls}>{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="gender" className={labelCls}>Gender</Label>
                <select {...register("gender")} className={`${inputCls} cursor-pointer`}>
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && <p className={errorCls}>{errors.gender.message}</p>}
              </div>
              <div>
                <Label htmlFor="password" className={labelCls}>Password</Label>
                <div className="relative">
                  <Input {...register("password")} type={showPassword ? "text" : "password"} className={inputCls} placeholder="Min 8 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300 focus:outline-none">{showPassword ? "Hide" : "Show"}</button>
                </div>
                {errors.password && <p className={errorCls}>{errors.password.message}</p>}
              </div>
              <div>
                <Label htmlFor="confirmPassword" className={labelCls}>Confirm Password</Label>
                <div className="relative">
                  <Input {...register("confirmPassword")} type={showConfirmPassword ? "text" : "password"} className={inputCls} placeholder="Min 8 characters" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300 focus:outline-none">{showConfirmPassword ? "Hide" : "Show"}</button>
                </div>
                {errors.confirmPassword && <p className={errorCls}>{errors.confirmPassword.message}</p>}
              </div>
              <div>
                <Label htmlFor="dateOfBirth" className={labelCls}>Date of Birth</Label>
                <Input {...register("dateOfBirth")} type="date" className={inputCls} />
                {errors.dateOfBirth && <p className={errorCls}>{errors.dateOfBirth.message}</p>}
              </div>

              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} className={`w-full h-11 rounded-xl bg-gradient-to-r from-[#036464] to-teal-500 dark:from-teal-700 dark:to-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 hover:-translate-y-0.5 transition-all duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {isSubmitting ? "Creating Account..." : "Continue"}
              </Button>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-center font-medium">
              Already have an account?{' '}
              <Link to={'/SignIn'} className="text-teal-600 dark:text-teal-400 font-bold hover:text-teal-800 dark:hover:text-teal-300 hover:underline underline-offset-4 transition-all duration-300">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

export default SignUp;