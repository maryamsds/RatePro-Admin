import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaCog, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../api/axiosInstance';

const CheckoutSuccess = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const navigate = useNavigate();
    const [status, setStatus] = useState('polling'); // polling | active | timeout | error
    const [pollCount, setPollCount] = useState(0);

    const checkSubscription = useCallback(async () => {
        try {
            const res = await api.get('/subscriptions/current');
            const sub = res.data?.data;

            if (sub && sub.billing?.status === 'active') {
                setStatus('active');
                // Short delay for UX, then redirect to onboarding
                setTimeout(() => {
                    navigate('/app/onboarding', { replace: true });
                }, 2000);
                return true;
            }
        } catch (err) {
            console.error('Polling error:', err.message);
        }
        return false;
    }, [navigate]);

    useEffect(() => {
        let timer;
        let count = 0;

        const poll = async () => {
            count++;
            setPollCount(count);

            const isActive = await checkSubscription();
            if (isActive) return;

            // Adaptive polling: 2s × 5 → 5s × 4 → timeout
            if (count < 5) {
                timer = setTimeout(poll, 2000); // Phase 1: every 2s
            } else if (count < 9) {
                timer = setTimeout(poll, 5000); // Phase 2: every 5s
            } else {
                setStatus('timeout'); // Phase 3: timeout
            }
        };

        poll();

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [checkSubscription]);

    const handleRetry = async () => {
        setStatus('polling');
        setPollCount(0);
        const isActive = await checkSubscription();
        if (!isActive) {
            setStatus('timeout');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '3rem',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
            }}>
                {status === 'polling' && (
                    <>
                        <FaCog
                            size={60}
                            color="#667eea"
                            style={{ animation: 'spin 2s linear infinite' }}
                        />
                        <h2 style={{ marginTop: '1.5rem', color: '#333' }}>
                            Setting Up Your Account
                        </h2>
                        <p style={{ color: '#666', marginTop: '0.5rem' }}>
                            Payment successful! We're configuring your workspace...
                        </p>
                        <div style={{
                            marginTop: '1.5rem',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            padding: '1rem'
                        }}>
                            <FaSpinner
                                size={20}
                                color="#667eea"
                                style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}
                            />
                            <span style={{ color: '#888', fontSize: '0.9rem' }}>
                                Activating subscription... ({pollCount}/9)
                            </span>
                        </div>
                    </>
                )}

                {status === 'active' && (
                    <>
                        <FaCheckCircle size={60} color="#28a745" />
                        <h2 style={{ marginTop: '1.5rem', color: '#333' }}>
                            You're All Set!
                        </h2>
                        <p style={{ color: '#666', marginTop: '0.5rem' }}>
                            Your subscription is active. Redirecting to setup...
                        </p>
                        <div style={{ marginTop: '1.5rem' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Redirecting...</span>
                            </div>
                        </div>
                    </>
                )}

                {status === 'timeout' && (
                    <>
                        <FaExclamationTriangle size={60} color="#ffc107" />
                        <h2 style={{ marginTop: '1.5rem', color: '#333' }}>
                            Taking Longer Than Expected
                        </h2>
                        <p style={{ color: '#666', marginTop: '0.5rem' }}>
                            Your payment was successful. Account setup is still processing.
                            You'll receive a confirmation email shortly.
                        </p>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={handleRetry}
                                className="btn btn-primary"
                            >
                                Check Again
                            </button>
                            <button
                                onClick={() => navigate('/app/dashboard', { replace: true })}
                                className="btn btn-outline-secondary"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default CheckoutSuccess;
