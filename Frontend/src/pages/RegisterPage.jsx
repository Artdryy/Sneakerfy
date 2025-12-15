import { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

const RegisterPage = () => {
    const [step, setStep] = useState(1); // 1: Register, 2: Verify Code
    const [formData, setFormData] = useState({
        username: '',
        email: '', // Added Email
        password: '',
        fullname: '',
        phoneNumber: '',
        country: '',
        state: '',
        city: '',
        address: '',
        postalCode: ''
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async () => {
        // Validate all required fields
        const requiredFields = [
            'username', 
            'email', // Check email
            'password', 
            'fullname', 
            'phoneNumber', 
            'country', 
            'state', 
            'city', 
            'address', 
            'postalCode'
        ];
        
        const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');

        if (missingFields.length > 0) {
            setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        try {
            await axios.post('/auth/register', formData);
            setStep(2); 
            alert(`Registration successful! Code sent to ${formData.email}`);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleVerify = async () => {
        try {
            await axios.post('/auth/verify-email', {
                username: formData.username,
                code: verificationCode
            });
            alert('Account verified! Please login.');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card} style={{ maxWidth: '500px' }}>
                <h1 className={styles.title}>{step === 1 ? 'Register' : 'Verify Account'}</h1>
                
                {error && <div className={styles.errorMessage}>{error}</div>}

                {step === 1 ? (
                    <>
                        <div style={{ display: 'grid', gap: '10px', textAlign: 'left' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input className={styles.input} type="text" name="username" placeholder="Username *" value={formData.username} onChange={handleChange} />
                                <input className={styles.input} type="email" name="email" placeholder="Email *" value={formData.email} onChange={handleChange} />
                            </div>
                            
                            <input className={styles.input} type="password" name="password" placeholder="Password *" value={formData.password} onChange={handleChange} />
                            <input className={styles.input} type="text" name="fullname" placeholder="Full Name *" value={formData.fullname} onChange={handleChange} />
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input className={styles.input} type="text" name="phoneNumber" placeholder="Phone *" value={formData.phoneNumber} onChange={handleChange} />
                                <input className={styles.input} type="text" name="country" placeholder="Country *" value={formData.country} onChange={handleChange} />
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input className={styles.input} type="text" name="state" placeholder="State *" value={formData.state} onChange={handleChange} />
                                <input className={styles.input} type="text" name="city" placeholder="City *" value={formData.city} onChange={handleChange} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                                <input className={styles.input} type="text" name="address" placeholder="Address *" value={formData.address} onChange={handleChange} />
                                <input className={styles.input} type="text" name="postalCode" placeholder="Zip Code *" value={formData.postalCode} onChange={handleChange} />
                            </div>
                        </div>

                        <button onClick={handleRegister} className={styles.loginBtn} style={{ marginTop: '20px' }}>
                            Create Account
                        </button>
                    </>
                ) : (
                    <>
                        <p style={{marginBottom:'15px', color:'#666'}}>Enter the 6-digit code sent to <b>{formData.email}</b></p>
                        <input 
                            className={styles.input}
                            type="text" 
                            placeholder="Enter Code" 
                            value={verificationCode} 
                            onChange={(e) => setVerificationCode(e.target.value)}
                        />
                        <button onClick={handleVerify} className={styles.loginBtn} style={{ marginTop: '20px' }}>
                            Verify Account
                        </button>
                    </>
                )}

                <p className={styles.link} onClick={() => navigate('/')}>
                    Back to Login
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;