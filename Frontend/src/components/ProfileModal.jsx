import { useState, useEffect } from 'react';
import { FaCog, FaTimes, FaCamera, FaSignOutAlt, FaSave, FaArrowLeft } from 'react-icons/fa';
import axios from '../api/axios';
import styles from './ProfileModal.module.css';

const ProfileModal = ({ isOpen, onClose, user, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [previewImage, setPreviewImage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null); // Stores the raw file for upload

    // Initialize form data when modal opens
    useEffect(() => {
        if (user) {
            setFormData({
                fullname: user.fullname || '',
                phoneNumber: user.phoneNumber || '',
                country: user.country || '',
                state: user.state || '',        // Added
                city: user.city || '',
                address: user.address || '',
                postalCode: user.postalCode || '' // Added
            });
            // Use existing profile pic URL or placeholder
            setPreviewImage(user.profilePicture || "https://via.placeholder.com/150");
            setSelectedFile(null); // Reset file selection
        }
    }, [user, isOpen]);

    // Reset editing state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setIsEditing(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file); // Store the RAW file to send to backend later
            
            // Create a local preview URL so the user sees it immediately
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setPreviewImage(reader.result); 
            };
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // 1. Create FormData object (Required for file uploads)
            const data = new FormData();
            
            // 2. Append all text fields
            data.append('fullname', formData.fullname);
            data.append('phoneNumber', formData.phoneNumber);
            data.append('country', formData.country);
            data.append('state', formData.state);
            data.append('city', formData.city);
            data.append('address', formData.address);
            data.append('postalCode', formData.postalCode);
            
            // 3. Append the file ONLY if the user selected a new one
            if (selectedFile) {
                data.append('profilePicture', selectedFile);
            }

            // 4. Send Request
            const response = await axios.put('/users/profile', data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    // Note: Axios automatically sets 'Content-Type': 'multipart/form-data' 
                    // with the correct boundary when passing FormData.
                }
            });
            
            // 5. Update Parent Component
            if(onUpdateUser) onUpdateUser(response.data);
            
            setIsEditing(false);
            alert("Profile Updated Successfully!");

        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to update profile");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <div className={styles.modalOverlay}>
            {/* Header */}
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isEditing && (
                        <button onClick={() => setIsEditing(false)} className={styles.iconBtn}>
                            <FaArrowLeft />
                        </button>
                    )}
                    <h3 className={styles.headerTitle}>{isEditing ? 'Edit Profile' : 'My Account'}</h3>
                </div>
                <div>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className={styles.iconBtn}>
                            <FaCog />
                        </button>
                    )}
                    <button onClick={onClose} className={styles.iconBtn} style={{marginLeft: '10px'}}>
                        <FaTimes />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className={styles.body}>
                {/* Profile Picture Section */}
                <div className={styles.avatarSection}>
                    <img src={previewImage} alt="Profile" className={styles.avatar} />
                    
                    {isEditing && (
                        <label className={styles.cameraIcon}>
                            <FaCamera />
                            {/* Input for file selection */}
                            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                        </label>
                    )}
                    
                    <p style={{marginTop: '10px', fontWeight: 'bold'}}>{user?.username}</p>
                    {/* Score removed from here */}
                </div>

                {isEditing ? (
                    /* EDIT MODE */
                    <div className="edit-form">
                        <input className={styles.input} style={{marginBottom:'10px'}} placeholder="Full Name" value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} />
                        <input className={styles.input} style={{marginBottom:'10px'}} placeholder="Phone" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                        
                        <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
                            <input className={styles.input} placeholder="Country" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                            <input className={styles.input} placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                        </div>
                        
                        <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
                            <input className={styles.input} placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                            <input className={styles.input} placeholder="Postal Code" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} />
                        </div>

                        <input className={styles.input} placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                        
                        <button onClick={handleSave} className={styles.saveBtn}>
                            <FaSave style={{marginRight: '5px'}}/> Save Changes
                        </button>
                    </div>
                ) : (
                    /* VIEW MODE */
                    <div className="view-mode">
                        <div className={styles.infoGroup}>
                            <span className={styles.label}>Full Name</span>
                            <div className={styles.value}>{user?.fullname}</div>
                        </div>
                        <div className={styles.infoGroup}>
                            <span className={styles.label}>Location</span>
                            <div className={styles.value}>
                                {user?.city}, {user?.state} ({user?.country})
                            </div>
                        </div>
                        <div className={styles.infoGroup}>
                            <span className={styles.label}>Address</span>
                            <div className={styles.value}>{user?.address} - {user?.postalCode}</div>
                        </div>
                        
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            <FaSignOutAlt style={{marginRight: '8px'}}/> Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileModal;