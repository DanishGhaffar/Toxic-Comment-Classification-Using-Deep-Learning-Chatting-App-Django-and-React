// src/components/RoleProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
    const auth = useSelector((state) => state.auth);

    if (!auth.access) {
        return <Navigate to="/login" replace />;
    }
    
    if (!allowedRoles.includes(auth.user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default RoleProtectedRoute;
