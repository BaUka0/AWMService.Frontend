import React, { useEffect, useState } from "react";
import { X, Globe, AlignLeft, Info, Layers, Users, AlertCircle } from "lucide-react";
import "./CreateTopicModal.css";

export default function CreateTopicModal({ open, onClose, onCreate, directions = [] }) {
    const [form, setForm] = useState({
        directionId: "",
        title: { kk: "", ru: "", en: "" },
        description: { kk: "", ru: "", en: "" },
        workTypeId: "",
        studentCount: "1",
    });

    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (!open) {
            setForm({
                directionId: "",
                title: { kk: "", ru: "", en: "" },
                description: { kk: "", ru: "", en: "" },
                workTypeId: "",
                studentCount: "1",
            });
            setTouched(false);
        }
    }, [open]);

    if (!open) return null;

    const updateField = (path, value) => {
        if (!path.includes(".")) {
            setForm(p => ({ ...p, [path]: value }));
            return;
        }
        const [parent, child] = path.split(".");
        setForm(p => ({ ...p, [parent]: { ...p[parent], [child]: value } }));
    };

    const valid = () => {
        const hasDirection = form.directionId.toString().trim() !== "";
        const hasTitle = (form.title.kk + form.title.ru + form.title.en).trim() !== "";
        const hasDesc = (form.description.kk + form.description.ru + form.description.en).trim() !== "";
        const hasWorkType = form.workTypeId.toString().trim() !== "";
        return hasDirection && hasTitle && hasDesc && hasWorkType;
    };

    const handleSave = () => {
        setTouched(true);
        if (!valid()) return;

        const topic = {
            titleRu: form.title.ru.trim(),
            titleKz: form.title.kk.trim(),
            titleEn: form.title.en.trim(),
            description: (form.description.ru || form.description.kk || form.description.en).trim(),
            directionId: Number(form.directionId),
            workTypeId: Number(form.workTypeId),
            maxParticipants: parseInt(form.studentCount, 10) || 1,
        };

        onCreate?.(topic);
        onClose();
    };

    return (
        <div className="ctm-overlay" onClick={onClose}>
            <div className="ctm-modal" onClick={e => e.stopPropagation()}>
                <div className="ctm-header">
                    <div className="ctm-header-text">
                        <h2>Создать новую тему</h2>
                        <p>Заполните информацию о проекте на трех языках</p>
                    </div>
                    <button className="ctm-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="ctm-body">
                    {/* Direction */}
                    <div className="ctm-section">
                        <div className="ctm-section-label">
                            <Info size={16} className="ctm-icon-muted" />
                            <h3>Направление</h3>
                        </div>
                        <select
                            className={`ctm-select ${touched && !form.directionId ? "invalid" : ""}`}
                            value={form.directionId}
                            onChange={e => updateField("directionId", e.target.value)}
                        >
                            <option value="">Выберите направление из списка...</option>
                            {directions.map((d) => (
                                <option key={d.id} value={d.id}>{d.titleRu || d.titleKz || d.titleEn}</option>
                            ))}
                        </select>
                    </div>

                    {/* Titles */}
                    <div className="ctm-section">
                        <div className="ctm-section-label">
                            <Globe size={16} className="ctm-icon-muted" />
                            <h3>Название темы</h3>
                        </div>
                        <div className="ctm-input-group">
                            <div className={`ctm-field ${touched && !form.title.kk && !form.title.ru && !form.title.en ? "invalid" : ""}`}>
                                <div className="ctm-lang-tag">KK</div>
                                <input
                                    className="ctm-input"
                                    placeholder="Тақырып атауы..."
                                    value={form.title.kk}
                                    onChange={e => updateField("title.kk", e.target.value)}
                                />
                            </div>
                            <div className="ctm-field">
                                <div className="ctm-lang-tag">RU</div>
                                <input
                                    className="ctm-input"
                                    placeholder="Название темы..."
                                    value={form.title.ru}
                                    onChange={e => updateField("title.ru", e.target.value)}
                                />
                            </div>
                            <div className="ctm-field">
                                <div className="ctm-lang-tag">EN</div>
                                <input
                                    className="ctm-input"
                                    placeholder="Topic title..."
                                    value={form.title.en}
                                    onChange={e => updateField("title.en", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="ctm-section">
                        <div className="ctm-section-label">
                            <AlignLeft size={16} className="ctm-icon-muted" />
                            <h3>Описание и задачи</h3>
                        </div>
                        <div className="ctm-input-group">
                            <div className={`ctm-field vertical ${touched && !form.description.kk && !form.description.ru && !form.description.en ? "invalid" : ""}`}>
                                <div className="ctm-lang-tag">KK</div>
                                <textarea
                                    className="ctm-textarea"
                                    placeholder="Сипаттамасы..."
                                    value={form.description.kk}
                                    onChange={e => updateField("description.kk", e.target.value)}
                                />
                            </div>

                            <div className="ctm-field vertical">
                                <div className="ctm-lang-tag">RU</div>
                                <textarea
                                    className="ctm-textarea"
                                    placeholder="Описание..."
                                    value={form.description.ru}
                                    onChange={e => updateField("description.ru", e.target.value)}
                                />
                            </div>

                            {/*  EN DESCRIPTION */}
                            <div className="ctm-field vertical">
                                <div className="ctm-lang-tag">EN</div>
                                <textarea
                                    className="ctm-textarea"
                                    placeholder="Description..."
                                    value={form.description.en}
                                    onChange={e => updateField("description.en", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Params */}
                    <div className="ctm-grid-params">
                        <div className="ctm-section">
                            <div className="ctm-section-label">
                                <Layers size={16} className="ctm-icon-muted" />
                                <h3>Тип работы</h3>
                            </div>
                            <select
                                className={`ctm-select ${touched && !form.workTypeId ? "invalid" : ""}`}
                                value={form.workTypeId}
                                onChange={e => updateField("workTypeId", e.target.value)}
                            >
                                <option value="">Выберите...</option>
                                <option value="0">Курсовая работа</option>
                                <option value="1">Дипломная работа/Бакалавриат</option>
                                <option value="2">Магистерская диссертация</option>
                                <option value="3">Докторская диссертация</option>
                            </select>
                        </div>

                        <div className="ctm-section">
                            <div className="ctm-section-label">
                                <Users size={16} className="ctm-icon-muted" />
                                <h3>Студентов</h3>
                            </div>
                            <select
                                className="ctm-select"
                                value={form.studentCount}
                                onChange={e => updateField("studentCount", e.target.value)}
                            >
                                <option value="1">1 студент</option>
                                <option value="2">2 студента</option>
                                <option value="3">3 студента</option>
                            </select>
                        </div>
                    </div>

                    {touched && !valid() && (
                        <div className="ctm-error-notice">
                            <AlertCircle size={14} />
                            <span>
                                Заполните обязательные поля (направление, тип и описание хотя бы на одном языке)
                            </span>
                        </div>
                    )}
                </div>

                <div className="ctm-footer">
                    <button className="ctm-btn-secondary" onClick={onClose}>
                        Отмена
                    </button>
                    <button
                        className={`ctm-btn-primary ${!valid() && touched ? "disabled" : ""}`}
                        onClick={handleSave}
                    >
                        Создать тему
                    </button>
                </div>
            </div>
        </div>
    );
}
