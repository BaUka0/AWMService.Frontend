import axiosInstance from './axiosConfig';

export const applicationService = {
    /**
     * Создать заявку на тему
     */
    create: async (topicId, motivationLetter) => {
        const response = await axiosInstance.post('/applications', {
            topicId,
            motivationLetter
        });
        return response.data; // Возвращает ID новой заявки
    },

    /**
     * Получить заявки на определенную тему
     */
    getByTopic: async (topicId, status = null) => {
        const params = {};
        if (status) params.status = status;

        const response = await axiosInstance.get(`/applications/by-topic/${topicId}`, { params });
        return response.data;
    },

    /**
     * Получить мои заявки (заявки текущего студента)
     */
    getMy: async (academicYearId = null) => {
        const params = {};
        if (academicYearId) params.academicYearId = academicYearId;

        const response = await axiosInstance.get('/applications/my', { params });
        return response.data;
    },

    /**
     * Принять заявку (выполняется руководителем)
     */
    accept: async (applicationId) => {
        const response = await axiosInstance.post(`/applications/${applicationId}/accept`);
        return response.data;
    },

    /**
     * Отклонить заявку (выполняется руководителем)
     */
    reject: async (applicationId, rejectReason) => {
        const response = await axiosInstance.post(`/applications/${applicationId}/reject`, {
            rejectReason
        });
        return response.data;
    },

    /**
     * Отозвать (удалить) свою заявку студентом
     */
    withdraw: async (applicationId) => {
        const response = await axiosInstance.delete(`/applications/${applicationId}`);
        return response.data;
    }
};
