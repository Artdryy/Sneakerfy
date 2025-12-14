import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>Sneakerfy 👟</div>
            
            <nav className={styles.nav}>
                <NavLink to="/welcome" className={({ isActive }) => isActive ? `${styles.link} ${styles.activeLink}` : styles.link}>
                    🏠 Welcome
                </NavLink>
                <NavLink to="/market" className={({ isActive }) => isActive ? `${styles.link} ${styles.activeLink}` : styles.link}>
                    🛒 Market
                </NavLink>
                <NavLink to="/history" className={({ isActive }) => isActive ? `${styles.link} ${styles.activeLink}` : styles.link}>
                    📜 History
                </NavLink>
                <NavLink to="/admin" className={({ isActive }) => isActive ? `${styles.link} ${styles.activeLink}` : styles.link}>
                    🔒 Admin
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;