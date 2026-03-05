import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MdCheckCircle, MdSettings, MdWarning, MdRefresh } from 'react-icons/md';
import api from '../../api/axiosInstance';
import { getCurrentSubscription, verifyCheckoutSession } from '../../api/services/subscriptionService';

const CheckoutSuccess = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // processing | success | fallback
    const [attempt, setAttempt] = useState(0);

    console.log('[CheckoutSuccess] Page loaded with session_id:', sessionId);

    // Force-refresh user data from backend (gets updated role + tenant after webhook)
    const refreshUserAuth = async () => {
        try {
            console.log('[CheckoutSuccess] Refreshing user auth data...');
            const res = await api.get('/auth/me', { withCredentials: true });
            if (res.data?.user) {
                const oldUser = JSON.parse(localStorage.getItem('authUser') || '{}');
                const updatedUser = { ...res.data.user, accessToken: oldUser.accessToken || res.data.accessToken };
                localStorage.setItem('authUser', JSON.stringify(updatedUser));
                console.log('[CheckoutSuccess] ✅ User data refreshed — role:', updatedUser.role, '| tenant:', updatedUser.tenant);
                return true;
            }
        } catch (err) {
            console.warn('[CheckoutSuccess] ❌ Failed to refresh user data:', err.message);
        }
        return false;
    };

    // Check subscription via /subscriptions/current
    const checkSubscription = useCallback(async () => {
        try {
            console.log('[CheckoutSuccess] Checking subscription via /subscriptions/current...');
            const res = await getCurrentSubscription();
            const sub = res.data;

            if (!sub) {
                console.log('[CheckoutSuccess] No tenant provisioned yet, waiting...');
                return false;
            }

            if (sub && sub.billing?.status === 'active') {
                console.log('[CheckoutSuccess] ✅ Subscription is active! Plan:', sub.planCode);
                return true;
            }

            console.log('[CheckoutSuccess] Subscription found but status:', sub.billing?.status);
            return false;
        } catch (err) {
            console.error('[CheckoutSuccess] Error checking subscription:', err.message);
            return false;
        }
    }, []);

    // Verify session via /subscriptions/verify-session (fallback)
    const verifySession = useCallback(async () => {
        if (!sessionId) {
            console.warn('[CheckoutSuccess] No session_id in URL, cannot verify');
            return false;
        }

        try {
            console.log('[CheckoutSuccess] Triggering verify-session fallback...');
            const res = await verifyCheckoutSession(sessionId);

            if (res.provisioned) {
                console.log('[CheckoutSuccess] ✅ Provisioned via verify-session!');
                return true;
            }

            console.log('[CheckoutSuccess] Verify-session result:', res.message, '| paymentStatus:', res.paymentStatus);
            return false;
        } catch (err) {
            console.error('[CheckoutSuccess] ❌ Verify-session error:', err.message);
            return false;
        }
    }, [sessionId]);

    // Handle success: refresh user data and redirect
    const handleSuccess = useCallback(async () => {
        setStatus('success');
        console.log('[CheckoutSuccess] 🎉 Success! Refreshing user and redirecting...');
        await refreshUserAuth();
        setTimeout(() => {
            navigate('/app/onboarding', { replace: true });
        }, 2000);
    }, [navigate]);

    // Main polling logic: max 5 attempts
    useEffect(() => {
        let timer;
        let currentAttempt = 0;

        const poll = async () => {
            currentAttempt++;
            setAttempt(currentAttempt);
            console.log(`[CheckoutSuccess] --- Attempt ${currentAttempt}/5 ---`);

            let isProvisioned = false;

            // Attempts 1-2: check /subscriptions/current
            // Attempt 3: verify-session fallback
            // Attempt 4: check /subscriptions/current
            // Attempt 5: verify-session (final)
            if (currentAttempt === 3 || currentAttempt === 5) {
                isProvisioned = await verifySession();
            } else {
                isProvisioned = await checkSubscription();
            }

            if (isProvisioned) {
                await handleSuccess();
                return;
            }

            if (currentAttempt >= 5) {
                console.log('[CheckoutSuccess] ⏰ Max attempts reached, showing fallback UI');
                setStatus('fallback');
                return;
            }

            // Delay: 2s for first 2 attempts, 3s for attempts 3-4
            const delay = currentAttempt <= 2 ? 2000 : 3000;
            console.log(`[CheckoutSuccess] Waiting ${delay}ms before next attempt...`);
            timer = setTimeout(poll, delay);
        };

        poll();

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [checkSubscription, verifySession, handleSuccess]);

    // Retry handler
    const handleRetry = async () => {
        console.log('[CheckoutSuccess] 🔄 Manual retry triggered');
        setStatus('processing');
        setAttempt(0);

        // Try verify-session directly
        const isProvisioned = await verifySession();
        if (isProvisioned) {
            await handleSuccess();
        } else {
            // Try current subscription
            const isActive = await checkSubscription();
            if (isActive) {
                await handleSuccess();
            } else {
                setStatus('fallback');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] p-4">
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg max-w-md w-full text-center p-8 border border-[var(--light-border)] dark:border-[var(--dark-border)]">

                {/* Processing State */}
                {status === 'processing' && (
                    <>
                        <div className="flex justify-center mb-6">
                            <MdSettings
                                size={56}
                                className="text-[var(--primary-color)] animate-spin"
                            />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                            Setting Up Your Workspace
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-4">
                            Payment successful! We're configuring your account...
                        </p>
                        <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-3 flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin" />
                            <span className="text-[var(--text-secondary)] text-sm">
                                Activating subscription... ({attempt}/5)
                            </span>
                        </div>
                    </>
                )}

                {/* Success State */}
                {status === 'success' && (
                    <>
                        <div className="flex justify-center mb-6">
                            <MdCheckCircle
                                size={56}
                                className="text-[var(--success-color)]"
                            />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                            Your Workspace is Ready!
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-4">
                            Subscription activated. Redirecting to onboarding...
                        </p>
                        <div className="flex justify-center">
                            <div className="w-5 h-5 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin" />
                        </div>
                    </>
                )}

                {/* Fallback / Timeout State */}
                {status === 'fallback' && (
                    <>
                        <div className="flex justify-center mb-6">
                            <MdWarning
                                size={56}
                                className="text-[var(--warning-color)]"
                            />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                            Still Setting Things Up...
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-6">
                            Your payment was successful. Setup is taking a bit longer than usual.
                            Click retry or you'll receive a confirmation email shortly.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={handleRetry}
                                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-1"
                            >
                                <MdRefresh /> Retry
                            </button>
                            <button
                                onClick={() => navigate('/app/dashboard', { replace: true })}
                                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)]"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CheckoutSuccess;
