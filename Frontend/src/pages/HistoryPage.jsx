import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FaTag, FaCheckCircle } from 'react-icons/fa';

const HistoryPage = () => {
    const [soldSneakers, setSoldSneakers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSold = async () => {
            try {
                const token = localStorage.getItem('token');
                // Ensure this matches the route defined in backend
                const res = await axios.get('/sneakers/sold', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSoldSneakers(res.data);
            } catch (error) {
                console.error("Error fetching history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSold();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{fontSize: '2rem', marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px'}}>
                <FaCheckCircle color="green" /> Sales History
            </h1>
            
            {loading ? <p>Loading history...</p> : soldSneakers.length === 0 ? (
                <div style={{textAlign:'center', color:'#888', marginTop:'50px'}}>
                    <h3>No sold items yet.</h3>
                    <p>When you mark an item as "Sold" in the market, it will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {soldSneakers.map(sneaker => (
                        <div key={sneaker._id} style={{ background: 'white', padding: '15px', borderRadius: '12px', display: 'flex', gap: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '5px solid green' }}>
                            <img 
                                src={sneaker.images[0] || "https://via.placeholder.com/80"} 
                                style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', background: '#eee' }} 
                            />
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize:'1.1rem' }}>{sneaker.model}</h3>
                                <p style={{ margin: 0, color: '#666', fontSize:'0.9rem' }}>{sneaker.brand} - Size {sneaker.size}</p>
                                <div style={{ marginTop: '10px', display: 'flex', justifyContent:'space-between', alignItems:'center', fontSize: '0.85rem' }}>
                                    <span style={{ background: '#e6fffa', color: 'green', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>SOLD</span>
                                    <span style={{ color: '#888' }}>{new Date(sneaker.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', alignSelf:'center' }}>
                                ${sneaker.price}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;