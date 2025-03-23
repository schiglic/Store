import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './constants';

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
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Вхід</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Ім'я користувача:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Пароль:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '5px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '5px 10px' }}>
                    Увійти
                </button>
            </form>
            {message && <p style={{ marginTop: '10px' }}>{message}</p>}
        </div>
    );
};

export default Login;