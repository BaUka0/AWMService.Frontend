import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';
import axiosInstance from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Проверяем наличие токена и инициализируем состояние
        if (token) {
            try {
                // Если мы распарсим токен, или достанем юзера из localStorage.
                // Временно будем хранить юзера в localStorage тоже.
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);
                } else {
                    // Если токен есть, а пользователя нет - сбрасываем (или можно сделать запрос на whoami, если такой есть)
                    logout();
                }
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
                logout();
            }
        }
        setIsLoading(false);
    }, [token]);

    const login = async (loginName, password) => {
        setIsLoading(true);
        try {
            const data = await authService.login(loginName, password);

            const newToken = data.token;
            const newRefreshToken = data.refreshToken;

            // Сначала сохраняем токены, чтобы axiosInstance мог их использовать
            localStorage.setItem('token', newToken);
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }
            setToken(newToken); // Обновляем state сразу, чтобы axiosConfig (если он зависит от state/storage) мог подхватить

            // Сразу после логина запрашиваем полный профиль
            const profile = await authService.getMe();

            // Собираем полный объект пользователя
            const userData = {
                login: profile.login,
                userId: profile.userId,
                email: profile.email,
                roles: profile.roles || [], // Или data.roles, но profile.roles надежнее
                departmentId: profile.departmentId,
                currentAcademicYearId: profile.currentAcademicYearId,
                staffId: profile.staffId,      // Staff.Id
                studentId: profile.studentId,  // Student.Id (если есть)
            };

            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));

            return userData;
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    };

    const value = {
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        hasRole: (role) => user?.roles?.includes(role)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
