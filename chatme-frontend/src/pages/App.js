// src/App.js
import RoleProtectedRoute from './components/RoleProtectedRoute';
import AdminDashboard from './components/AdminDashboard';
import ModeratorPage from './components/ModeratorPage';

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Inside Routes
<Route
    path="/admin"
    element={
        <RoleProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
        </RoleProtectedRoute>
    }
/>
<Route
    path="/moderator"
    element={
        <RoleProtectedRoute allowedRoles={['admin', 'moderator']}>
            <ModeratorPage />
        </RoleProtectedRoute>
    }
/>
