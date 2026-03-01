import React, { useState, useEffect } from "react";
import "./TimePeriodsPage.css";

import TimePeriodCard from "../../../components/Department/TimePeriods/TimePeriodCard/TimePeriodCard.jsx";
import TimePeriodFormDialog from "../../../components/Department/TimePeriods/TimePeriodFormDialog/TimePeriodFormDialog.jsx";
import { periodService } from "../../../api/periodService.js";
import { useAuth } from "../../../context/AuthContext.jsx";

import plusIcon from "../../../assets/icons/plus-icon.svg";

const INITIAL_STAGES = [
    { key: "DirectionSubmission", label: "Формирование направлений ДП/ДР" },
    { key: "TopicCreation",       label: "Формирование тем ДП/ДР" },
    { key: "TopicSelection",      label: "Выбор тем студентами" },
];

const INITIAL_STAGE_KEYS = new Set(INITIAL_STAGES.map(s => s.key));

// Метки для этапов предзащит/защиты (workflowStage → отображаемое название)
const NON_INITIAL_STAGE_LABELS = {
    "PreDefense1":  "Предзащита 1",
    "PreDefense2":  "Предзащита 2",
    "PreDefense3":  "Предзащита 3",
    "FinalDefense": "Защита",
};

// Маппинг названия из диалога → workflowStage для API
const NAME_TO_STAGE = {
    "Предзащита 1": "PreDefense1",
    "Предзащита 2": "PreDefense2",
    "Предзащита 3": "PreDefense3",
    "Защита":       "FinalDefense",
};

const emptyDates = () => ({ startDate: "", endDate: "" });

export default function TimePeriodsPage() {
    const { user } = useAuth();
    const departmentId = user?.departmentId;
    const academicYearId = user?.currentAcademicYearId;

    // ── Этап 2: начальные периоды ──────────────────────────────────────
    const [initialPeriods, setInitialPeriods] = useState({
        DirectionSubmission: emptyDates(),
        TopicCreation:       emptyDates(),
        TopicSelection:      emptyDates(),
    });
    const [periodsApproved, setPeriodsApproved] = useState(false);
    const [savedPeriods, setSavedPeriods] = useState(null); // снимок после последнего сохранения
    const [isLoadingPeriods, setIsLoadingPeriods] = useState(true);
    const [isApprovingPeriods, setIsApprovingPeriods] = useState(false);
    const [periodsError, setPeriodsError] = useState(null);

    // ── Временные периоды (предзащиты/защита) ─────────────────────────
    const [timePeriods, setTimePeriods] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Загрузить начальные периоды
    useEffect(() => {
        if (!departmentId || !academicYearId) {
            setIsLoadingPeriods(false);
            return;
        }
        loadInitialPeriods();
    }, [departmentId, academicYearId]);

    const loadInitialPeriods = async () => {
        setIsLoadingPeriods(true);
        setPeriodsError(null);
        try {
            const data = await periodService.getByDepartment(departmentId, academicYearId);
            const updated = { ...initialPeriods };
            let anyFound = false;
            INITIAL_STAGES.forEach(({ key }) => {
                const found = data.find(p => p.workflowStage === key);
                if (found) {
                    anyFound = true;
                    updated[key] = {
                        startDate: found.startDate ? found.startDate.slice(0, 10) : "",
                        endDate:   found.endDate   ? found.endDate.slice(0, 10)   : "",
                    };
                }
            });
            setInitialPeriods(updated);
            setSavedPeriods(updated);
            setPeriodsApproved(anyFound);

            // Загрузить периоды предзащит/защиты из БД
            const otherPeriods = data
                .filter(p => !INITIAL_STAGE_KEYS.has(p.workflowStage))
                .map(p => ({
                    id:          p.id,
                    name:        NON_INITIAL_STAGE_LABELS[p.workflowStage] || p.workflowStage,
                    startDate:   p.startDate ? p.startDate.slice(0, 10) : "",
                    endDate:     p.endDate   ? p.endDate.slice(0, 10)   : "",
                    commissions: 0,
                    students:    0,
                    dates:       0,
                    progress:    0,
                    status:      "upcoming",
                }));
            setTimePeriods(otherPeriods);
        } catch (err) {
            setPeriodsError("Не удалось загрузить периоды");
            console.error(err);
        } finally {
            setIsLoadingPeriods(false);
        }
    };

    const handleDateChange = (stageKey, field, value) => {
        setInitialPeriods(prev => ({
            ...prev,
            [stageKey]: { ...prev[stageKey], [field]: value }
        }));
    };

    const handleApprovePeriods = async () => {
        const periods = INITIAL_STAGES
            .map(({ key }) => ({
                workflowStage: key,
                startDate: initialPeriods[key].startDate
                    ? new Date(initialPeriods[key].startDate).toISOString()
                    : null,
                endDate: initialPeriods[key].endDate
                    ? new Date(initialPeriods[key].endDate).toISOString()
                    : null,
            }))
            .filter(p => p.startDate && p.endDate);

        if (periods.length !== INITIAL_STAGES.length) {
            alert("Укажите даты начала и окончания для всех трёх периодов.");
            return;
        }

        setIsApprovingPeriods(true);
        try {
            await periodService.approveInitial(departmentId, academicYearId, periods);
            setSavedPeriods({ ...initialPeriods });
            setPeriodsApproved(true);
        } catch (err) {
            const data = err.response?.data;
            let msg = "Не удалось утвердить периоды";
            if (data) {
                if (data.errors) {
                    // ASP.NET Core ModelState errors: { errors: { "Field": ["msg1"] } }
                    const messages = Object.entries(data.errors)
                        .flatMap(([field, msgs]) => msgs.map(m => `${field}: ${m}`));
                    msg = messages.join('\n') || data.title || msg;
                } else if (typeof data === 'string') {
                    msg = data;
                } else if (data.detail || data.title) {
                    msg = data.detail || data.title;
                }
            }
            console.error("Не удалось утвердить периоды", data || err);
            setPeriodsError(msg);
        } finally {
            setIsApprovingPeriods(false);
        }
    };

    const allFilled = INITIAL_STAGES.every(
        ({ key }) => initialPeriods[key].startDate && initialPeriods[key].endDate
    );

    const hasUnsavedChanges = savedPeriods === null ||
        INITIAL_STAGES.some(({ key }) =>
            initialPeriods[key].startDate !== savedPeriods[key]?.startDate ||
            initialPeriods[key].endDate   !== savedPeriods[key]?.endDate
        );

    // ── Pre-defense period management ────────────────────────────────
    const handleAddPeriod = async (formData) => {
        const workflowStage = NAME_TO_STAGE[formData.name];
        try {
            const newId = await periodService.create(departmentId, {
                departmentId,
                academicYearId,
                workflowStage,
                startDate: new Date(formData.startDate).toISOString(),
                endDate:   new Date(formData.endDate).toISOString(),
            });
            const newPeriod = {
                id:          newId,
                name:        formData.name,
                startDate:   formData.startDate,
                endDate:     formData.endDate,
                commissions: 0,
                students:    0,
                dates:       0,
                progress:    0,
                status:      "upcoming",
            };
            setTimePeriods((prev) => [...prev, newPeriod]);
        } catch (err) {
            console.error("Не удалось создать период", err);
        }
        setIsDialogOpen(false);
    };

    const deletePeriod = (id) => {
        setTimePeriods((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <div className="time-periods-page">

            {/* ── Этап 2: Начальные периоды ── */}
            <section className="initial-periods-section">
                <div className="page-header">
                    <div>
                        <h1 className="ip-title">Периоды и сроки</h1>
                        <p className="ip-subtitle">Установите сроки для основных этапов учебного года</p>
                    </div>
                    <button
                        className="ip-approve-btn"
                        onClick={handleApprovePeriods}
                        disabled={isApprovingPeriods || !allFilled || (periodsApproved && !hasUnsavedChanges)}
                    >
                        {isApprovingPeriods
                            ? "Сохранение..."
                            : periodsApproved && !hasUnsavedChanges
                                ? "✓ Периоды утверждены"
                                : "Утвердить периоды"
                        }
                    </button>
                </div>

                {periodsError && (
                    <p className="ip-error">{periodsError}</p>
                )}

                {isLoadingPeriods ? (
                    <p className="ip-loading">Загрузка периодов...</p>
                ) : (
                    <div className="ip-table">
                        <div className="ip-table-header">
                            <span>Этап</span>
                            <span>Дата начала</span>
                            <span>Дата окончания</span>
                        </div>
                        {INITIAL_STAGES.map(({ key, label }) => (
                            <div key={key} className="ip-table-row">
                                <span className="ip-stage-label">{label}</span>
                                <input
                                    type="date"
                                    className="ip-date-input"
                                    value={initialPeriods[key].startDate}
                                    onChange={e => handleDateChange(key, "startDate", e.target.value)}
                                />
                                <input
                                    type="date"
                                    className="ip-date-input"
                                    value={initialPeriods[key].endDate}
                                    min={initialPeriods[key].startDate}
                                    onChange={e => handleDateChange(key, "endDate", e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Периоды предзащит и защиты ── */}
            <section style={{ marginTop: "2.5rem" }}>
                <div className="page-header">
                    <div>
                        <h2 className="ip-title" style={{ fontSize: "1rem" }}>Периоды предзащит и защиты</h2>
                        <p className="ip-subtitle">Создание периодов для настройки комиссий и расписания</p>
                    </div>
                    <button
                        className="ip-add-btn"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <img src={plusIcon} alt="Add" style={{ width: "1rem", height: "1rem", marginRight: "0.5rem", filter: "brightness(0) invert(1)" }} />
                        Добавить период
                    </button>
                </div>

                <div className="periods-list">
                    {timePeriods.map((period) => (
                        <TimePeriodCard
                            key={period.id}
                            period={period}
                            onDelete={() => deletePeriod(period.id)}
                        />
                    ))}
                    {timePeriods.length === 0 && (
                        <div className="empty-state">
                            Периоды предзащит пока не добавлены
                        </div>
                    )}
                </div>
            </section>

            <TimePeriodFormDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={handleAddPeriod}
            />
        </div>
    );
}
