// src/pages/Unauthorized/Unauthorized.jsx
// ============================================================================
// 🚫 Unauthorized Access Page
// 
// Displays a clear authorization error message when users attempt to access
// pages they don't have permission for. Receives context via location state.
// ============================================================================

import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Badge } from 'react-bootstrap';
import { MdBlock, MdHome, MdArrowBack, MdSupport } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

// ============================================================================
// Role Display Configuration
// ============================================================================

const ROLE_LABELS = {
    admin: 'System Admin',
    companyAdmin: 'Company Admin',
    companyadmin: 'Company Admin',
    member: 'Member',
};

const SCOPE_LABELS = {
    platform: 'System Admin',
    tenant: 'Company Admin or Member',
    shared: 'Admin or Company Admin',
};

// ============================================================================
// Unauthorized Component
// ============================================================================

const Unauthorized = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Extract context from location state (passed by RoleGuard)
    const { userRole, requiredScope, redirectTo } = location.state || {};

    // Fallback values for direct access or missing state
    const displayRole = ROLE_LABELS[userRole] || ROLE_LABELS[user?.role] || 'Unknown';
    const displayRequired = SCOPE_LABELS[requiredScope] || 'Authorized Users';

    // Determine smart navigation based on user role
    const getHomePath = () => {
        const role = userRole || user?.role;
        switch (role?.toLowerCase()) {
            case 'admin':
                return '/app/subscription/plans';
            case 'companyadmin':
            case 'member':
                return '/app/dashboard';
            default:
                return '/login';
        }
    };

    const handleGoHome = () => {
        navigate(redirectTo || getHomePath());
    };

    const handleGoBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            handleGoHome();
        }
    };

    return (
        <Container
            fluid
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}
        >
            <Card className="shadow-lg border-0" style={{ maxWidth: '480px', width: '100%' }}>
                <Card.Body className="text-center p-5">
                    {/* Icon */}
                    <div
                        className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#fee2e2',
                        }}
                    >
                        <MdBlock size={40} className="text-danger" />
                    </div>

                    {/* Title */}
                    <h2 className="fw-bold text-dark mb-2">Access Denied</h2>
                    <p className="text-muted mb-4">
                        You don't have permission to access this page or perform this action.
                    </p>

                    {/* Role Information */}
                    <div className="bg-light rounded p-3 mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted small">Your Role:</span>
                            <Badge bg="secondary" className="px-3 py-2">
                                {displayRole}
                            </Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted small">Required:</span>
                            <Badge bg="primary" className="px-3 py-2">
                                {displayRequired}
                            </Badge>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                        <Button
                            variant="outline-secondary"
                            onClick={handleGoBack}
                            className="d-flex align-items-center gap-2"
                        >
                            <MdArrowBack size={18} />
                            Go Back
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleGoHome}
                            className="d-flex align-items-center gap-2"
                        >
                            <MdHome size={18} />
                            Go to Home
                        </Button>
                    </div>

                    {/* Help Text */}
                    <p className="text-muted small mt-4 mb-0">
                        If you believe this is an error, please contact your administrator.
                    </p>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Unauthorized;
