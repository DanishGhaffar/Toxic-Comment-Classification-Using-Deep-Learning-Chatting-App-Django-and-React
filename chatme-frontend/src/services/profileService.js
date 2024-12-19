// src/services/profileService.js
import API from '../api';

export const getProfile = async () => {
    const response = await API.get('profile/');
    return response.data;
};

export const updateProfile = async (data) => {
    // data should be a FormData object if uploading images
    const response = await API.patch('profile/', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};
