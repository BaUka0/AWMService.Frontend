import React, { useState, useEffect } from "react";
import { X, Calendar, BookText, AlignLeft, AlertCircle } from "lucide-react";
import "./DirectionViewModal.css";

const statusLabels = {
    draft: "Черновик",
    pending: "На рассмотрении",
    approved: "Утверждено",
    rejected: "Отклонено",
};

export default function DirectionViewModal({ onClose, direction }) {
    const [titleTab, setTitleTab] = useState("ru");
    const [descTab, setDescTab] = useState("ru");

    useEffect(() => {
        if (direction) {
            if (direction.titleRu) setTitleTab("ru");
            else if (direction.titleKz) setTitleTab("kk");
            else setTitleTab("en");
        }
    }, [direction]);

    if (!direction) return null;

    const formatDate = (iso) => {
        if (!iso) return "—";
        try {
            return new Date(iso).toLocaleDateString("ru-RU", {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return iso ?? "—";
        }
    };

    return (
        <div className="dvm-overlay" onClick={onClose}>
            <div className="dvm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="dvm-header">
                    <div className="dvm-header-info">
                        <h2>Детали направления</h2>
                        <span className={`dvm-status-pill st-${direction.status}`}>
                            {statusLabels[direction.status] || direction.status}
                        </span>
                    </div>
                    <button className="dvm-close-btn" onClick={onClose}>
                        <X size={20} strokeWidth={2} />
                    </button>
                </div>

                <div className="dvm-content">
                    {/* Если статус отклонен — показываем причину сразу сверху */}
                    {direction.status === "rejected" && direction.rejectionReason && (
                        <div className="dvm-rejection-alert">
                            <AlertCircle size={20} />
                            <div className="dvm-rejection-content">
                                <strong>Причина отклонения:</strong>
                                <p>{direction.rejectionReason}</p>
                            </div>
                        </div>
                    )}

                    <div className="dvm-info-grid">
                        <div className="dvm-info-card">
                            <Calendar size={18} />
                            <div className="dvm-info-text">
                                <label>Дата создания</label>
                                <span>{formatDate(direction.createdAt)}</span>
                            </div>
                        </div>
                        {direction.approvedAt && (
                            <div className="dvm-info-card">
                                <Calendar size={18} />
                                <div className="dvm-info-text">
                                    <label>Дата утверждения</label>
                                    <span>{formatDate(direction.approvedAt)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="dvm-section">
                        <div className="dvm-section-header">
                            <div className="dvm-section-title">
                                <BookText size={18} />
                                <h3>Название направления</h3>
                            </div>
                            <div className="dvm-tabs-mini">
                                <button className={`dvm-tab-btn ${titleTab === "kk" ? "active" : ""}`} onClick={() => setTitleTab("kk")}>KK</button>
                                <button className={`dvm-tab-btn ${titleTab === "ru" ? "active" : ""}`} onClick={() => setTitleTab("ru")}>RU</button>
                                <button className={`dvm-tab-btn ${titleTab === "en" ? "active" : ""}`} onClick={() => setTitleTab("en")}>EN</button>
                            </div>
                        </div>
                        <div className="dvm-text-box">
                            {titleTab === "kk" && (direction.titleKz || <span className="dvm-no-data">Информация отсутствует</span>)}
                            {titleTab === "ru" && (direction.titleRu || <span className="dvm-no-data">Информация отсутствует</span>)}
                            {titleTab === "en" && (direction.titleEn || <span className="dvm-no-data">Информация отсутствует</span>)}
                        </div>
                    </div>

                    <div className="dvm-section">
                        <div className="dvm-section-header">
                            <div className="dvm-section-title">
                                <AlignLeft size={18} />
                                <h3>Подробное описание</h3>
                            </div>
                        </div>
                        <div className="dvm-text-box description-area">
                            {direction.description || <span className="dvm-no-data">Описание не заполнено</span>}
                        </div>
                    </div>
                </div>

                <div className="dvm-footer">
                    <button className="dvm-btn-primary" onClick={onClose}>Понятно</button>
                </div>
            </div>
        </div>
    );
}