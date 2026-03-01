import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Eye, Edit, Send, Calendar, AlertCircle } from "lucide-react";
import CreateDirectionModal from "../../../components/Supervisor/CreateDirectionModal/CreateDirectionModal";
import DirectionViewModal from "../../../components/Supervisor/directions/DirectionViewModal";
import DirectionEditModal from "../../../components/Supervisor/directions/DirectionEditModal";
import { useAuth } from "../../../context/AuthContext";
import { directionService } from "../../../api/directionService";
import "./SDirectionsPage.css";

const statusLabels = {
    draft: "Черновик",
    pending: "На рассмотрении",
    approved: "Утверждено",
    rejected: "Отклонено",
};

// Helper for mapping DTO properties linearly to our status component
const getDirectionStatus = (direction) => {
    if (direction.isApproved) return "approved";
    if (direction.isPending) return "pending";
    if (direction.isRejected) return "rejected";
    return "draft";
};

export default function SDirectionsPage() {
    const [directions, setDirections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth(); // Предполагаем, что supervisorId это userId

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDirection, setSelectedDirection] = useState(null);

    const fetchDirections = async () => {
        try {
            setIsLoading(true);
            // Используем ID из контекста пользователя (подгружаются при логине)
            const data = await directionService.getBySupervisor(
                user.userId,
                user.currentAcademicYearId
            );
            setDirections(data);
        } catch (error) {
            console.error("Failed to fetch directions", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.userId) {
            fetchDirections();
        }
    }, [user]);

    const handleCreateDirection = async (newDirection) => {
        try {
            await directionService.create({
                departmentId: user.departmentId,
                supervisorId: user.userId,
                academicYearId: user.currentAcademicYearId,
                titleRu: newDirection.title.ru,
                titleKz: newDirection.title.kk,
                titleEn: newDirection.title.en,
                description: newDirection.description.ru || newDirection.description.kk,
            });
            await fetchDirections();
        } catch (error) {
            console.error("Failed to create direction", error);
        }
    };

    const handleSendForReview = async (id) => {
        try {
            await directionService.submit(id);
            await fetchDirections();
        } catch (error) {
            console.error("Failed to submit direction", error);
        }
    };

    const openView = (direction) => {
        setSelectedDirection(direction);
        setIsViewModalOpen(true);
    };

    const openEdit = (direction) => {
        setSelectedDirection(direction);
        setIsEditModalOpen(true);
    };

    return (
        <div className="directions-page">
            <header className="directions-header">
                <div className="header-text">
                    <h1>Направления</h1>
                    <p>Управление темами и областями дипломных проектов</p>
                </div>
                <button
                    className="btn-create-new"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <Plus size={20} strokeWidth={1.5} />
                    <span>Создать направление</span>
                </button>
            </header>

            {directions.length === 0 ? (
                <div className="empty-state-wrapper">
                    <div className="empty-icon-circle">
                        <BookOpen size={40} strokeWidth={1.5} />
                    </div>
                    <h3>Список направлений пуст</h3>
                    <p>Вы еще не создали ни одного направления для работы со студентами</p>
                    <button className="btn-empty-action" onClick={() => setIsCreateModalOpen(true)}>
                        Создать первое направление
                    </button>
                </div>
            ) : (
                <div className="directions-grid-layout">
                    {directions.map((direction) => {
                        const status = getDirectionStatus(direction);
                        return (
                            <div key={direction.id} className={`custom-dir-card status-border-${status}`}>
                                <div className="card-inner-content">
                                    <div className="card-meta-top">
                                        <span className={`status-badge badge-${status}`}>
                                            {statusLabels[status]}
                                        </span>
                                        <span className="creation-date">
                                            <Calendar size={13} strokeWidth={2} />
                                            {new Date(direction.createdAt).toLocaleDateString("ru-RU")}
                                        </span>
                                    </div>

                                    <h3 className="direction-item-title">
                                        {direction.titleRu || direction.titleKz || direction.titleEn}
                                    </h3>
                                    <p className="direction-item-desc">
                                        {direction.description}
                                    </p>

                                    {status === "rejected" && direction.reviewComment && (
                                        <div className="rejection-box">
                                            <AlertCircle size={14} />
                                            <span>{direction.reviewComment}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="card-footer-actions">
                                    <div className="left-actions">
                                        <button className="minimal-btn" onClick={() => openView(direction)} title="Просмотр">
                                            <Eye size={18} />
                                            <span>Детали</span>
                                        </button>
                                        {status === "draft" && (
                                            <button className="minimal-btn" onClick={() => openEdit(direction)} title="Редактировать">
                                                <Edit size={18} />
                                                <span>Правка</span>
                                            </button>
                                        )}
                                    </div>

                                    {status === "draft" && (
                                        <button
                                            className="send-for-review-btn"
                                            onClick={() => handleSendForReview(direction.id)}
                                        >
                                            <Send size={14} />
                                            Отправить
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {isCreateModalOpen && (
                <CreateDirectionModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={(payload) => {
                        handleCreateDirection(payload);
                        setIsCreateModalOpen(false);
                    }}
                />
            )}
            {isViewModalOpen && selectedDirection && (
                <DirectionViewModal
                    direction={selectedDirection}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedDirection(null);
                    }}
                />
            )}
            {isEditModalOpen && selectedDirection && (
                <DirectionEditModal
                    direction={selectedDirection}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedDirection(null);
                    }}
                    onSave={async (updated) => {
                        try {
                            await directionService.update(updated.id, {
                                titleRu: updated.titleRu,
                                titleKz: updated.titleKz,
                                titleEn: updated.titleEn,
                                description: updated.description
                            });
                            await fetchDirections();
                            setIsEditModalOpen(false);
                            setSelectedDirection(null);
                        } catch (error) {
                            console.error("Failed to update direction", error);
                        }
                    }}
                />
            )}
        </div>
    );
}