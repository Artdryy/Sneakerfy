import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FaPlus, FaRuler } from 'react-icons/fa';
import AddSneakerModal from '../components/AddSneakerModal';
import SneakerDetailsModal from '../components/SneakerDetailsModal';
import { useOutletContext } from 'react-router-dom'; // Import this

const MarketPage = () => {
    const [sneakers, setSneakers] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedSneaker, setSelectedSneaker] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Get openChat function from Layout
    const { openChat } = useOutletContext(); 

    const fetchSneakers = async () => {
        try {
            const response = await axios.get('/sneakers');
            setSneakers(response.data);
        } catch (error) {
            console.error("Error fetching sneakers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSneakers();
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{fontSize: '2rem'}}>Marketplace</h1>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    style={{
                        padding: '12px 20px', backgroundColor: 'black', color: 'white', 
                        border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <FaPlus /> Sell Sneaker
                </button>
            </div>

            {loading ? (
                <p>Loading market...</p>
            ) : sneakers.length === 0 ? (
                <div style={{textAlign: 'center', color: '#888', marginTop: '50px'}}>
                    <h3>No sneakers available yet. Be the first to sell!</h3>
                </div>
            ) : (
                <div style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' 
                }}>
                    {sneakers.map(sneaker => (
                        <div 
                            key={sneaker._id} 
                            onClick={() => setSelectedSneaker(sneaker)} 
                            style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'pointer' }}
                        >
                            <div style={{ height: '200px', background: '#eee', position: 'relative' }}>
                                {sneaker.images && sneaker.images.length > 0 ? (
                                    <img src={sneaker.images[0]} alt={sneaker.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#aaa'}}>No Image</div>
                                )}
                                <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                    {sneaker.condition}
                                </span>
                            </div>
                            
                            <div style={{ padding: '15px' }}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{sneaker.model}</h3>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{sneaker.brand}</p>
                                    </div>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${sneaker.price}</span>
                                </div>
                                
                                <div style={{ marginTop: '15px', display: 'flex', gap: '10px', fontSize: '0.85rem', color: '#555' }}>
                                    <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><FaRuler /> Size {sneaker.size}</span>
                                </div>

                                <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img 
                                        src={sneaker.seller?.profilePicture || "https://via.placeholder.com/30"} 
                                        style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} 
                                        alt="Seller"
                                    />
                                    <div style={{ fontSize: '0.85rem' }}>
                                        <span style={{ fontWeight: '600', display:'block' }}>{sneaker.seller?.username}</span>
                                        <span style={{ color: 'gold' }}>★ {sneaker.seller?.sellerScore}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddSneakerModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSuccess={fetchSneakers} 
            />

            <SneakerDetailsModal 
                isOpen={!!selectedSneaker} 
                onClose={() => setSelectedSneaker(null)} 
                sneaker={selectedSneaker}
                onRefresh={fetchSneakers}
                onOpenChat={openChat} 
            />
        </div>
    );
};

export default MarketPage;