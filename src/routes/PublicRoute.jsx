import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/cookieUtils';
import Loading from '../pages/Loading';

const PublicRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = getToken();

  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [token, navigate]);

  if (token) {
    return (
      <Loading 
        head="You are already logged in!"
        prag="Taking you home…"
      />
    );
  }
  return children;
};

export default PublicRoute;