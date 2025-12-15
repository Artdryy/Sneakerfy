import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FaTimes, FaStar, FaCommentDots } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ConfirmationModal from './ConfirmationModal';

const SneakerDetailsModal = ({ isOpen, onClose, sneaker, onRefresh, onOpenChat }) => {
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [rating, setRating] = useState(0); 
    const [mainImage, setMainImage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(token) {
             try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                setCurrentUser(JSON.parse(jsonPayload).user);
            } catch (e) { console.error(e) }
        }

        if (sneaker) {
            setMainImage(sneaker.images && sneaker.images[0] ? sneaker.images[0] : '');
            const fetchDetails = async () => {
                try {
                    const res = await axios.get(`/sneakers/${sneaker._id}`);
                    setComments(res.data.comments || []);
                } catch (err) {
                    console.error("Failed to load details", err);
                }
            };
            fetchDetails();
        }
    }, [sneaker, isOpen]);

    if (!isOpen || !sneaker) return null;

    const handleAddComment = async () => {
        if (!commentText.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`/sneakers/${sneaker._id}/comments`, { text: commentText }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(res.data);
            setCommentText('');
            toast.success("Comment added!");
        } catch (err) {
            toast.error('Failed to add comment');
        }
    };

    const handleRateSeller = async (score) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/users/rate', { 
                targetUserId: sneaker.seller._id,
                score: score
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`You rated the seller ${score} stars!`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to rate');
        }
    };

    const handleMarkSold = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/sneakers/${sneaker._id}/sold`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Item marked as sold!");
            onRefresh();
            onClose();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    // Styles
    const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
    const modalStyle = { background: 'white', width: '900px', maxHeight: '90vh', borderRadius: '12px', display: 'flex', overflow: 'hidden', position: 'relative' };
    const leftCol = { width: '50%', background: '#f8f9fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' };
    const rightCol = { width: '50%', padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column' };

    const isOwner = currentUser && sneaker.seller && currentUser.id === sneaker.seller._id;
    const isSold = sneaker.status === 'Sold';

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}>
                    <FaTimes />
                </button>

                {/* Left: Images */}
                <div style={leftCol}>
                    {mainImage ? (
                        <img src={mainImage} alt={sneaker.model} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', marginBottom: '20px' }} />
                    ) : (
                        <div style={{ width: '100%', height: '300px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', width: '100%' }}>
                        {sneaker.images && sneaker.images.map((img, idx) => (
                            <img 
                                key={idx} 
                                src={img} 
                                style={{ width: '60px', height: '60px', objectFit: 'cover', cursor: 'pointer', border: mainImage === img ? '2px solid black' : '1px solid #ddd', borderRadius: '4px' }} 
                                onClick={() => setMainImage(img)}
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Info & Interactions */}
                <div style={rightCol}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <h2 style={{ margin: '0 0 5px 0' }}>{sneaker.model}</h2>
                        {isSold && <span style={{background:'red', color:'white', padding:'5px 10px', borderRadius:'4px', fontSize:'0.8rem', height:'fit-content'}}>SOLD</span>}
                    </div>
                    <h4 style={{ margin: '0 0 20px 0', color: '#666', fontWeight: '400' }}>{sneaker.brand}</h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${sneaker.price}</span>
                        <span style={{ background: '#eee', padding: '5px 10px', borderRadius: '4px' }}>Size {sneaker.size}</span>
                    </div>

                    {isOwner && !isSold && (
                        <button 
                            onClick={() => setShowConfirm(true)}
                            style={{width: '100%', background: '#28a745', color: 'white', padding: '10px', border:'none', borderRadius:'6px', marginBottom: '20px', cursor:'pointer', fontWeight:'bold'}}>
                            Mark as Sold
                        </button>
                    )}

                    <div style={{ background: '#f0f2f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#333' }}>{sneaker.description || 'No description provided.'}</p>
                        <p style={{ marginTop: '10px', fontSize: '0.8rem', color: '#666' }}>Condition: <b>{sneaker.condition}</b></p>
                    </div>

                    {/* Seller Section */}
                    <div style={{ borderTop: '1px solid #eee', padding: '15px 0', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            {sneaker.seller?.profilePicture ? (
                                <img src={sneaker.seller.profilePicture} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                            ) : (
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee' }}></div>
                            )}
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{sneaker.seller?.username}</div>
                                <div style={{ fontSize: '0.8rem', color: 'gold' }}>★ {sneaker.seller?.sellerScore}</div>
                            </div>
                            
                            {!isOwner && (
                                <button 
                                    onClick={() => onOpenChat(sneaker.seller)}
                                    style={{ marginLeft: 'auto', background: 'black', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <FaCommentDots /> Message
                                </button>
                            )}
                        </div>

                        {/* Rate Seller Stars (Only if not owner) */}
                        {!isOwner && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                                <span>Rate Seller:</span>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <FaStar 
                                        key={star} 
                                        color={star <= rating ? 'gold' : '#ddd'} 
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => { setRating(star); handleRateSeller(star); }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                        <h4 style={{ marginBottom: '10px', fontSize: '1rem' }}>Comments</h4>
                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', minHeight: '100px' }}>
                            {comments.map((c, idx) => (
                                <div key={idx} style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>{c.user?.username}:</span>
                                    <span>{c.text}</span>
                                </div>
                            ))}
                        </div>
                        {isSold ? (
                            <p style={{color:'#888', fontStyle:'italic', fontSize:'0.9rem'}}>Comments are closed for sold items.</p>
                        ) : (
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input 
                                    value={commentText} 
                                    onChange={e => setCommentText(e.target.value)} 
                                    placeholder="Public comment..." 
                                    style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                                <button onClick={handleAddComment} style={{ background: '#eee', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Post
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationModal 
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleMarkSold}
                title="Mark as Sold"
                message="Are you sure you want to mark this item as sold? This will remove it from the market."
                confirmText="Yes, Mark Sold"
            />
        </div>
    );
};

export default SneakerDetailsModal;