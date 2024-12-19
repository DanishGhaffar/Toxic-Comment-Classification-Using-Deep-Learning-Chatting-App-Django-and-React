// src/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';  // Correct import based on the error message
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
  );
  const [user, setUser] = useState(() =>
    authTokens ? jwtDecode(authTokens.access) : null
  );

  const loginUser = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/token/', { username, password });
      setAuthTokens(response.data);
      setUser(jwtDecode(response.data.access));
      localStorage.setItem('authTokens', JSON.stringify(response.data));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
  };

  const updateToken = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/token/refresh/', {
        refresh: authTokens.refresh,
      });
      setAuthTokens(response.data);
      setUser(jwtDecode(response.data.access));
      localStorage.setItem('authTokens', JSON.stringify(response.data));
    } catch (error) {
      console.error('Token refresh failed:', error);
      logoutUser();
    }
  };

  useEffect(() => {
    let interval = setInterval(() => {
      if (authTokens) {
        updateToken();
      }
    }, 4 * 60 * 1000); // Refresh token every 4 minutes
    return () => clearInterval(interval);
  }, [authTokens]);

  const contextData = {
    user,
    authTokens,
    loginUser,
    logoutUser,
  };

  return <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>;
};
