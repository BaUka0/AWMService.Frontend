import axiosInstance from './axiosConfig';

export const directionService = {
    /**
     * Получить направления кафедры
     */
    getByDepartment: async (departmentId, academicYearId, params = {}) => {
        const response = await axiosInstance.get('/directions/by-department', {
            params: {
                departmentId,
                academicYearId,
                ...params
            }
        });
        return response.data;
    },

    /**
     * Получить направления руководителя
     */
    getBySupervisor: async (supervisorId, academicYearId, params = {}) => {
        const response = await axiosInstance.get('/directions/by-supervisor', {
            params: {
                supervisorId,
                academicYearId,
                ...params
            }
        });
        return response.data;
    },

    /**
     * Получить направление по ID
     */
    getById: async (id, includeDeleted = false) => {
        const response = await axiosInstance.get(`/directions/${id}`, {
            params: { includeDeleted }
        });
        return response.data;
    },

    /**
     * Создать направление
     */
    create: async (data) => {
        const response = await axiosInstance.post('/directions', data);
        return response.data; // Возвращает ID
    },

    /**
     * Обновить направление
     */
    update: async (id, data) => {
        const response = await axiosInstance.put(`/directions/${id}`, data);
        return response.data;
    },

    /**
     * Отправить направление на проверку
     */
    submit: async (id) => {
        const response = await axiosInstance.post(`/directions/${id}/submit`);
        return response.data;
    },

    /**
     * Утвердить направление (кафедра)
     */
    approve: async (id) => {
        const response = await axiosInstance.post(`/directions/${id}/approve`);
        return response.data;
    },

    /**
     * Отклонить направление (кафедра)
     */
    reject: async (id, comment) => {
        const response = await axiosInstance.post(`/directions/${id}/reject`, { comment });
        return response.data;
    },

    /**
     * Отправить направление на доработку (кафедра)
     */
    requestRevision: async (id, comment) => {
        const response = await axiosInstance.post(`/directions/${id}/request-revision`, { comment });
        return response.data;
    },
};
