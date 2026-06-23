import axiosInstance from '../utils/axiosInstance';
import { setToken } from '../utils/cookieUtils';

export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/signup', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const googleSignup = async (idToken) => {
  try {
    const response = await axiosInstance.post('/auth/google-signup', { idToken });
    const token = response.data?.data?.access_token; 
    if (token) {
      setToken(token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const googleLogin = async (idToken) => {
  try {
    const response = await axiosInstance.post('/auth/google-login', { idToken });
    const token = response.data?.data?.access_token; 
    if (token) {
      setToken(token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (otpData) => {
  try {
    const response = await axiosInstance.post('/auth/verify-otp', otpData);
    if (response.data.token) setToken(response.data.token);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post('/auth/signin', credentials);
  
  const token = response.data?.data?.access_token; 
  if (token) {
    setToken(token);
  }
  return response.data;
};

export const resendOtp = async (email) => {
    const response = await axiosInstance.post('/auth/resend-otp', { email });
    return response.data;
  };
  
  export const forgotPasswordApi = async (data) => {
    const response = await axiosInstance.post('/auth/forget-password', data);
    return response.data;
  };

export const ForgetPasswordOtp = async (otpData) => {
  try {
    const response = await axiosInstance.post('/auth/verify-forget-password-otp', otpData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const ResetPasswordApi = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/reset-password', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutUserApi = async () => {
  try {
    const response = await axiosInstance.post('/auth/signout');
    return response.data;
  } catch (error) {
    throw error;
  }
};
