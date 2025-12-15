import { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import { FaCommentDots, FaTimes, FaMinus, FaPaperPlane, FaChevronLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ChatWidget = ({ activeChatUser, onCloseActiveChat }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // The user currently chatting with
    const [chatHistory, setChatHistory] = useState([]);
    const [messageText, setMessageText] = useState('');
    const chatEndRef = useRef(null);

    // Handle external trigger to open chat (e.g., from Sneaker Details)
    useEffect(() => {
        if (activeChatUser) {
            setIsOpen(true);
            setIsMinimized(false);
            setSelectedUser(activeChatUser);
            fetchChatHistory(activeChatUser._id);
        }
    }, [activeChatUser]);

    useEffect(() => {
        if (isOpen && !selectedUser) {
            fetchConversations();
        }
    }, [isOpen, selectedUser]);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/messages/inbox', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(res.data);
        } catch (err) {
            console.error("Failed to load inbox", err);
        }
    };

    const fetchChatHistory = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/messages/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChatHistory(res.data);
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } catch (err) {
            console.error("Failed to load chat", err);
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedUser) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/messages', { 
                recipientId: selectedUser._id,
                content: messageText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setChatHistory([...chatHistory, res.data]);
            setMessageText('');
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } catch (err) {
            toast.error('Failed to send message');
        }
    };

    // Styles
    const widgetStyle = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '320px',
        height: isMinimized ? '50px' : '450px',
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        borderRadius: '12px 12px 0 0',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        transition: 'height 0.3s ease'
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed', bottom: '20px', right: '20px', 
                    width: '60px', height: '60px', borderRadius: '50%', 
                    background: 'black', color: 'white', border: 'none', 
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer', zIndex: 2000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                }}>
                <FaCommentDots />
            </button>
        );
    }

    return (
        <div style={widgetStyle}>
            {/* Header */}
            <div style={{ 
                background: '#1a1a1a', color: 'white', padding: '12px', 
                borderRadius: isMinimized ? '12px 12px 12px 12px' : '12px 12px 0 0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
            }}
            onClick={() => setIsMinimized(!isMinimized)}
            >
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    {selectedUser && !isMinimized && (
                        <FaChevronLeft onClick={(e) => { e.stopPropagation(); setSelectedUser(null); onCloseActiveChat && onCloseActiveChat(); }} />
                    )}
                    <span style={{fontWeight: 'bold', fontSize: '0.9rem'}}>
                        {selectedUser ? selectedUser.username : 'Messages'}
                    </span>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    <FaMinus onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }} />
                    <FaTimes onClick={(e) => { e.stopPropagation(); setIsOpen(false); onCloseActiveChat && onCloseActiveChat(); }} />
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    
                    {/* CONVERSATION LIST */}
                    {!selectedUser ? (
                        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                            {conversations.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>No conversations yet.</p>
                            ) : (
                                conversations.map((conv, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => { setSelectedUser(conv.contactInfo); fetchChatHistory(conv.contactInfo._id); }}
                                        style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                    >
                                        <img src={conv.contactInfo?.profilePicture || "https://via.placeholder.com/40"} style={{width:'40px', height:'40px', borderRadius:'50%'}} />
                                        <div>
                                            <div style={{fontWeight:'bold'}}>{conv.contactInfo?.username}</div>
                                            <div style={{fontSize:'0.8rem', color:'#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px'}}>
                                                {conv.lastMessage?.content}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        /* CHAT VIEW */
                        <>
                            <div style={{ flex: 1, padding: '10px', overflowY: 'auto', background: '#f9f9f9' }}>
                                {chatHistory.map((msg, i) => (
                                    <div key={i} style={{ 
                                        textAlign: msg.sender !== selectedUser._id ? 'right' : 'left', 
                                        marginBottom: '8px' 
                                    }}>
                                        <span style={{ 
                                            background: msg.sender !== selectedUser._id ? '#007bff' : '#e0e0e0', 
                                            color: msg.sender !== selectedUser._id ? 'white' : 'black',
                                            padding: '8px 12px', borderRadius: '12px', fontSize: '0.9rem', display: 'inline-block', maxWidth: '80%', wordBreak: 'break-word'
                                        }}>
                                            {msg.content}
                                        </span>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <div style={{ padding: '10px', borderTop: '1px solid #eee', display: 'flex', gap: '5px' }}>
                                <input 
                                    value={messageText} 
                                    onChange={e => setMessageText(e.target.value)} 
                                    placeholder="Type a message..." 
                                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                    style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '20px', fontSize: '0.9rem' }}
                                />
                                <button onClick={handleSendMessage} style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px', borderRadius: '50%', width:'40px', height:'40px', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWidget;