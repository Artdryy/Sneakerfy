import { useState } from 'react';
import axios from '../api/axios';
import { FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AddSneakerModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        size: '',
        price: '',
        condition: 'New',
        description: ''
    });
    const [files, setFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length + files.length > 5) {
            toast.warning("Maximum 5 images allowed");
            return;
        }
        setFiles([...files, ...selectedFiles]);
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newPreviews]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            files.forEach(file => data.append('images', file));

            await axios.post('/sneakers', data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Sneaker listed successfully!');
            onSuccess(); 
            onClose();
            
            setFormData({ brand: '', model: '', size: '', price: '', condition: 'New', description: '' });
            setFiles([]);
            setPreviewUrls([]);

        } catch (error) {
            console.error(error);
            toast.error('Failed to list sneaker');
        } finally {
            setLoading(false);
        }
    };

    // Styles (Same as before)
    const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
    const modalStyle = { background: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' };
    const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '6px' };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}><FaTimes /></button>
                <h2 style={{ marginBottom: '20px' }}>Sell Your Sneaker</h2>
                
                <form onSubmit={handleSubmit}>
                    <div style={{display:'flex', gap:'10px'}}>
                        <input style={inputStyle} placeholder="Brand (e.g. Nike)" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required />
                        <input style={inputStyle} placeholder="Model (e.g. Air Jordan 1)" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
                    </div>

                    <div style={{display:'flex', gap:'10px'}}>
                        <input type="number" style={inputStyle} placeholder="Size (US)" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} required />
                        <input type="number" style={inputStyle} placeholder="Price ($)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                    </div>

                    <select style={inputStyle} value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}>
                        <option value="New">New / Deadstock</option>
                        <option value="Used - Like New">Used - Like New</option>
                        <option value="Used - Good">Used - Good</option>
                        <option value="Used - Fair">Used - Fair</option>
                    </select>

                    <textarea style={{...inputStyle, height: '80px', resize: 'none'}} placeholder="Description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Upload Images (Max 5)</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {previewUrls.map((url, idx) => (
                                <img key={idx} src={url} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }} />
                            ))}
                            {files.length < 5 && (
                                <label style={{ width: '70px', height: '70px', border: '2px dashed #ccc', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#ccc' }}>
                                    <FaCloudUploadAlt size={24} />
                                    <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>
                    </div>

                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: 'black', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Listing...' : 'List Item'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddSneakerModal;