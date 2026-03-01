import React from "react";
import "./DirectionStatusBadge.css";

const DirectionStatusBadge = ({ status }) => {
    const statusClass = {
        "Утверждено": "badge-active",
        "На рассмотрении": "badge-pending",
        "Отклонено": "badge-closed",
        "Требует доработки": "badge-revision",
    }[status] || "badge-default";

    return <span className={`status-badge ${statusClass}`}>{status}</span>;
};

export default DirectionStatusBadge;
