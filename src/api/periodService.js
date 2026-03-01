import axiosInstance from './axiosConfig';

export const WorkflowStage = {
    DirectionSubmission: 0,
    TopicCreation: 1,
    TopicSelection: 2,
    PreDefense1: 3,
    PreDefense2: 4,
    PreDefense3: 5,
    FinalDefense: 6,
};

export const periodService = {
    /**
     * Получить периоды кафедры за учебный год
     */
    getByDepartment: async (departmentId, academicYearId) => {
        const response = await axiosInstance.get(
            `/departments/${departmentId}/periods`,
            { params: { academicYearId } }
        );
        return response.data;
    },

    /**
     * Утвердить начальные периоды (направления, темы, выбор тем)
     */
    approveInitial: async (departmentId, academicYearId, periods) => {
        await axiosInstance.post(
            `/departments/${departmentId}/periods/approve-initial`,
            {
                periods: periods.map(p => ({
                    ...p,
                    workflowStage: WorkflowStage[p.workflowStage] ?? p.workflowStage,
                })),
            },
            { params: { academicYearId } }
        );
    },

    /**
     * Получить активные периоды (с фильтрацией по этапу)
     */
    getActive: async (departmentId, academicYearId, stage) => {
        const response = await axiosInstance.get(
            `/departments/${departmentId}/periods/active`,
            { params: { academicYearId, ...(stage !== undefined && { stage }) } }
        );
        return response.data;
    },

    /**
     * Создать период
     */
    create: async (departmentId, data) => {
        const response = await axiosInstance.post(
            `/departments/${departmentId}/periods`,
            {
                ...data,
                workflowStage: WorkflowStage[data.workflowStage] ?? data.workflowStage,
            }
        );
        return response.data;
    },

    /**
     * Обновить период
     */
    update: async (departmentId, periodId, data) => {
        await axiosInstance.put(
            `/departments/${departmentId}/periods/${periodId}`,
            data
        );
    }
};
