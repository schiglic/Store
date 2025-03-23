import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './constants';
import './App.css';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        if (image) {
            formData.append('image', image);
        }

        try {
            const response = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                body: formData, // Відправляємо як multipart/form-data
            });
            const data = await response.text();
            if (response.ok) {
                localStorage.setItem('jwtToken', data); // Зберігаємо JWT-токен
                setMessage('Успішно зареєстровано!'); // Показуємо повідомлення
                setTimeout(() => navigate('/'), 2000); // Перенаправляємо на головну сторінку
            } else {
                setMessage('Помилка при реєстрації');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Помилка при реєстрації');
        }
    };

    return (
        <div className="App">
            <div className="container">
                <h2>Реєстрація</h2>
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
                    <div className="form-group">
                        <label>Фото користувача:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                        />
                    </div>
                    <button type="submit">Зареєструватися</button>
                    <button
                        type="button"
                        className="auth-button login-button"
                        onClick={() => navigate('/login')}
                    >
                        Вхід
                    </button>
                </form>
                {message && <p style={{ marginTop: '10px' }}>{message}</p>}
            </div>
        </div>
    );
};

export default Register;