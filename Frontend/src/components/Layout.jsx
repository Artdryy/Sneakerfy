import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom'; 
import { jwtDecode } from "jwt-decode";
import axios from '../api/axios';
import Sidebar from './Sidebar';
import ProfileModal from './ProfileModal';
import ChatWidget from './ChatWidget'; // Import ChatWidget
import styles from './Layout.module.css'; 

const Layout = ({ allowedRoles }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Chat State
    const [activeChatUser, setActiveChatUser] = useState(null);

    const handleUserUpdate = (updatedUserData) => {
        setUser(updatedUserData);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/'); return; }

        try {
            const decoded = jwtDecode(token);
            if (decoded.exp < Date.now() / 1000) {
                localStorage.removeItem('token');
                navigate('/');
                return;
            }
            if (allowedRoles && !allowedRoles.includes(decoded.user.role)) {
                navigate('/welcome');
                return;
            }

            const fetchUserProfile = async () => {
                try {
                    const response = await axios.get('/users/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(response.data); 
                } catch (error) {
                    if (error.response && error.response.status === 401) {
                        localStorage.removeItem('token');
                        navigate('/');
                    }
                } finally {
                    setLoading(false);
                }
            };
            fetchUserProfile();
        } catch (error) {
            localStorage.removeItem('token');
            navigate('/');
        }
    }, [navigate, allowedRoles]);

    if (loading) return <div style={{display:'flex', justifyContent:'center', marginTop:'50px'}}>Loading...</div>;

    return (
        <div className={styles.container}>
            <Sidebar />
            
            <div className={styles.mainContent}>
                <header className={styles.topbar}>
                    <div className={styles.userSection}>
                        <span style={{ marginRight: '15px', fontSize: '0.9rem', color: 'gold', fontWeight: 'bold' }}>
                            {user?.sellerScore || 0} ★
                        </span>
                        <span className={styles.username}>Hello, {user?.fullname || 'User'}</span>
                        
                        <button 
                            className={styles.avatarBtn}
                            onClick={() => setProfileOpen(!isProfileOpen)}
                        >
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
                    {/* Pass setActiveChatUser to children via context */}
                    <Outlet context={{ openChat: setActiveChatUser }} />
                </main>

                {/* Global Chat Widget */}
                <ChatWidget 
                    activeChatUser={activeChatUser} 
                    onCloseActiveChat={() => setActiveChatUser(null)} 
                />
            </div>
        </div>
    );
};

export default Layout;