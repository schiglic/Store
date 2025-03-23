import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './constants';
import './App.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const token = await response.text();
            if (response.ok) {
                localStorage.setItem('jwtToken', token); // Зберігаємо токен
                setMessage('Успішний вхід!');
                // Перенаправлення на головну сторінку після входу
                setTimeout(() => navigate('/'), 2000);
            } else {
                setMessage('Помилка при вході');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Помилка при вході');
        }
    };

    return (
        <div className="App">
            <div className="container">
                <h2>Вхід</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Ім'я користувача:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Пароль:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Увійти</button>
                    <button
                        type="button"
                        className="auth-button register-button"
                        onClick={() => navigate('/register')}
                    >
                        Реєстрація
                    </button>
                </form>
                {message && <p style={{ marginTop: '10px' }}>{message}</p>}
            </div>
        </div>
    );
};

export default Login;