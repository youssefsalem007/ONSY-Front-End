import axiosInstance from '../utils/axiosInstance';

export const aiService = {
  async sendMessage(message, sessionId = null) {
    try {
      const response = await axiosInstance.post('/ai/send-message', {
        message,
        sessionId
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  async newSession() {
    try {
      const response = await axiosInstance.post('/ai/new-session');
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Error creating new session:", error);
      throw error;
    }
  },

  async getAllSessions() {
    try {
      const response = await axiosInstance.get('/ai/all-sessions');
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Error getting sessions:", error);
      throw error;
    }
  },

  async getSession(id) {
    try {
      const response = await axiosInstance.get(`/ai/session/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Error getting session:", error);
      throw error;
    }
  },

  async getEmotionalTrend() {
    try {
      const response = await axiosInstance.get('/ai/emotional-trend');
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Error getting emotional trend:", error);
      throw error;
    }
  }
};
