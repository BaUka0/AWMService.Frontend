import React, { useState, useEffect } from "react";
import { X, Edit3, Globe, AlignLeft, Layers, Users, Info } from "lucide-react";
import "./TopicEditModal.css";

export default function TopicEditModal({ open, onClose, topic, onSave, directions }) {
    const [form, setForm] = useState({
        titleRu: "",
        titleKk: "",
        titleEn: "",
        description: "",
        directionId: "",
        workTypeId: 2, // Defaulting to 1 based on temporary hardcode
        participantCount: 1,
    });

    useEffect(() => {
        if (topic) {
            setForm({
                titleRu: topic.titleRu ?? "",
                titleKk: topic.titleKk ?? "",
                titleEn: topic.titleEn ?? "",
                description: topic.description ?? "",
                directionId: topic.directionId ?? "",
                workTypeId: topic.workTypeId ?? 1,
                participantCount: topic.maxParticipants ?? 1,
            });
        }
    }, [topic]);

    if (!open || !topic) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const updatedTopic = {
            ...topic,
            titleRu: form.titleRu,
            titleKz: form.titleKk,
            titleEn: form.titleEn,
            description: form.description,
            directionId: Number(form.directionId),
            workTypeId: Number(form.workTypeId),
            maxParticipants: Number(form.participantCount),
        };

        onSave(updatedTopic);
    };

    return (
        <div className="tem-overlay" onClick={onClose}>
            <div className="tem-modal" onClick={(e) => e.stopPropagation()}>
                <div className="tem-header">
                    <div className="tem-header-text">
                        <div className="tem-title-row">
                            <Edit3 size={18} className="tem-icon-accent" />
                            <h2>Редактирование темы</h2>
                        </div>
                        <p>Внесите изменения в параметры темы</p>
                    </div>
                    <button className="tem-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="tem-body">
                    {/* Название */}
                    <div className="tem-section">
                        <div className="tem-section-label">
                            <Globe size={16} className="tem-icon-muted" />
                            <h3>Название темы</h3>
                        </div>
                        <div className="tem-input-group">
                            <div className="tem-field">
                                <div className="tem-lang-tag">KK</div>
                                <input
                                    name="titleKk"
                                    value={form.titleKk}
                                    onChange={handleChange}
                                    placeholder="Тақырып атауы..."
                                    className="tem-input"
                                />
                            </div>
                            <div className="tem-field">
                                <div className="tem-lang-tag">RU</div>
                                <input
                                    name="titleRu"
                                    value={form.titleRu}
                                    onChange={handleChange}
                                    placeholder="Название темы..."
                                    className="tem-input"
                                />
                            </div>
                            <div className="tem-field">
                                <div className="tem-lang-tag">EN</div>
                                <input
                                    name="titleEn"
                                    value={form.titleEn}
                                    onChange={handleChange}
                                    placeholder="Topic title..."
                                    className="tem-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Описание */}
                    <div className="tem-section">
                        <div className="tem-section-label">
                            <AlignLeft size={16} className="tem-icon-muted" />
                            <h3>Описание и задачи</h3>
                        </div>
                        <div className="tem-input-group">
                            <div className="tem-field vertical">
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    className="tem-textarea-fixed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Параметры */}
                    <div className="tem-grid-params">
                        <div className="tem-section">
                            <div className="tem-section-label">
                                <Info size={16} className="tem-icon-muted" />
                                <h3>Направление</h3>
                            </div>
                            <select
                                name="directionId"
                                value={form.directionId}
                                onChange={handleChange}
                                className="tem-select"
                            >
                                <option value="">Выберите...</option>
                                {directions.map((d) => (
                                    <option key={d.id} value={d.id}>{d.titleRu || d.titleKz || d.titleEn}</option>
                                ))}
                            </select>
                        </div>

                        <div className="tem-section">
                            <div className="tem-section-label">
                                <Layers size={16} className="tem-icon-muted" />
                                <h3>Тип работы</h3>
                            </div>
                            <select
                                name="workTypeId"
                                value={form.workTypeId}
                                onChange={handleChange}
                                className="tem-select"
                            >
                                <option value="0">Курсовая работа</option>
                                <option value="1">Дипломная работа/Бакалавриат</option>
                                <option value="2">Магистерская диссертация</option>
                                <option value="3">Докторская диссертация</option>
                            </select>
                        </div>

                        <div className="tem-section">
                            <div className="tem-section-label">
                                <Users size={16} className="tem-icon-muted" />
                                <h3>Студентов</h3>
                            </div>
                            <input
                                type="number"
                                min="1"
                                name="participantCount"
                                value={form.participantCount}
                                onChange={handleChange}
                                className="tem-input-number"
                            />
                        </div>
                    </div>
                </div>

                <div className="tem-footer">
                    <button className="tem-btn-secondary" onClick={onClose}>
                        Отмена
                    </button>
                    <button className="tem-btn-primary" onClick={handleSave}>
                        Сохранить изменения
                    </button>
                </div>
            </div>
        </div>
    );
}
