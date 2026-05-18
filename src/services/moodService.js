import axiosInstance from '../utils/axiosInstance';

export const getAllMoods = async () => {
    try {
        const response = await axiosInstance.get('/mood/all-moods');
        return response.data?.data || response.data;
    } catch (error) {
        throw error;
    }
};


export const logMood = async (moodValue) => {
    const response = await axiosInstance.post('/mood/create-mood', {
        mood: moodValue
    });
    return response.data?.data || response.data;
};

export const getMoodById = async (moodId) => {
    try {
        const response = await axiosInstance.get(`/mood/${moodId}`);
        return response.data?.data || response.data;
    } catch (error) {
        throw error;
    }
};

export const updateMood = async (moodId, moodValue) => {
    try {
        const response = await axiosInstance.patch(`/mood/${moodId}`, { mood: moodValue });
        return response.data?.data || response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteMood = async (moodId) => {
    try {
        const response = await axiosInstance.delete(`/mood/${moodId}`);
        return response.data?.data || response.data;
    } catch (error) {
        throw error;
    }
};
