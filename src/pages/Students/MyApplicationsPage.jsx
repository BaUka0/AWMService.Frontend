import React, { useState, useEffect } from 'react';
import { StudentApplicationCard } from '../../components/Students/StudentApplicationCard/StudentApplicationCard';
import { applicationService } from '../../api/applicationService';
import { useAuth } from '../../context/AuthContext';
import './StudentPage.css';

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMyApplications();
  }, []);

  const loadMyApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getMy(user?.currentAcademicYearId);
      setApplications(data);
    } catch (err) {
      console.error("Ошибка при загрузке моих заявок:", err);
      setError("Не удалось загрузить ваши заявки.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="student-content-container">Загрузка...</div>;
  if (error) return <div className="student-content-container text-red">{error}</div>;

  return (
    <div className="student-content-container">
      <h2 className="page-header-title">Мои заявки</h2>
      {applications.length === 0 ? (
        <p>У вас пока нет поданных заявок.</p>
      ) : (
        <div className="applications-list-container">
          {applications.map(app => (
            <StudentApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}
