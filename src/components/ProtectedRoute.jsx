import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, isLoading, user, hasRole } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Загрузка...</div>;
    }

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if route requires specific roles
    if (allowedRoles && allowedRoles.length > 0) {
        const userRoles = user?.roles?.map(r => r.toLowerCase()) || [];
        const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role.toLowerCase()));

        if (!hasRequiredRole) {
            // User is authenticated but doesn't have the required role
            // Redirect to a default page or a specific unauthorized page
            // Assuming fallback to login or some home page
            console.warn("User lacks required roles:", allowedRoles);
            return <Navigate to="/login" replace />;
        }
    }

    return children;
};
