import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaUsers, FaRocket, FaCheck, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import api from '../../api/axiosInstance';

const Onboarding = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [skipping, setSkipping] = useState(false);
    const totalSteps = 3;

    // Step 1: Company Details
    const [companyName, setCompanyName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [industry, setIndustry] = useState('');

    // Step 2: Team Setup
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');

    const steps = [
        { id: 1, title: 'Company Details', icon: FaBuilding, description: 'Tell us about your organization' },
        { id: 2, title: 'Team Setup', icon: FaUsers, description: 'Invite your first team member' },
        { id: 3, title: 'Get Started', icon: FaRocket, description: 'You\'re ready to go!' },
    ];

    const handleCompanySubmit = async () => {
        if (!companyName.trim()) return;
        setLoading(true);

        try {
            await api.put('/tenants/profile', {
                name: companyName,
                contactEmail: contactEmail || undefined,
                phone: phone || undefined,
                industry: industry || undefined
            });
            setCurrentStep(2);
        } catch (error) {
            console.error('Failed to update company:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!inviteEmail.trim()) {
            setCurrentStep(3);
            return;
        }
        setLoading(true);

        try {
            await api.post('/users/invite', {
                email: inviteEmail,
                role: inviteRole
            });
            setCurrentStep(3);
        } catch (error) {
            console.error('Failed to invite:', error);
            // Still proceed even if invite fails
            setCurrentStep(3);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            // Mark onboarding as complete
            await api.put('/auth/update-profile', {
                companyProfileUpdated: true
            });

            // Update TenantSubscription onboarding status
            try {
                await api.patch('/subscriptions/current/onboarding-complete');
            } catch (err) {
                // Non-critical, proceed anyway
                console.warn('Onboarding status update skipped:', err.message);
            }

            navigate('/app/dashboard', { replace: true });
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            // Proceed anyway
            navigate('/app/dashboard', { replace: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '700px',
                overflow: 'hidden',
                boxShadow: '0 25px 80px rgba(0,0,0,0.2)'
            }}>
                {/* Progress Bar */}
                <div style={{ background: '#f8f9fa', padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h5 style={{ margin: 0, color: '#333' }}>Welcome to Rate Pro</h5>
                        <span style={{ color: '#888', fontSize: '0.9rem' }}>
                            Step {currentStep} of {totalSteps}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                style={{
                                    flex: 1,
                                    height: '4px',
                                    borderRadius: '2px',
                                    background: step.id <= currentStep ? '#667eea' : '#e9ecef',
                                    transition: 'background 0.3s ease'
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div style={{ padding: '2rem' }}>
                    {/* Step 1: Company Details */}
                    {currentStep === 1 && (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <FaBuilding size={40} color="#667eea" />
                                <h3 style={{ marginTop: '1rem', color: '#333' }}>Company Details</h3>
                                <p style={{ color: '#888' }}>Help us personalize your experience</p>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Organization Name *</label>
                                <input
                                    type="text" className="form-control form-control-lg"
                                    placeholder="Enter your company name"
                                    value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Contact Email</label>
                                <input
                                    type="email" className="form-control"
                                    placeholder="company@example.com"
                                    value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                                />
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="tel" className="form-control"
                                        placeholder="+1 (555) 000-0000"
                                        value={phone} onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Industry</label>
                                    <select
                                        className="form-select"
                                        value={industry} onChange={(e) => setIndustry(e.target.value)}
                                    >
                                        <option value="">Select industry</option>
                                        <option value="technology">Technology</option>
                                        <option value="healthcare">Healthcare</option>
                                        <option value="education">Education</option>
                                        <option value="finance">Finance</option>
                                        <option value="retail">Retail</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary btn-lg w-100 mt-2"
                                onClick={handleCompanySubmit}
                                disabled={!companyName.trim() || loading}
                            >
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                                ) : (
                                    <>Continue <FaArrowRight className="ms-2" /></>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Team Setup */}
                    {currentStep === 2 && (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <FaUsers size={40} color="#667eea" />
                                <h3 style={{ marginTop: '1rem', color: '#333' }}>Invite Your Team</h3>
                                <p style={{ color: '#888' }}>Add your first team member (optional)</p>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Team Member Email</label>
                                <input
                                    type="email" className="form-control form-control-lg"
                                    placeholder="colleague@example.com"
                                    value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label">Role</label>
                                <select
                                    className="form-select"
                                    value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                                >
                                    <option value="member">Team Member</option>
                                    <option value="companyAdmin">Admin</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="btn btn-outline-secondary btn-lg"
                                    onClick={() => setCurrentStep(1)}
                                    disabled={loading}
                                >
                                    <FaArrowLeft className="me-2" />Back
                                </button>
                                <button
                                    className="btn btn-primary btn-lg flex-grow-1"
                                    onClick={handleInvite}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</>
                                    ) : inviteEmail.trim() ? (
                                        <>Send Invite & Continue <FaArrowRight className="ms-2" /></>
                                    ) : (
                                        <>Skip for Now <FaArrowRight className="ms-2" /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Get Started */}
                    {currentStep === 3 && (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto'
                                }}>
                                    <FaCheck size={35} color="white" />
                                </div>
                                <h3 style={{ marginTop: '1.5rem', color: '#333' }}>You're All Set!</h3>
                                <p style={{ color: '#888' }}>
                                    Your workspace is ready. Here's what you can do:
                                </p>
                            </div>

                            <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                                {[
                                    { icon: '📊', text: 'Create your first survey' },
                                    { icon: '👥', text: 'Import your customer contacts' },
                                    { icon: '📧', text: 'Set up email templates' },
                                    { icon: '📈', text: 'Explore analytics dashboard' },
                                ].map((item, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.5rem 0',
                                        borderBottom: idx < 3 ? '1px solid #e9ecef' : 'none'
                                    }}>
                                        <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                        <span style={{ color: '#555' }}>{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="btn btn-primary btn-lg w-100"
                                onClick={handleComplete}
                                disabled={loading}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    border: 'none',
                                    padding: '0.75rem'
                                }}
                            >
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span>Starting...</>
                                ) : (
                                    <>Go to Dashboard <FaRocket className="ms-2" /></>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
