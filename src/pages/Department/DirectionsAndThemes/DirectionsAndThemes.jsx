import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { directionService } from "../../../api/directionService";
import { staffService } from "../../../api/staffService";
import "./DirectionsAndThemes.css";
import DirectionCard from "../../../components/Department/Directions/DirectionCard/DirectionCard.jsx";
import DirectionModal from "../../../components/Department/Directions/DirectionModal/DirectionModal.jsx";
import ThemeModal from "../../../components/Department/Themes/ThemeModal/ThemeModal.jsx";

const workTypeLabels = {
    0: "Курсовая работа",
    1: "Дипломная работа/Бакалавриат",
    2: "Магистерская диссертация",
    3: "Докторская диссертация",
};

const getStatusLabel = (dir) => {
    if (dir.isApproved) return "Утверждено";
    if (dir.isPending) return "На рассмотрении";
    if (dir.isRejected) return "Отклонено";
    if (dir.needsRevision) return "Требует доработки";
    return "Черновик";
};

const normalizeDirection = (dir, staffMap = {}) => ({
    id: dir.id,
    title: {
        ru: dir.titleRu || "",
        kz: dir.titleKz || "",
        en: dir.titleEn || "",
    },
    description: {
        ru: dir.description || "",
        kz: dir.description || "",
        en: dir.description || "",
    },
    status: getStatusLabel(dir),
    supervisor: staffMap[dir.supervisorId] || `НР #${dir.supervisorId}`,
    submittedAt: dir.createdAt
        ? new Date(dir.createdAt).toLocaleDateString("ru-RU")
        : "—",
    type: workTypeLabels[dir.workTypeId] || "Направление",
    rejectionReason: dir.reviewComment || "",
});

// Темы подключаются к API на этапе 4/5
const initialThemes = [
    {
        id: 101,
        title: {
            ru: "Разработка веб-приложения для управления проектами",
            kz: "Жобаларды басқару үшін веб-қосымшаны әзірлеу",
            en: "Development of a Web Application for Project Management",
        },
        description: {
            ru: "Создание и внедрение веб-приложения с использованием React и Node.js...",
            kz: "React және Node.js пайдалана отырып веб-қосымшаны жасау және енгізу...",
            en: "Creating and implementing a web application using React and Node.js...",
        },
        status: "На рассмотрении",
        type: "Дипломная работа",
        supervisor: "Иванов Иван Иванович",
        submittedAt: "01.09.2025",
        students: [
            { id: 1, fullName: "Серикова Айгерим Нурлановна", group: "SE-401" },
            { id: 2, fullName: "Ахметов Данияр Русланович", group: "SE-402" },
        ],
    },
];

const TABS = {
    DIRECTIONS: "directions",
    THEMES: "themes",
};

const DIRECTION_STATUSES = ["Все", "На рассмотрении", "Утверждено", "Отклонено", "Требует доработки"];
const THEME_STATUSES = ["Все", "На рассмотрении", "Утверждено", "Отклонено"];

const DirectionsAndThemes = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const query = new URLSearchParams(location.search);
    const activeTab = query.get("tab") || TABS.DIRECTIONS;

    const [directions, setDirections] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [themes, setThemes] = useState(initialThemes);

    const [selectedDirection, setSelectedDirection] = useState(null);
    const [selectedTheme, setSelectedTheme] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("Все");

    const fetchDirections = async () => {
        if (!user?.departmentId || !user?.currentAcademicYearId) return;
        try {
            setIsLoading(true);
            const [rawDirections, staff] = await Promise.all([
                directionService.getByDepartment(user.departmentId, user.currentAcademicYearId),
                staffService.getByDepartment(user.departmentId),
            ]);
            const staffMap = Object.fromEntries(
                staff.map((s) => [s.id, s.fullName || `${s.lastName || ""} ${s.firstName || ""}`.trim()])
            );
            setDirections(rawDirections.map((dir) => normalizeDirection(dir, staffMap)));
        } catch (err) {
            console.error("Failed to fetch directions", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === TABS.DIRECTIONS) {
            fetchDirections();
        }
    }, [user, activeTab]);

    const changeTab = (tab) => {
        navigate(`?tab=${tab}`);
        setSearchQuery("");
        setFilterStatus("Все");
        setSelectedDirection(null);
        setSelectedTheme(null);
    };

    const getCount = (items, status) => {
        if (status === "Все") return items.length;
        return items.filter((i) => i.status === status).length;
    };

    const filterItems = (items) =>
        items.filter(
            (i) =>
                i.title.ru.toLowerCase().includes(searchQuery.toLowerCase()) &&
                (filterStatus === "Все" || i.status === filterStatus)
        );

    const handleDirectionAction = async (id, newStatus, comment = "") => {
        try {
            if (newStatus === "Утверждено") {
                await directionService.approve(id);
            } else if (newStatus === "Отклонено") {
                await directionService.reject(id, comment);
            } else if (newStatus === "Требует доработки") {
                await directionService.requestRevision(id, comment);
            }
            await fetchDirections();
        } catch (err) {
            console.error("Failed to update direction status", err);
        }
        setSelectedDirection(null);
    };

    const updateThemeStatus = (id, newStatus, rejectionReason = "") => {
        setThemes((prev) =>
            prev.map((theme) =>
                theme.id === id
                    ? { ...theme, status: newStatus, rejectionReason }
                    : theme
            )
        );
        setSelectedTheme(null);
    };

    const isDirections = activeTab === TABS.DIRECTIONS;
    const items = isDirections ? directions : themes;
    const filteredItems = filterItems(items);
    const statusFilters = isDirections ? DIRECTION_STATUSES : THEME_STATUSES;

    return (
        <div className="projects-page">

            <div className="page-header-info">
                <div>
                    <h1 className="page-title">
                        {isDirections ? "Направления ДП/ДР" : "Темы ДП/ДР"}
                    </h1>

                    <p className="page-subtitle">
                        {isDirections
                            ? "Рассмотрение и утверждение направлений дипломных проектов и исследований"
                            : "Рассмотрение и утверждение тем дипломных проектов и исследований"}
                    </p>
                </div>

            </div>

            <div className="projects-tabs">
                <button
                    className={`tab-btn ${isDirections ? "active" : ""}`}
                    onClick={() => changeTab(TABS.DIRECTIONS)}
                >
                    Направления <span>{directions.length}</span>
                </button>

                <button
                    className={`tab-btn ${!isDirections ? "active" : ""}`}
                    onClick={() => changeTab(TABS.THEMES)}
                >
                    Темы <span>{themes.length}</span>
                </button>
            </div>


            <div className="projects-controls">
                <input
                    type="text"
                    className="search-input"
                    placeholder={
                        isDirections
                            ? "Поиск по направлениям..."
                            : "Поиск по темам..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div className="filter-buttons">
                    {statusFilters.map((status) => (
                        <button
                            key={status}
                            className={`filter-btn ${
                                filterStatus === status ? "active" : ""
                            }`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status} ({getCount(items, status)})
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <p className="no-results">Загрузка...</p>
            ) : (
                <div className="projects-list">
                    {filteredItems.length === 0 && (
                        <p className="no-results">Ничего не найдено</p>
                    )}

                    {isDirections &&
                        filteredItems.map((dir) => (
                            <DirectionCard
                                key={dir.id}
                                direction={dir}
                                onView={setSelectedDirection}
                            />
                        ))}

                    {!isDirections &&
                        filteredItems.map((theme) => (
                            <DirectionCard
                                key={theme.id}
                                direction={{
                                    ...theme,
                                    type: "Тема дипломной работы",
                                }}
                                onView={setSelectedTheme}
                            />
                        ))}
                </div>
            )}


            {selectedDirection && (
                <DirectionModal
                    direction={selectedDirection}
                    onClose={() => setSelectedDirection(null)}
                    onUpdateStatus={handleDirectionAction}
                />
            )}

            {selectedTheme && (
                <ThemeModal
                    theme={selectedTheme}
                    onClose={() => setSelectedTheme(null)}
                    onUpdateStatus={updateThemeStatus}
                />
            )}
        </div>
    );
};

export default DirectionsAndThemes;
