// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hasRole } from '../permissions';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, requiredRoles = [], checkBlocked = false }) => {
    const { access, user } = useSelector((state) => ({
        access: state.auth.access,
        user: state.auth.user,
    }));

    // Debugging logs
    console.log("ProtectedRoute - Access:", access);
    console.log("ProtectedRoute - User:", user);
    console.log("ProtectedRoute - checkBlocked:", checkBlocked);

    // If no access token, user is not authenticated
    if (!access) {
        return <Navigate to="/login" replace />;
    }

    // If user data is not loaded yet, show a loader
    if (access && !user) {
        return <div>Loading...</div>; // Replace with a spinner component if desired
    }

    // If checkBlocked is true and user is blocked, redirect to unauthorized
    if (checkBlocked && user && user.is_blocked) {
        return <Navigate to="/unauthorized" replace />;
    }

    // If certain roles are required, verify user roles
    if (requiredRoles.length > 0 && !hasRole(user, requiredRoles)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requiredRoles: PropTypes.arrayOf(PropTypes.string),
    checkBlocked: PropTypes.bool,
};

export default ProtectedRoute;
