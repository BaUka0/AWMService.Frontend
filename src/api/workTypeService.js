import axiosInstance from './axiosConfig';

export const workTypeService = {
    /**
     * Получает список всех типов работ
     * @returns {Promise<Array>} Список типов работ [{id, name, degreeLevelId}, ...]
     */
    getAll: async () => {
        const response = await axiosInstance.get('/WorkTypes');
        return response.data;
    }
};
