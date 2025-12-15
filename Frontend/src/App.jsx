import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // Import RegisterPage
import WelcomePage from './pages/WelcomePage';
import MarketPage from './pages/MarketPage';
import HistoryPage from './pages/HistoryPage';
import AdminPage from './pages/AdminPage';
import Layout from './components/Layout'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* Add Register Route */}

        {/* --- USER ROUTES --- */}
        {/* Any user (User or Admin) can see these */}
        <Route element={<Layout allowedRoles={['user', 'admin']} />}>
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/history" element={<HistoryPage />} />
        </Route>

        {/* --- ADMIN ONLY ROUTES --- */}
        {/* Only 'admin' role can see these */}
        <Route element={<Layout allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminPage />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;