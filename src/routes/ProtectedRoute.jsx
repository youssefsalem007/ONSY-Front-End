import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/cookieUtils';
import Loading from '../pages/Loading';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = getToken();

  useEffect(() => {
    if (!token) {
      const timer = setTimeout(() => {
        navigate("/signin");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [token, navigate]);

  if (!token) {
    return (
      <Loading 
        head="You must log in first to use this page."
        prag="Redirecting…"
      />
    );
  }
  return children;
};

export default ProtectedRoute;