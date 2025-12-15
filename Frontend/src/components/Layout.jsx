import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import axios from '../api/axios'; // Ensure this points to your configured Axios instance
import Sidebar from './Sidebar';
import ProfileModal from './ProfileModal';
import styles from './Layout.module.css'; 

const Layout = ({ allowedRoles }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [loading, setLoading] = useState(true); // Added loading state

    // Keeps UI in sync when ProfileModal updates data
    const handleUserUpdate = (updatedUserData) => {
        setUser(updatedUserData);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        // 1. Basic Token Check
        if (!token) { 
            navigate('/'); 
            return; 
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            // 2. Expiration Check
            if (decoded.exp < currentTime) {
                localStorage.removeItem('token');
                navigate('/');
                return;
            }

            // 3. Role Permission Check
            if (allowedRoles && !allowedRoles.includes(decoded.user.role)) {
                alert("Access Denied"); // Optional: Replace with a toast notification
                navigate('/welcome');
                return;
            }

            // 4. FETCH FRESH DATA (The Fix)
            // We fetch the latest data from MongoDB using the token
            const fetchUserProfile = async () => {
                try {
                    const response = await axios.get('/users/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(response.data); // Update state with fresh DB data
                } catch (error) {
                    console.error("Error fetching profile:", error);
                    if (error.response && error.response.status === 401) {
                        localStorage.removeItem('token');
                        navigate('/');
                    }
                } finally {
                    setLoading(false); // Stop loading regardless of success/fail
                }
            };

            fetchUserProfile();

        } catch (error) {
            localStorage.removeItem('token');
            navigate('/');
        }
    }, [navigate, allowedRoles]);

    if (loading) {
        // Simple loading indicator to prevent UI flicker
        return <div style={{display:'flex', justifyContent:'center', marginTop:'50px'}}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <Sidebar />
            
            <div className={styles.mainContent}>
                <header className={styles.topbar}>
                    <div className={styles.userSection}>
                        {/* Display Score here */}
                        <span style={{ marginRight: '15px', fontSize: '0.9rem', color: 'gold', fontWeight: 'bold' }}>
                            {user?.sellerScore || 0} ★
                        </span>
                        <span className={styles.username}>Hello, {user?.fullname || 'User'}</span>
                        
                        <button 
                            className={styles.avatarBtn}
                            onClick={() => setProfileOpen(!isProfileOpen)}
                        >
                             {/* Priority: Database Image -> Placeholder */}
                             {user?.profilePicture ? 
                               <img src={user.profilePicture} style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} alt="Profile" /> 
                               : '👤'}
                        </button>

                        <ProfileModal 
                            isOpen={isProfileOpen} 
                            onClose={() => setProfileOpen(false)} 
                            user={user} 
                            onUpdateUser={handleUserUpdate} 
                        />
                    </div>
                </header>

                <main className={styles.pageContent}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;