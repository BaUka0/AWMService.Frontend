import axiosInstance from './axiosConfig';

export const authService = {
    /**
     * Выполняет вход пользователя в систему
     * @param {string} login - логин пользователя
     * @param {string} password - пароль пользователя
     * @returns {Promise<Object>} Возвращает данные токена и пользователя
     */
    login: async (login, password) => {
        const response = await axiosInstance.post('/auth/login', {
            login,
            password
        });
        return response.data;
    },

    /**
     * Регистрация нового пользователя (если потребуется в будущем)
     */
    register: async (login, email, password, universityId) => {
        const response = await axiosInstance.post('/auth/register', {
            login,
            email,
            password,
            universityId
        });
        return response.data;
    },

    /**
     * Обновление access-токена с использованием refresh-токена
     */
    refreshToken: async (refreshToken) => {
        const response = await axiosInstance.post('/Auth/refresh-token', {
            refreshToken
        });
        return response.data;
    },

    /**
     * Получает полный профиль авторизованного пользователя
     */
    getMe: async () => {
        const response = await axiosInstance.get('/Users/me');
        return response.data;
    }
};
