import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './constants';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.text();
            setMessage(data);
            if (response.ok) {
                // Перенаправлення на сторінку входу після успішної реєстрації
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Помилка при реєстрації');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Реєстрація</h2>
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
                    Зареєструватися
                </button>
            </form>
            {message && <p style={{ marginTop: '10px' }}>{message}</p>}
        </div>
    );
};

export default Register;