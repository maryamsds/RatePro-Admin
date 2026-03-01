import { useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaArrowLeft } from 'react-icons/fa';

const CheckoutCancel = () => {
    const navigate = useNavigate();
    const publicUrl = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '2rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '3rem',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
            }}>
                <FaTimesCircle size={60} color="#dc3545" />
                <h2 style={{ marginTop: '1.5rem', color: '#333' }}>
                    Checkout Cancelled
                </h2>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>
                    No worries! Your checkout was cancelled and you haven't been charged.
                    You can try again anytime.
                </p>
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a
                        href={`${publicUrl}/pricing`}
                        className="btn btn-primary"
                    >
                        <FaArrowLeft className="me-2" />
                        Back to Pricing
                    </a>
                    <button
                        onClick={() => navigate('/app/dashboard', { replace: true })}
                        className="btn btn-outline-secondary"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutCancel;
