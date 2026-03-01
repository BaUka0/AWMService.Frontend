import React, { useState } from "react";
import "./DirectionModal.css";

const DirectionModal = ({ direction, onClose, onUpdateStatus }) => {
    const [formType, setFormType] = useState(null); // null | 'reject' | 'revision'
    const [comment, setComment] = useState("");
    const [language, setLanguage] = useState("ru");

    if (!direction) return null;

    const isPending = direction.status === "На рассмотрении";
    const isRejected = direction.status === "Отклонено";

    const handleSubmitForm = () => {
        if (!comment.trim()) return;
        if (formType === 'reject') {
            onUpdateStatus(direction.id, "Отклонено", comment);
        } else if (formType === 'revision') {
            onUpdateStatus(direction.id, "Требует доработки", comment);
        }
        handleClose();
    };

    const handleClose = () => {
        setFormType(null);
        setComment("");
        onClose();
    };

    const getTitle = () => direction.title[language];
    const getDescription = () => direction.description[language];

    const statusClass =
        isPending ? "dm-status--pending"
        : isRejected ? "dm-status--rejected"
        : direction.status === "Требует доработки" ? "dm-status--revision"
        : "dm-status--approved";

    return (
        <div className="dm-overlay" onClick={handleClose}>
            <div
                className="dm-content"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="dm-header">
                    <div className={`dm-status ${statusClass}`}>
                        {direction.status}
                    </div>

                    <div className="dm-lang-switch">
                        {["ru", "kz", "en"].map((lang) => (
                            <button
                                key={lang}
                                className={`dm-lang-btn ${
                                    language === lang ? "dm-lang-btn--active" : ""
                                }`}
                                onClick={() => setLanguage(lang)}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SCROLL AREA */}
                <div className="dm-scroll-area">
                    <h2 className="dm-title">{getTitle()}</h2>
                    <p className="dm-subtitle">
                        Информация о направлении дипломной работы
                    </p>

                    <div className="dm-body">
                        <div className="dm-info-grid">
                            <div className="dm-info-item">
                                <span className="dm-info-item__label">Тип работы</span>
                                <span className="dm-info-item__value">{direction.type}</span>
                            </div>
                            <div className="dm-info-item">
                                <span className="dm-info-item__label">
                                    Научный руководитель
                                </span>
                                <span className="dm-info-item__value">
                                    {direction.supervisor}
                                </span>
                            </div>
                            <div className="dm-info-item">
                                <span className="dm-info-item__label">Дата подачи</span>
                                <span className="dm-info-item__value">
                                    {direction.submittedAt}
                                </span>
                            </div>
                        </div>

                        <div className="dm-section">
                            <span className="dm-section__title">
                                Описание направления
                            </span>
                            <div className="dm-description-box">
                                <p>{getDescription()}</p>
                            </div>
                        </div>

                        {/* ПРИЧИНА ОТКАЗА (ПОСЛЕ ОТКЛОНЕНИЯ) */}
                        {isRejected && direction.rejectionReason && (
                            <div className="dm-rejected-info">
                                <span className="dm-rejected-info__label">
                                    Причина отказа
                                </span>
                                <p className="dm-rejected-info__text">
                                    {direction.rejectionReason}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="dm-footer">
                        {isPending ? (
                            formType === null ? (
                                <div className="dm-footer__actions dm-footer__actions--three">
                                    <button
                                        className="dm-btn dm-btn--reject"
                                        onClick={() => setFormType('reject')}
                                    >
                                        Отклонить
                                    </button>
                                    <button
                                        className="dm-btn dm-btn--revision"
                                        onClick={() => setFormType('revision')}
                                    >
                                        Доработка
                                    </button>
                                    <button
                                        className="dm-btn dm-btn--approve"
                                        onClick={() => {
                                            onUpdateStatus(direction.id, "Утверждено");
                                            handleClose();
                                        }}
                                    >
                                        Утвердить
                                    </button>
                                </div>
                            ) : (
                                <div className="dm-rejection-form">
                                    <h3 className="dm-rejection-form__title">
                                        {formType === 'reject' ? 'Причина отклонения' : 'Замечания к доработке'}
                                    </h3>
                                    <textarea
                                        className="dm-rejection-form__textarea"
                                        placeholder="Подробно опишите, что нужно исправить..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="dm-rejection-form__buttons">
                                        <button
                                            className="dm-btn dm-btn--ghost"
                                            onClick={() => {
                                                setFormType(null);
                                                setComment("");
                                            }}
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            className={`dm-btn ${formType === 'reject' ? 'dm-btn--confirm-reject' : 'dm-btn--confirm-revision'}`}
                                            onClick={handleSubmitForm}
                                            disabled={!comment.trim()}
                                        >
                                            {formType === 'reject' ? 'Подтвердить отказ' : 'Отправить на доработку'}
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : (
                            <button
                                className="dm-btn dm-btn--close"
                                onClick={handleClose}
                            >
                                Закрыть
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectionModal;