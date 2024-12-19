// src/api.js
import axios from 'axios';
import store from './redux/store';
import { refreshTokenThunk, logout } from './redux/slices/authSlice';

const API = axios.create({
    baseURL: 'http://localhost:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refresh = localStorage.getItem('refresh');
            if (refresh) {
                try {
                    const resultAction = await store.dispatch(refreshTokenThunk(refresh));
                    if (resultAction.payload) {
                        // Update the Authorization header and retry the original request
                        API.defaults.headers['Authorization'] = `Bearer ${resultAction.payload.access}`;
                        originalRequest.headers['Authorization'] = `Bearer ${resultAction.payload.access}`;
                        return API(originalRequest);
                    }
                } catch (err) {
                    store.dispatch(logout());
                    return Promise.reject(err);
                }
            } else {
                store.dispatch(logout());
            }
        }
        return Promise.reject(error);
    }
);

export default API;
