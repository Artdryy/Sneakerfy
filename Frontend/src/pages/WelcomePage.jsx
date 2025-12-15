import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FaCrown, FaYoutube } from 'react-icons/fa';

const WelcomePage = () => {
    const [topSellers, setTopSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopSellers = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/users/top-sellers', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTopSellers(res.data);
            } catch (err) {
                console.error("Failed to load top sellers", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTopSellers();
    }, []);

    const videoId = "dQw4w9WgXcQ"; // Placeholder video ID (Rick Roll) - Change as needed

    return (
        <div style={{ padding: '30px', display: 'flex', gap: '30px', height: 'calc(100vh - 100px)' }}>
            
            {/* LEFT HALF: Top Sellers */}
            <div style={{ flex: 1, background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflowY: 'auto' }}>
                <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
                    <FaCrown color="gold" /> Top Sellers
                </h2>
                
                {loading ? <p>Loading top sellers...</p> : topSellers.length === 0 ? (
                    <p style={{color: '#888'}}>No sellers found.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {topSellers.map((seller, index) => (
                            <div key={seller._id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid #f0f0f0', borderRadius: '10px', transition: 'background 0.2s' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#aaa', width: '20px' }}>#{index + 1}</div>
                                {seller.profilePicture ? (
                                    <img src={seller.profilePicture} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#eee' }}></div>
                                )}
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{seller.username}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'gold' }}>★ {seller.sellerScore} Rating</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT HALF: YouTube Videos */}
            <div style={{ flex: 1, background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#cc0000' }}>
                    <FaYoutube /> Featured Content
                </h2>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Video 1 */}
                    <div style={{ position: 'relative', width: '100%', height: '0', paddingBottom: '56.25%', borderRadius: '10px', overflow: 'hidden', background: '#000' }}>
                        <iframe 
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            src={`https://www.youtube.com/embed/${videoId}`} 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                    
                    <p style={{ color: '#666' }}>
                        Check out the latest sneaker trends and reviews from our community. Stay updated with the hottest drops!
                    </p>
                </div>
            </div>

        </div>
    );
};

export default WelcomePage;