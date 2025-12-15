import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FaUserShield, FaBan, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        isDanger: false
    });

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const triggerBanToggle = (userId, currentStatus) => {
        const action = currentStatus ? 'UNBAN' : 'BAN';
        setConfirmModal({
            isOpen: true,
            title: `${action} User`,
            message: `Are you sure you want to ${action.toLowerCase()} this user?`,
            isDanger: !currentStatus, // Red for banning, normal for unbanning
            onConfirm: () => handleBanToggle(userId, currentStatus)
        });
    };

    const handleBanToggle = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`/users/${userId}/ban`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success(res.data.message);
            
            setUsers(users.map(user => 
                user._id === userId ? { ...user, isBanned: !currentStatus } : user
            ));
            
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update ban status");
        }
    };

    return (
        <div style={{ padding: '30px' }}>
            <h1 style={{ marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px' }}>
                <FaUserShield /> Admin Dashboard
            </h1>
            
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>User Management</h2>
                
                {loading ? <p>Loading users...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f0f0f0', textAlign: 'left', color: '#666' }}>
                                <th style={{ padding: '10px' }}>User</th>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px' }}>Role</th>
                                <th style={{ padding: '10px' }}>Status</th>
                                <th style={{ padding: '10px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} style={{width:'30px', height:'30px', borderRadius:'50%', objectFit:'cover'}} />
                                        ) : (
                                            <div style={{width:'30px', height:'30px', borderRadius:'50%', background:'#eee'}}></div>
                                        )}
                                        <div>
                                            <div style={{fontWeight:'bold'}}>{user.username}</div>
                                            <div style={{fontSize:'0.8rem', color:'#888'}}>{user.fullname}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px', color: '#555' }}>{user.email || '-'}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ 
                                            background: user.role === 'admin' ? 'black' : '#eee', 
                                            color: user.role === 'admin' ? 'white' : 'black', 
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' 
                                        }}>
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {user.isBanned ? (
                                            <span style={{ color: 'red', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'5px' }}>
                                                <FaBan /> BANNED
                                            </span>
                                        ) : (
                                            <span style={{ color: 'green', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'5px' }}>
                                                <FaCheck /> Active
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {user.role !== 'admin' && (
                                            <button 
                                                onClick={() => triggerBanToggle(user._id, user.isBanned)}
                                                style={{ 
                                                    background: user.isBanned ? '#28a745' : '#dc3545', 
                                                    color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold',
                                                    display: 'flex', alignItems: 'center', gap: '5px'
                                                }}
                                            >
                                                {user.isBanned ? <FaCheck /> : <FaBan />}
                                                {user.isBanned ? 'UNBAN' : 'BAN'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <ConfirmationModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={confirmModal.isDanger}
            />
        </div>
    );
};

export default AdminPage;