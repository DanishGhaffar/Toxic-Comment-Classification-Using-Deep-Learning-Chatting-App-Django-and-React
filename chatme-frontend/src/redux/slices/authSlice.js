// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api';
import { jwtDecode } from 'jwt-decode'; // Named import for version 4.x

const accessToken = localStorage.getItem('access') || null;
const refreshToken = localStorage.getItem('refresh') || null;

let user = null;
if (accessToken) {
    try {
        const decoded = jwtDecode(accessToken);
        user = { 
            id: decoded.user_id, 
            email: decoded.email, 
            role: decoded.role,
            is_blocked: decoded.is_blocked ?? false // Use nullish coalescing
        };
    } catch (error) {
        console.error('Invalid access token', error);
    }
}

const initialState = {
    user: user,
    access: accessToken,
    refresh: refreshToken,
    status: 'idle',
    error: null,
};

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await API.post('register/', userData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await API.post('login/', { email, password });
            // Decode the access token to get user info
            const decoded = jwtDecode(response.data.access);
            console.log('Decoded JWT:', decoded); // Debugging line
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const refreshTokenThunk = createAsyncThunk(
    'auth/refreshToken',
    async (refresh, { rejectWithValue }) => {
        try {
            const response = await API.post('login/refresh/', { refresh });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.access = null;
            state.refresh = null;
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('role');
            localStorage.removeItem('is_blocked');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.access = action.payload.access;
                state.refresh = action.payload.refresh;
                
                // Decode the access token to get user info
                const decoded = jwtDecode(action.payload.access);
                console.log('Decoded JWT in fulfilled:', decoded); // Debugging line
                
                // Extract is_blocked directly from decoded token
                const isBlocked = decoded.is_blocked ?? false;
                
                state.user = { 
                    id: decoded.user_id, 
                    email: decoded.email, 
                    role: action.payload.role, 
                    is_blocked: isBlocked 
                };
            
                // Store tokens and user info in localStorage
                localStorage.setItem('access', action.payload.access);
                localStorage.setItem('refresh', action.payload.refresh);
                localStorage.setItem('role', action.payload.role);
                localStorage.setItem('is_blocked', isBlocked);
            })            
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(refreshTokenThunk.fulfilled, (state, action) => {
                state.access = action.payload.access;
                localStorage.setItem('access', action.payload.access);
                
                // Decode the new access token
                const decoded = jwtDecode(action.payload.access);
                console.log('Decoded JWT after refresh:', decoded);
                
                // Update user state
                state.user = {
                    ...state.user,
                    is_blocked: decoded.is_blocked ?? false,
                };
                localStorage.setItem('is_blocked', decoded.is_blocked ?? false);
            })
            .addCase(refreshTokenThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.user = null;
                state.access = null;
                state.refresh = null;
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                localStorage.removeItem('role');
                localStorage.removeItem('is_blocked');
            });
    },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
