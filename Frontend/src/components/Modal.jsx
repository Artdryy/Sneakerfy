// Frontend/src/components/Modal.jsx
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', // Dark transparent background
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{ 
                background: 'white', padding: '20px', borderRadius: '10px', 
                width: '400px', maxWidth: '90%', position: 'relative' 
            }}>
                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                    &times;
                </button>
                
                {title && <h2 style={{ marginTop: 0 }}>{title}</h2>}
                
                <div style={{ marginTop: '20px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;