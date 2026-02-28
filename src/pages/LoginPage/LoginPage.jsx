import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();
    const [loginName, setLoginName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const userData = await login(loginName, password);

            // Redirect based on roles
            if (userData.roles && userData.roles.length > 0) {
                // Determine the primary role for redirection
                const roles = userData.roles.map(r => r.toLowerCase());
                if (roles.includes("student")) {
                    navigate("/student/choose-theme");
                } else if (roles.includes("supervisor")) {
                    navigate("/supervisors/my-topics");
                } else if (roles.includes("department") || roles.includes("secretary") || roles.includes("admin")) {
                    navigate("/department/supervisors");
                } else {
                    // Fallback
                    navigate("/");
                }
            } else {
                // No roles, maybe a generic dashboard?
                setError("У пользователя нет назначенных ролей");
            }

        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                setError("Неверный логин или пароль");
            } else {
                setError("Произошла ошибка при попытке входа. Попробуйте позже.");
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Вход в систему</h1>
                <p className="login-subtitle">Academic Work Management</p>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="login">Логин</label>
                        <input
                            type="text"
                            id="login"
                            value={loginName}
                            onChange={(e) => setLoginName(e.target.value)}
                            required
                            placeholder="Введите ваш логин"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Введите ваш пароль"
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Загрузка...' : 'Войти'}
                    </button>
                </form>
            </div>
        </div>
    );
}
