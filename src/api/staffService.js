import axiosInstance from './axiosConfig';

export const staffService = {
    /**
     * Получить всех преподавателей кафедры
     */
    getByDepartment: async (departmentId) => {
        const response = await axiosInstance.get('/staff', {
            params: { departmentId }
        });
        return response.data;
    },

    /**
     * Получить утверждённых научных руководителей кафедры
     */
    getSupervisors: async (departmentId) => {
        const response = await axiosInstance.get('/staff/supervisors', {
            params: { departmentId }
        });
        return response.data;
    },

    /**
     * Утвердить преподавателей в качестве научных руководителей
     */
    approveSupervisors: async (departmentId, staffIds) => {
        await axiosInstance.post('/staff/approve-supervisors', {
            departmentId,
            staffIds
        });
    },

    /**
     * Обновить лимит студентов у преподавателя
     */
    updateWorkload: async (staffId, maxStudentsLoad) => {
        await axiosInstance.patch(`/staff/${staffId}/workload`, { maxStudentsLoad });
    }
};
