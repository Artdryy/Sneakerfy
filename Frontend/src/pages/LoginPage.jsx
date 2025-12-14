import { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/auth/login', { username, password });
            localStorage.setItem('token', response.data.token);
            navigate('/welcome');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Sneakerfy 👟</h1>
                
                {error && <div className={styles.errorMessage}>{error}</div>}

                <input 
                    className={styles.input}
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                />
                
                <input 
                    className={styles.input}
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button onClick={handleLogin} className={styles.loginBtn}>
                    Login
                </button>

                <button className={styles.registerBtn}>
                    Register
                </button>

                <p className={styles.link}>Lost Password?</p>
            </div>
        </div>
    );
};

export default LoginPage;