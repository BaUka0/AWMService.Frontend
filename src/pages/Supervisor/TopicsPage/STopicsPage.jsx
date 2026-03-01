import React, { useState, useEffect } from "react";
import {
    Plus, BookText, Calendar, Users, Eye, Edit3, Send, Info, Trash2
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { topicService } from "../../../api/topicService";
import { directionService } from "../../../api/directionService";
import { applicationService } from "../../../api/applicationService";
import CreateTopicModal from "../../../components/Supervisor/CreateTopicModal/CreateTopicModal.jsx";
import TopicViewModal from "../../../components/Supervisor/topics/TopicViewModal";
import TopicEditModal from "../../../components/Supervisor/topics/TopicEditModal";
import "./STopicsPage.css";

const workTypeLabels = {
    0: "Курсовая работа",
    1: "Дипломная работа/Бакалавриат",
    2: "Магистерская диссертация",
    3: "Докторская диссертация",
};

const getTopicStatus = (topic) => {
    if (topic.isApproved) return "approved";
    if (topic.isPending) return "pending";
    if (topic.isRejected) return "rejected";
    return "draft";
};

export default function STopicsPage() {
    const { user } = useAuth();
    const [topics, setTopics] = useState([]);
    const [directions, setDirections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);

    // Fetch topics and their applications
    const fetchTopics = async () => {
        try {
            setIsLoading(true);
            // Используем ID из контекста пользователя (подгружаются при логине)
            const allTopics = await topicService.getAvailable(
                user.departmentId,
                user.currentAcademicYearId
            );
            const myTopics = allTopics.filter(t => t.supervisorId === user.userId);

            // Fetch applications for each topic
            const topicsWithApps = await Promise.all(myTopics.map(async (topic) => {
                const apps = await applicationService.getByTopic(topic.id);
                // Поделить заявки на "принятые" (students) и "на рассмотрении" (requests)
                // По API статусы заявок: "Accepted", "Pending", "Rejected"
                const acceptedUsers = apps.filter(a => a.status === "Accepted" || a.isAccepted);
                const pendingRequests = apps.filter(a => a.status === "Pending" || a.isPending);

                return {
                    ...topic,
                    students: acceptedUsers.map(a => ({ id: a.studentId, fullName: `Студент #${a.studentId}` })), // В API пока только studentId, имя надо вытягивать из SSO, обойдемся ИДшкой
                    requests: pendingRequests.map(a => ({
                        id: a.id,
                        student: { id: a.studentId, fullName: `Студент #${a.studentId}` },
                        createdAt: a.appliedAt
                    }))
                };
            }));

            setTopics(topicsWithApps);
        } catch (error) {
            console.error("Failed to fetch topics", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch directions for the Create/Edit modala
    const fetchDirections = async () => {
        try {
            const data = await directionService.getBySupervisor(
                user.userId,
                user.currentAcademicYearId
            );
            setDirections(data);
        } catch (error) {
            console.error("Failed to fetch directions", error);
        }
    };

    useEffect(() => {
        if (user?.userId) {
            fetchTopics();
            fetchDirections();
        }
    }, [user]);

    /* ===== CREATE ===== */
    const handleCreateTopic = async (topicPayload) => {
        try {
            await topicService.create({
                departmentId: user.departmentId,
                supervisorId: user.userId,
                academicYearId: user.currentAcademicYearId,
                workTypeId: parseInt(topicPayload.workTypeId) || 1, // Используем из модалки
                directionId: parseInt(topicPayload.directionId),
                titleRu: topicPayload.title.ru,
                titleKz: topicPayload.title.kk,
                titleEn: topicPayload.title.en,
                description: topicPayload.description.ru || topicPayload.description.kk,
                maxParticipants: topicPayload.studentCount || 1
            });
            await fetchTopics();
            setIsCreateOpen(false);
        } catch (error) {
            console.error("Failed to create topic", error);
        }
    };

    /* ===== SEND FOR REVIEW ===== */
    const handleSendForReview = async (id) => {
        try {
            await topicService.submit(id);
            await fetchTopics();
        } catch (error) {
            console.error("Failed to submit topic", error);
        }
    };

    /* ===== ЛОГИКА ОДОБРЕНИЯ ЗАЯВКИ ===== */
    const handleApproveStudent = async (requestId) => {
        try {
            await applicationService.accept(requestId);
            await fetchTopics();
            setIsViewOpen(false); // Закроем модалку для простоты рефреша
            setSelectedTopic(null);
        } catch (error) {
            console.error("Failed to accept application", error);
        }
    };

    /* ===== ЛОГИКА ОТКЛОНЕНИЯ ЗАЯВКИ ===== */
    const handleRejectStudent = async (requestId, reason) => {
        try {
            await applicationService.reject(requestId, reason);
            await fetchTopics();
            setIsViewOpen(false);
            setSelectedTopic(null);
        } catch (error) {
            console.error("Failed to reject application", error);
        }
    };

    const openView = (topic) => {
        setSelectedTopic(topic);
        setIsViewOpen(true);
    };

    const openEdit = (topic) => {
        setSelectedTopic(topic);
        setIsEditOpen(true);
    };

    const handleSaveEdit = async (updatedTopic) => {
        try {
            await topicService.update(updatedTopic.id, {
                titleRu: updatedTopic.titleRu,
                titleKz: updatedTopic.titleKz,
                titleEn: updatedTopic.titleEn,
                description: updatedTopic.description,
                // ...other editable fields if supported by UI
            });
            await fetchTopics();
            setIsEditOpen(false);
            setSelectedTopic(null);
        } catch (error) {
            console.error("Failed to update topic", error);
        }
    };

    return (
        <div className="topics-page">
            <div className="topics-container">
                <header className="topics-header">
                    <div className="header-text">
                        <h1>Мои темы</h1>
                        <p>Управление темами и областями дипломных проектов</p>
                    </div>
                    <button className="btn-create-new" onClick={() => setIsCreateOpen(true)}>
                        <Plus size={18} />
                        <span>Создать тему</span>
                    </button>
                </header>

                <div className="topics-grid">
                    {topics.map(topic => {
                        const status = getTopicStatus(topic);
                        const maxParts = topic.maxParticipants || 1;
                        return (
                            <div
                                key={topic.id}
                                className={`topic-card status-border-${status}`}
                            >
                                <div className="topic-card-body">
                                    <div className="card-top-row">
                                        <div className="card-date">
                                            <Calendar size={13} />
                                            {new Date(topic.createdAt).toLocaleDateString("ru-RU")}
                                        </div>
                                        <span className={`status-pill pill-${status}`}>
                                            {statusLabels[status]}
                                        </span>
                                    </div>

                                    <div className="card-direction-badge">
                                        {topic.direction?.titleRu || `Направление #${topic.directionId}`}
                                    </div>

                                    <h3 className="card-title">{topic.titleRu || topic.titleKz || topic.titleEn}</h3>
                                    <p className="card-description">{topic.description}</p>

                                    {status === "rejected" && topic.reviewComment && (
                                        <div className="card-rejection-info">
                                            <Info size={14} />
                                            <span>{topic.reviewComment}</span>
                                        </div>
                                    )}

                                    <div className="card-stats-row">
                                        <div className="stat-item">
                                            <Users size={14} />
                                            <span>
                                                {topic.students?.length > 0
                                                    ? `Студентов: ${topic.students.length}/${maxParts}`
                                                    : "Нет студентов"}
                                            </span>
                                        </div>
                                        <div className="stat-item">
                                            <BookText size={14} />
                                            <span>{workTypeLabels[topic.workTypeId] || "Тип работы"}</span>
                                        </div>
                                        {/* Индикатор новых заявок */}
                                        {topic.requests?.length > 0 && (
                                            <div className="stat-item requests-indicator">
                                                <div className="indicator-dot"></div>
                                                <span>Заявок: {topic.requests.length}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="topic-card-footer">
                                    <button
                                        className="btn-details-link"
                                        onClick={() => openView(topic)}
                                    >
                                        <Eye size={16} />
                                        <span>Детали</span>
                                    </button>

                                    {status === "draft" && (
                                        <div className="draft-actions-group">
                                            <button
                                                className="btn-icon-only"
                                                onClick={() => openEdit(topic)}
                                            >
                                                <Edit3 size={16} />
                                            </button>

                                            <button
                                                className="btn-send-mini"
                                                onClick={() => handleSendForReview(topic.id)}
                                                title="Отправить на рассмотрение"
                                            >
                                                <Send size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ===== MODALS ===== */}
            <CreateTopicModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreate={handleCreateTopic}
                directions={directions}
            />

            <TopicViewModal
                open={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                topic={selectedTopic}
                onApproveStudent={handleApproveStudent} // Передаем функцию
                onRejectStudent={handleRejectStudent}   // Передаем функцию
            />

            <TopicEditModal
                open={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                topic={selectedTopic}
                onSave={handleSaveEdit}
                directions={directions}
            />
        </div>
    );
}