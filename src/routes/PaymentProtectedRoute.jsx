import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../pages/Loading';

const PaymentProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkPayment = () => {
      try {
        const tokenString = localStorage.getItem('payment_token');
        if (!tokenString) {
          return false;
        }
        const tokenData = JSON.parse(tokenString);
        if (tokenData && tokenData.expiry && Date.now() < tokenData.expiry) {
          return true;
        }
        // If expired, clear it
        localStorage.removeItem('payment_token');
        return false;
      } catch (err) {
        return false;
      }
    };

    if (!checkPayment()) {
      const timer = setTimeout(() => {
        navigate('/checkout');
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsValid(true);
    }
  }, [navigate]);

  if (!isValid) {
    return (
      <Loading 
        head="This feature requires an active subscription."
        prag="Redirecting to checkout…"
      />
    );
  }

  return children;
};

export default PaymentProtectedRoute;
