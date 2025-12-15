import { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // Forgot Password States
    const [showForgot, setShowForgot] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: Request Code, 2: Verify Code
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [forgotMsg, setForgotMsg] = useState('');

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

    const handleRequestCode = async () => {
        try {
            await axios.post('/auth/forgot-password', { username });
            setForgotStep(2);
            setForgotMsg('Code sent! Check your messages (console).');
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error requesting code');
        }
    };

    const handleResetPassword = async () => {
        try {
            await axios.post('/auth/reset-password', { 
                username, 
                code: resetCode, 
                newPassword 
            });
            alert('Password reset successful! Please login.');
            setShowForgot(false);
            setForgotStep(1);
            setResetCode('');
            setNewPassword('');
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid code or error');
        }
    };

    if (showForgot) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Reset Password</h1>
                    
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    {forgotMsg && <div style={{color: 'green', marginBottom:'10px'}}>{forgotMsg}</div>}

                    {forgotStep === 1 ? (
                        <>
                            <p style={{marginBottom:'15px', color:'#666'}}>Enter your username to receive a code.</p>
                            <input 
                                className={styles.input}
                                type="text" 
                                placeholder="Username" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <button onClick={handleRequestCode} className={styles.loginBtn}>
                                Send Code
                            </button>
                        </>
                    ) : (
                        <>
                            <p style={{marginBottom:'15px', color:'#666'}}>Enter the code and your new password.</p>
                            <input 
                                className={styles.input}
                                type="text" 
                                placeholder="6-Digit Code" 
                                value={resetCode} 
                                onChange={(e) => setResetCode(e.target.value)}
                            />
                            <input 
                                className={styles.input}
                                type="password" 
                                placeholder="New Password" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button onClick={handleResetPassword} className={styles.loginBtn}>
                                Reset Password
                            </button>
                        </>
                    )}

                    <p className={styles.link} onClick={() => {setShowForgot(false); setError(''); setForgotStep(1);}}>
                        Back to Login
                    </p>
                </div>
            </div>
        );
    }

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

                <button className={styles.registerBtn} onClick={() => navigate('/register')}>
                    Register
                </button>

                <p className={styles.link} onClick={() => setShowForgot(true)}>
                    Lost Password?
                </p>
            </div>
        </div>
    );
};

export default LoginPage;