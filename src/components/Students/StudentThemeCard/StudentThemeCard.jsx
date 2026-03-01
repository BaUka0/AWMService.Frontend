import React from 'react';
import './StudentThemeCard.css';

export function StudentThemeCard({ theme, onApply, onCancel, onReapply }) {
    const { id, titleRu, titleKz, titleEn, description, students = [], maxParticipants = 1, direction, workTypeId, status, reviewComment } = theme;

    const availableSlots = maxParticipants - students.length;
    const isFull = availableSlots <= 0;

    const displayTitle = titleRu || titleKz || titleEn;
    const supervisorName = theme.supervisorFullName || "Руководитель не указан";
    const directionName = direction?.titleRu || `Направление #${theme.directionId}`;

    const workTypeLabels = {
        0: "Курсовая работа",
        1: "Дипломная работа/Бакалавриат",
        2: "Магистерская диссертация",
        3: "Докторская диссертация",
    };

    // Мини-бэджик статуса (только текст и цвет)
    const renderStatusLabel = () => {
        if (status === 'applied') return <span className="status-text text-pending">● На рассмотрении</span>;
        if (status === 'rejected') return <span className="status-text text-rejected">● Отклонено</span>;
        return null;
    };

    const renderAction = () => {

        if (status === 'applied') {
            return (
                <button className="btn-compact btn-danger" onClick={() => onCancel(id)}>
                    Отменить
                </button>
            );
        }
        if (status === 'rejected') {
            return (
                <button className="btn-compact btn-primary" onClick={() => onReapply(id)}>
                    Подать снова
                </button>
            );
        }

        return (
            <button
                className={`btn-compact ${isFull ? 'btn-disabled' : 'btn-outline-primary'}`}
                onClick={() => onApply(id)}
                disabled={isFull}
            >
                {isFull ? 'Занято' : 'Выбрать'}
            </button>
        );
    };

    return (
        <div className={`theme-card-compact ${status === 'rejected' ? 'rejected-border' : ''}`}>

            {/* ВЕРХ: Руководитель + Статус */}
            <div className="compact-header">
                <span className="supervisor-sm">{supervisorName}</span>
                {renderStatusLabel()}
            </div>

            {/* ЦЕНТР: Заголовок + Описание */}
            <div className="compact-body">
                <h4 className="title-sm">{displayTitle}</h4>
                <p className="desc-sm">{description}</p>

                {status === 'rejected' && reviewComment && (
                    <div className="reject-note">
                        Причина: {reviewComment}
                    </div>
                )}
            </div>

            {/* НИЗ: Инфо + Кнопка */}
            <div className="compact-footer">
                <div className="meta-row">
                    <span className="meta-item">{directionName}</span>
                    <span className="meta-dot">•</span>
                    <span className="meta-item">{workTypeLabels[workTypeId]}</span>
                    <span className="meta-dot">•</span>
                    <span className={`meta-item ${availableSlots <= 0 ? 'text-red' : ''}`}>
                        {availableSlots > 0 ? `${availableSlots} места` : 'Мест нет'}
                    </span>
                </div>
                {renderAction()}
            </div>

        </div>
    );
}