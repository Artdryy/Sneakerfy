import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import Sidebar from './Sidebar';
import ProfileModal from './ProfileModal';
import styles from './Layout.module.css'; // Import Styles

const Layout = ({ allowedRoles }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const handleUserUpdate = (updatedUserData) => {setUser(updatedUserData);};

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
            setUser(decoded.user);
        } catch (error) {
            localStorage.removeItem('token');
            navigate('/');
        }
    }, [navigate, allowedRoles]);

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <header className={styles.topbar}>
                    <div className={styles.userSection}>
                        <span className={styles.username}>Hello, {user?.fullname || 'User'}</span>
                        
                        {/* Use the new profile picture if available */}
                        <button className={styles.avatarBtn} onClick={() => setProfileOpen(!isProfileOpen)}>
                           {user?.profilePicture ? 
                               <img src={user.profilePicture} style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} alt="" /> 
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