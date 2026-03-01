import React, { useState, useEffect } from 'react';
import { StudentThemeCard } from '../../components/Students/StudentThemeCard/StudentThemeCard';
import { topicService } from '../../api/topicService';
import { applicationService } from '../../api/applicationService';
import { useAuth } from '../../context/AuthContext';
import './StudentPage.css';

export default function ChooseThemePage() {
  const { user } = useAuth();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAvailableTopics();
  }, []);

  const loadAvailableTopics = async () => {
    setLoading(true);
    try {
      const data = await topicService.getAvailable(
        user?.departmentId,
        user?.currentAcademicYearId
      );
      setThemes(data);
    } catch (err) {
      console.error("Ошибка при загрузке доступных тем:", err);
      setError("Не удалось загрузить темы");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (themeId) => {
    const motivation = prompt("Укажите мотивационное письмо (необязательно):", "");
    if (motivation === null) return; // User cancelled

    try {
      await applicationService.create(themeId, motivation);
      alert("Заявка успешно подана!");
      // По-хорошему нужно обновить статус темы или убрать её из списка доступных,
      // либо просто перезагрузить список
      loadAvailableTopics();
    } catch (err) {
      console.error("Ошибка при подаче заявки:", err);
      alert("Не удалось подать заявку");
    }
  };

  const handleCancel = (themeId) => {
    setThemes(themes.map(t => t.id === themeId ? { ...t, status: 'default' } : t));
  };

  const handleReapply = (themeId) => {
    // In a real app, this might open a new application form or just reset the status
    setThemes(themes.map(t => t.id === themeId ? { ...t, status: 'applied', rejectionReason: undefined } : t));
  };


  return (
    <div className="student-content-container">
      <div className="filters-container">
        <input type="text" placeholder="Поиск по названию..." className="search-input" />
        <select className="filter-select">
          <option>Все преподаватели</option>
        </select>
        <select className="filter-select">
          <option>Все направления</option>
        </select>
        <select className="filter-select">
          <option>Все доступные</option>
        </select>
      </div>

      <div className="themes-list-container">
        {themes.map(theme => (
          <StudentThemeCard
            key={theme.id}
            theme={theme}
            onApply={handleApply}
            onCancel={handleCancel}
            onReapply={handleReapply}
          />
        ))}
      </div>
    </div>
  );
}
