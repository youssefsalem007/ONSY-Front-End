import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../utils/cookieUtils';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axiosInstance';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [analysisState, setAnalysisState] = useState(null);
  const [analysisTimestamp, setAnalysisTimestamp] = useState(null);
  const lastAnalysisId = useRef(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const isVercel = import.meta.env.VITE_API_URL?.includes('vercel.app');

    if (isVercel) {
      // Vercel doesn't support persistent WebSockets, fallback to HTTP Polling
      const pollInterval = setInterval(async () => {
        try {
          const res = await axiosInstance.get('/analysis/latest');
          const latest = res.data?.data;
          
          if (latest && latest._id !== lastAnalysisId.current) {
            if (lastAnalysisId.current !== null) {
              // Only trigger toast for NEW updates after initialization
              toast.success('✅ AI Analysis complete! Your dashboard has been updated.', {
                toastId: 'analysis-update',
              });
            }
            lastAnalysisId.current = latest._id;
            setAnalysisState(latest);
            setAnalysisTimestamp(Date.now());
          }
        } catch (err) {
          // Ignore polling errors to prevent console spam
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(pollInterval);
    } else {
      // Standard Socket.io connection for non-serverless backends
      let userId = null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        userId = payload._id || payload.id;
      } catch (err) {
        console.error('Failed to parse token payload for socket join', err);
      }

      const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
        auth: { token },
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
        if (userId) {
          socketInstance.emit('join', userId);
        }
      });

      socketInstance.on('analysis:update', (data) => {
        console.log('Received analysis:update', data);
        setAnalysisState(data);
        setAnalysisTimestamp(Date.now());
        toast.success('✅ AI Analysis complete! Your dashboard has been updated.', {
          toastId: 'analysis-update',
        });
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, analysisState, setAnalysisState, analysisTimestamp }}>
      {children}
    </SocketContext.Provider>
  );
};
