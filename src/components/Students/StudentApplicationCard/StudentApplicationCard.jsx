import React from 'react';
import './StudentApplicationCard.css';

const statusMap = {
    pending: { text: 'На рассмотрении', className: 'status-pending' },
    approved: { text: 'Одобрена', className: 'status-approved' },
    rejected: { text: 'Отклонена', className: 'status-rejected' },
};

export function StudentApplicationCard({ application }) {
    const getStatus = (app) => {
        if (app.isApproved) return "approved";
        if (app.isRejected) return "rejected";
        return "pending";
    };

    const statusKey = getStatus(application);
    const status = statusMap[statusKey] || statusMap.pending;

    const topicTitle = application.topic?.titleRu || application.topic?.titleKz || application.topic?.titleEn || "Без названия";
    const supervisorName = application.topic?.supervisorFullName || "Руководитель не указан";

    return (
        <div className="student-application-card">
            <div className="app-card-content">
                <h3 className="app-card-title">{topicTitle}</h3>
                <p className="app-card-supervisor">Научный руководитель: {supervisorName}</p>
                {statusKey === "rejected" && application.reviewComment && (
                    <div className="reject-note">
                        <small>Причина отказа: {application.reviewComment}</small>
                    </div>
                )}
            </div>
            <div className="app-card-status">
                <span className={`status-badge ${status.className}`}>{status.text}</span>
                {statusKey === "pending" && (
                    <button className="cancel-button">Отменить заявку</button>
                )}
            </div>
        </div>
    );
}
