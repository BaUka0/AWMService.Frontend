import axiosInstance from './axiosConfig';

export const topicService = {
    /**
     * Получить тему по ID
     */
    getById: async (id) => {
        const response = await axiosInstance.get(`/topics/${id}`);
        return response.data;
    },

    /**
     * Получить доступные темы
     */
    getAvailable: async (departmentId, academicYearId) => {
        const response = await axiosInstance.get('/topics/available', {
            params: {
                departmentId,
                academicYearId
            }
        });
        return response.data;
    },

    /**
     * Получить темы определенного направления
     */
    getByDirection: async (directionId) => {
        const response = await axiosInstance.get(`/topics/by-direction/${directionId}`);
        return response.data;
    },

    /**
     * Создать тему
     */
    create: async (data) => {
        const response = await axiosInstance.post('/topics', data);
        return response.data; // Возвращает ID
    },

    /**
     * Обновить тему
     */
    update: async (id, data) => {
        const response = await axiosInstance.put(`/topics/${id}`, data);
        return response.data;
    },

    /**
     * Отправить тему на проверку
     */
    submit: async (id) => {
        const response = await axiosInstance.post(`/topics/${id}/submit`);
        return response.data;
    },

    /**
     * Удалить тему
     */
    delete: async (id) => {
        const response = await axiosInstance.delete(`/topics/${id}`);
        return response.data;
    }
};
