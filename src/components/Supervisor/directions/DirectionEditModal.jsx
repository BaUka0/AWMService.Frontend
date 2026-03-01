import React, { useState, useEffect } from "react";
import { X, Edit3, Globe, AlignLeft } from "lucide-react";
import "./DirectionEditModal.css";

export default function DirectionEditModal({ direction, onClose, onSave }) {
    const getDirectionStatus = (dir) => {
        if (dir?.isApproved) return "approved";
        if (dir?.isPending) return "pending";
        if (dir?.isRejected) return "rejected";
        return "draft";
    };

    const [form, setForm] = useState({
        id: direction?.id ?? Date.now().toString(),
        departmentId: direction?.departmentId ?? 1,
        supervisorId: direction?.supervisorId ?? 0,
        academicYearId: direction?.academicYearId ?? 1,
        titleRu: direction?.titleRu ?? "",
        titleKz: direction?.titleKz ?? "",
        titleEn: direction?.titleEn ?? "",
        description: direction?.description ?? "",
        status: getDirectionStatus(direction),
        createdAt: direction?.createdAt ?? new Date().toISOString(),
        reviewComment: direction?.reviewComment ?? null,
    });

    useEffect(() => {
        if (direction) {
            setForm({
                id: direction.id,
                departmentId: direction.departmentId ?? 1,
                supervisorId: direction.supervisorId ?? 0,
                academicYearId: direction.academicYearId ?? 1,
                titleRu: direction.titleRu ?? "",
                titleKz: direction.titleKz ?? "",
                titleEn: direction.titleEn ?? "",
                description: direction.description ?? "",
                status: getDirectionStatus(direction),
                createdAt: direction.createdAt ?? new Date().toISOString(),
                reviewComment: direction.reviewComment ?? null,
            });
        }
    }, [direction]);

    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveClick = () => {
        onSave(form);
    };

    return (
        <div className="dem-overlay" onClick={onClose}>
            <div className="dem-modal" onClick={(e) => e.stopPropagation()}>
                <div className="dem-header">
                    <div className="dem-header-text">
                        <div className="dem-title-row">
                            <Edit3 size={20} className="dem-icon-edit" />
                            <h2>Редактирование</h2>
                        </div>
                        <p>Внесите изменения в информацию о направлении</p>
                    </div>
                    <button className="dem-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="dem-body">
                    {/* Title Section */}
                    <div className="dem-section">
                        <div className="dem-section-label">
                            <Globe size={16} />
                            <h3>Название направления</h3>
                        </div>

                        <div className="dem-input-group">
                            <div className="dem-field">
                                <div className="dem-lang-tag">KK</div>
                                <input
                                    className="dem-input"
                                    value={form.titleKz}
                                    onChange={(e) => handleChange("titleKz", e.target.value)}
                                    placeholder={`Название (KK)...`}
                                />
                            </div>
                            <div className="dem-field">
                                <div className="dem-lang-tag">RU</div>
                                <input
                                    className="dem-input"
                                    value={form.titleRu}
                                    onChange={(e) => handleChange("titleRu", e.target.value)}
                                    placeholder={`Название (RU)...`}
                                />
                            </div>
                            <div className="dem-field">
                                <div className="dem-lang-tag">EN</div>
                                <input
                                    className="dem-input"
                                    value={form.titleEn}
                                    onChange={(e) => handleChange("titleEn", e.target.value)}
                                    placeholder={`Название (EN)...`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="dem-section">
                        <div className="dem-section-label">
                            <AlignLeft size={16} />
                            <h3>Описание направления</h3>
                        </div>

                        <div className="dem-input-group">
                            <div className="dem-field vertical">
                                <textarea
                                    className="dem-textarea"
                                    value={form.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    placeholder={`Описание...`}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dem-footer">
                    <button className="dem-btn-secondary" onClick={onClose}>
                        Отмена
                    </button>
                    <button className="dem-btn-primary" onClick={handleSaveClick}>
                        Сохранить изменения
                    </button>
                </div>
            </div>
        </div>
    );
}