"use client";

import React, { useState, useMemo, useEffect } from "react";
import "./SupervisorsPage.css";
import { SupervisorCard } from "../../../components/Department/supervisors/SupervisorCard.jsx";
import { SupervisorSelectionDialog } from "../../../components/Department/supervisors/SupervisorSelectionDialog.jsx";
import { staffService } from "../../../api/staffService.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import plusIcon from "../../../assets/icons/plus-icon.svg";
import searchIcon from "../../../assets/icons/search-icon.svg";

function SupervisorsPage() {
    const { user } = useAuth();
    const departmentId = user?.departmentId;

    const [allStaff, setAllStaff] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    const [pendingIds, setPendingIds] = useState(new Set()); // IDs добавленных, но не утверждённых
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        if (!departmentId) return;
        loadData();
    }, [departmentId]);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [staffData, supervisorData] = await Promise.all([
                staffService.getByDepartment(departmentId),
                staffService.getSupervisors(departmentId)
            ]);
            setAllStaff(staffData);
            setSupervisors(supervisorData);
            setIsApproved(supervisorData.length > 0);
            setPendingIds(new Set());
        } catch (err) {
            setError("Не удалось загрузить данные");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const availableTeachers = useMemo(() => {
        const supervisorIds = new Set(supervisors.map(s => s.id));
        return allStaff.filter(t => !supervisorIds.has(t.id));
    }, [allStaff, supervisors]);

    const filteredSupervisors = useMemo(
        () => supervisors.filter(s =>
            (s.fullName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.position ?? "").toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [supervisors, searchTerm]
    );

    const handleAddSupervisors = (selectedIds) => {
        const newOnes = allStaff.filter(t => selectedIds.includes(t.id));
        setSupervisors(prev => [...prev, ...newOnes]);
        setPendingIds(prev => new Set([...prev, ...selectedIds]));
        setIsApproved(false);
        setIsDialogOpen(false);
    };

    const handleRemoveSupervisor = (id) => {
        setSupervisors(prev => prev.filter(s => s.id !== id));
        setPendingIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        setIsApproved(false);
    };

    const handleUpdateWorkload = async (staffId, maxStudentsLoad) => {
        try {
            await staffService.updateWorkload(staffId, maxStudentsLoad);
            setSupervisors(prev =>
                prev.map(s => s.id === staffId ? { ...s, maxStudentsLoad } : s)
            );
        } catch (err) {
            console.error("Не удалось обновить нагрузку", err);
        }
    };

    const handleApprove = async () => {
        if (!supervisors.length) return;
        setIsSaving(true);
        try {
            await staffService.approveSupervisors(departmentId, supervisors.map(s => s.id));
            setIsApproved(true);
            setPendingIds(new Set());
        } catch (err) {
            console.error("Не удалось утвердить состав НР", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="supervisors-page"><p className="page-subtitle">Загрузка...</p></div>;
    }

    if (error) {
        return (
            <div className="supervisors-page">
                <p style={{ color: '#DC2626' }}>{error}</p>
                <button className="button primary-button" onClick={loadData}>Повторить</button>
            </div>
        );
    }

    const hasPendingChanges = pendingIds.size > 0;

    return (
        <div className="supervisors-page">
            <div className="page-header">
                <div className="page-header-info">
                    <div>
                        <h1 className="page-title">Научные руководители</h1>
                        <p className="page-subtitle">
                            Управление назначенными научными руководителями кафедры
                        </p>
                    </div>
                </div>

                <div className="page-header-actions">
                    <button
                        className="button secondary-button"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <img src={plusIcon} alt="Add" className="button-icon" />
                        Добавить руководителей
                    </button>
                    <button
                        className="button primary-button"
                        onClick={handleApprove}
                        disabled={isSaving || supervisors.length === 0 || (!hasPendingChanges && isApproved)}
                    >
                        {isSaving
                            ? "Сохранение..."
                            : isApproved && !hasPendingChanges
                                ? "✓ Состав утверждён"
                                : "Утвердить состав НР"
                        }
                    </button>
                </div>
            </div>

            <div className="search-bar-container">
                <img src={searchIcon} alt="Search" className="search-bar-icon" />
                <input
                    type="text"
                    placeholder="Поиск по имени, должности..."
                    className="search-bar-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="supervisors-grid-layout">
                {filteredSupervisors.map((supervisor) => (
                    <SupervisorCard
                        key={supervisor.id}
                        supervisor={supervisor}
                        onRemove={handleRemoveSupervisor}
                        onUpdateWorkload={handleUpdateWorkload}
                    />
                ))}
                {filteredSupervisors.length === 0 && (
                    <p className="supervisor-empty-state">
                        Научные руководители не назначены. Нажмите «Добавить руководителей».
                    </p>
                )}
            </div>

            <SupervisorSelectionDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                availableTeachers={availableTeachers}
                onConfirm={handleAddSupervisors}
            />
        </div>
    );
}

export default SupervisorsPage;

