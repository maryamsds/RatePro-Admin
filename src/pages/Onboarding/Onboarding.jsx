import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaUsers, FaRocket, FaCheck, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';

const Onboarding = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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
        { id: 3, title: 'Get Started', icon: FaRocket, description: "You're ready to go!" },
    ];

    const handleCompanySubmit = async () => {
        if (!companyName.trim()) return;

        const tenantId = typeof user.tenant === 'string' ? user.tenant : user.tenant?._id;
        if (!tenantId) {
            setError('No tenant associated with your account. Please contact support.');
            console.error('[Onboarding] Could not extract tenantId from user.tenant:', user.tenant);
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('[Onboarding] Updating tenant:', tenantId, { name: companyName, contactEmail, phone, industry });
            await api.put(`/tenants/${tenantId}`, {
                name: companyName,
                contactEmail: contactEmail || undefined,
                phone: phone || undefined,
                industry: industry || undefined
            });
            console.log('[Onboarding] Company details saved successfully');
            setCurrentStep(2);
        } catch (err) {
            console.error('[Onboarding] Failed to update company:', err);
            setError(err.response?.data?.message || 'Failed to save company details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        // Team invite is optional — just proceed to next step
        // TODO: Implement invite API when backend route is available
        if (inviteEmail.trim()) {
            console.log('[Onboarding] Team invite skipped (no backend route yet):', inviteEmail);
        }
        setCurrentStep(3);
    };

    const handleComplete = () => {
        // Update user state so ProtectedRoute stops redirecting to onboarding
        const updatedUser = { ...user, companyProfileUpdated: true };
        setUser(updatedUser);
        localStorage.setItem('authUser', JSON.stringify(updatedUser));

        navigate('/app/dashboard', { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-8
                        bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] transition-colors duration-300">

            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        Welcome to <span className="text-[var(--primary-color)]">RatePro</span>
                    </h1>
                    <p className="mt-2 text-[var(--text-secondary)]">
                        Let's get your workspace set up in a few quick steps
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8 px-4">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center
                                    transition-all duration-300 text-sm font-semibold
                                    ${step.id < currentStep
                                        ? 'bg-[var(--primary-color)] text-white shadow-md'
                                        : step.id === currentStep
                                            ? 'bg-[var(--primary-color)] text-white shadow-lg ring-4 ring-[var(--primary-light)]'
                                            : 'bg-[var(--light-border)] dark:bg-[var(--dark-border)] text-[var(--text-secondary)]'
                                    }
                                `}>
                                    {step.id < currentStep ? <FaCheck size={14} /> : step.id}
                                </div>
                                <span className={`
                                    mt-2 text-xs font-medium hidden sm:block
                                    ${step.id <= currentStep
                                        ? 'text-[var(--primary-color)]'
                                        : 'text-[var(--text-secondary)]'
                                    }
                                `}>
                                    {step.title}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {idx < steps.length - 1 && (
                                <div className={`
                                    flex-1 h-0.5 mx-3 rounded transition-all duration-300
                                    ${step.id < currentStep
                                        ? 'bg-[var(--primary-color)]'
                                        : 'bg-[var(--light-border)] dark:bg-[var(--dark-border)]'
                                    }
                                `} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card Container */}
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                               rounded-md shadow-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                               overflow-hidden transition-colors duration-300">

                    {/* Step Header */}
                    <div className="px-6 py-5 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <div className="flex items-center gap-3">
                            {(() => {
                                const StepIcon = steps[currentStep - 1].icon;
                                return <StepIcon className="text-[var(--primary-color)]" size={22} />;
                            })()}
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                    {steps[currentStep - 1].title}
                                </h2>
                                <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                                    {steps[currentStep - 1].description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="p-6">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 rounded-md bg-[var(--danger-light)] border border-[var(--danger-color)]
                                            text-[var(--danger-color)] text-sm">
                                {error}
                            </div>
                        )}

                        {/* Step 1: Company Details */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1.5">
                                        Organization Name <span className="text-[var(--danger-color)]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your company name"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                                   bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]
                                                   text-[var(--light-text)] dark:text-[var(--dark-text)]
                                                   placeholder:text-[var(--text-secondary)]
                                                   focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                                                   transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1.5">
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="company@example.com"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                                   bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]
                                                   text-[var(--light-text)] dark:text-[var(--dark-text)]
                                                   placeholder:text-[var(--text-secondary)]
                                                   focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                                                   transition-all duration-200"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1.5">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="+1 (555) 000-0000"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                                       bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]
                                                       text-[var(--light-text)] dark:text-[var(--dark-text)]
                                                       placeholder:text-[var(--text-secondary)]
                                                       focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                                                       transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1.5">
                                            Industry
                                        </label>
                                        <select
                                            value={industry}
                                            onChange={(e) => setIndustry(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                                       bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]
                                                       text-[var(--light-text)] dark:text-[var(--dark-text)]
                                                       focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                                                       transition-all duration-200"
                                        >
                                            <option value="">Select industry</option>
                                            <option value="technology">Technology</option>
                                            <option value="healthcare">Healthcare</option>
                                            <option value="education">Education</option>
                                            <option value="finance">Finance</option>
                                            <option value="retail">Retail</option>
                                            <option value="hospitality">Hospitality</option>
                                            <option value="manufacturing">Manufacturing</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCompanySubmit}
                                    disabled={!companyName.trim() || loading}
                                    className="w-full mt-2 px-6 py-3 rounded-md font-medium text-white
                                               bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]
                                               disabled:opacity-50 disabled:cursor-not-allowed
                                               transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>Continue <FaArrowRight size={14} /></>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Step 2: Team Setup */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1.5">
                                        Team Member Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="colleague@example.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                                   bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]
                                                   text-[var(--light-text)] dark:text-[var(--dark-text)]
                                                   placeholder:text-[var(--text-secondary)]
                                                   focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                                                   transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1.5">
                                        Role
                                    </label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                                   bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]
                                                   text-[var(--light-text)] dark:text-[var(--dark-text)]
                                                   focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                                                   transition-all duration-200"
                                    >
                                        <option value="member">Team Member</option>
                                        <option value="companyAdmin">Admin</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 mt-2">
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        disabled={loading}
                                        className="px-5 py-3 rounded-md font-medium
                                                   border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                                   text-[var(--light-text)] dark:text-[var(--dark-text)]
                                                   hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]
                                                   disabled:opacity-50 disabled:cursor-not-allowed
                                                   transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <FaArrowLeft size={14} /> Back
                                    </button>
                                    <button
                                        onClick={handleInvite}
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 rounded-md font-medium text-white
                                                   bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]
                                                   disabled:opacity-50 disabled:cursor-not-allowed
                                                   transition-colors duration-200 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : inviteEmail.trim() ? (
                                            <>Send Invite & Continue <FaArrowRight size={14} /></>
                                        ) : (
                                            <>Skip for Now <FaArrowRight size={14} /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Get Started */}
                        {currentStep === 3 && (
                            <div>
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center
                                                    bg-[var(--success-light)]">
                                        <FaCheck size={28} className="text-[var(--success-color)]" />
                                    </div>
                                    <h3 className="mt-4 text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                        You're All Set!
                                    </h3>
                                    <p className="mt-1 text-[var(--text-secondary)]">
                                        Your workspace is ready. Here's what you can do:
                                    </p>
                                </div>

                                <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-4 mb-6
                                                border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                    {[
                                        { icon: '📊', text: 'Create your first survey' },
                                        { icon: '👥', text: 'Import your customer contacts' },
                                        { icon: '📧', text: 'Set up email templates' },
                                        { icon: '📈', text: 'Explore analytics dashboard' },
                                    ].map((item, idx) => (
                                        <div key={idx} className={`
                                            flex items-center gap-3 py-3 px-2
                                            ${idx < 3 ? 'border-b border-[var(--light-border)] dark:border-[var(--dark-border)]' : ''}
                                        `}>
                                            <span className="text-lg">{item.icon}</span>
                                            <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                                {item.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleComplete}
                                    disabled={loading}
                                    className="w-full px-6 py-3 rounded-md font-medium text-white
                                               bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]
                                               disabled:opacity-50 disabled:cursor-not-allowed
                                               transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Starting...
                                        </>
                                    ) : (
                                        <>Go to Dashboard <FaRocket size={14} /></>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]
                                    text-center">
                        <span className="text-xs text-[var(--text-secondary)]">
                            Step {currentStep} of {totalSteps}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
