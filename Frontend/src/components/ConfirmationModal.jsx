import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }) => {
    if (!isOpen) return null;

    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 2000
    };

    const modalStyle = {
        background: 'white', padding: '25px', borderRadius: '12px',
        width: '400px', maxWidth: '90%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        textAlign: 'center'
    };

    const buttonContainerStyle = {
        display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px'
    };

    const btnBase = {
        padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem'
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{title}</h3>
                <p style={{ color: '#666', marginBottom: '10px' }}>{message}</p>
                
                <div style={buttonContainerStyle}>
                    <button 
                        onClick={onClose} 
                        style={{ ...btnBase, background: '#eee', color: '#333' }}
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={() => { onConfirm(); onClose(); }}
                        style={{ ...btnBase, background: isDanger ? '#dc3545' : '#007bff', color: 'white' }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;