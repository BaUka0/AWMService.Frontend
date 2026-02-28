import axios from 'axios';

// Замените этот URL на реальный базовый URL вашего бэкенда при необходимости.
const baseURL = 'http://localhost:5102/api/v1';

const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Добавляем перехватчик запросов для установки токена
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Перехватчик ответов (для глобальной обработки 401 Unauthorized и Refresh Token)
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            // Игнорируем логин и сам рефреш-запрос
            if (originalRequest.url.includes('/login') || originalRequest.url.includes('/refresh-token')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    // Используем чистый axios чтобы не триггерить интерсепторы
                    const refreshResponse = await axios.post(`${baseURL}/Auth/refresh-token`, {
                        refreshToken: refreshToken
                    });

                    const newToken = refreshResponse.data.token;
                    const newRefreshToken = refreshResponse.data.refreshToken;

                    localStorage.setItem('token', newToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    processQueue(null, newToken);

                    return axiosInstance(originalRequest);
                } catch (err) {
                    processQueue(err, null);
                    // Refresh token failed or expired
                    console.error("Refresh token failed", err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            } else {
                console.error("Unauthorized! No refresh token.");
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
