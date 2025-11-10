import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Container, Row, Col, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { MdPeople, MdBusiness, MdPublic, MdLocalShipping, MdHotel, MdSchool, MdLocalHospital, MdCheckCircle } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const TargetAudienceSelection = ({ survey, onNext }) => {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const { user } = useAuth();
  const [selectedAudiences, setSelectedAudiences] = useState(['public']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Target audience options with descriptions
  const audienceOptions = [
    {
      id: 'employee',
      name: 'Employees',
      icon: MdBusiness,
      color: '#0d6efd',
      description: 'Internal staff members, managers, and departments',
      examples: 'HR feedback, performance reviews, workplace satisfaction'
    },
    {
      id: 'customer',
      name: 'Customers',
      icon: MdPeople,
      color: '#198754',
      description: 'Your clients, customers, and service users',
      examples: 'Product feedback, service quality, customer satisfaction'
    },
    {
      id: 'public',
      name: 'General Public',
      icon: MdPublic,
      color: '#6f42c1',
      description: 'Anyone with the survey link can participate',
      examples: 'Market research, brand awareness, public opinion'
    },
    {
      id: 'vendor',
      name: 'Vendors/Partners',
      icon: MdLocalShipping,
      color: '#fd7e14',
      description: 'Business partners, suppliers, and vendors',
      examples: 'Partnership feedback, supplier evaluation, collaboration'
    },
    {
      id: 'guest',
      name: 'Guests/Visitors',
      icon: MdHotel,
      color: '#20c997',
      description: 'Hotel guests, event attendees, facility visitors',
      examples: 'Hospitality feedback, event satisfaction, facility reviews'
    },
    {
      id: 'student',
      name: 'Students',
      icon: MdSchool,
      color: '#dc3545',
      description: 'Students, trainees, and course participants',
      examples: 'Course evaluation, training feedback, educational experience'
    },
    {
      id: 'patient',
      name: 'Patients',
      icon: MdLocalHospital,
      color: '#0dcaf0',
      description: 'Healthcare patients and medical service users',
      examples: 'Healthcare experience, treatment satisfaction, medical services'
    }
  ];

  const handleAudienceToggle = (audienceId) => {
    setSelectedAudiences(prev => {
      if (prev.includes(audienceId)) {
        // Don't allow deselecting if it's the only selected option
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== audienceId);
      } else {
        return [...prev, audienceId];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedAudiences.length === 0) {
      setError('Please select at least one target audience');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/surveys/${surveyId}/target-audience`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ targetAudience: selectedAudiences })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save target audience');
      }

      // Show success message
      await Swal.fire({
        title: 'Target Audience Set!',
        text: `Your survey will be available to: ${selectedAudiences.map(id => 
          audienceOptions.find(opt => opt.id === id)?.name
        ).join(', ')}`,
        icon: 'success',
        confirmButtonColor: 'var(--bs-success)',
        confirmButtonText: 'Continue to Schedule'
      });

      // Navigate to schedule page or call onNext if provided
      if (onNext) {
        onNext(data.survey);
      } else {
        navigate(`/surveys/${surveyId}/schedule`, {
          state: { survey: data.survey }
        });
      }

    } catch (err) {
      console.error('Error saving target audience:', err);
      setError(err.message || 'Failed to save target audience. Please try again.');
      
      Swal.fire({
        title: 'Error',
        text: err.message || 'Failed to save target audience. Please try again.',
        icon: 'error',
        confirmButtonColor: 'var(--bs-danger)'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCount = () => selectedAudiences.length;
  const getSelectedNames = () => {
    return selectedAudiences.map(id => 
      audienceOptions.find(opt => opt.id === id)?.name
    ).join(', ');
  };

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">Select Target Audience</h2>
        <p className="text-muted">
          Choose who should receive and respond to your survey: <strong>{survey?.title || 'Your Survey'}</strong>
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row className="g-4 mb-4">
        {audienceOptions.map((audience) => {
          const isSelected = selectedAudiences.includes(audience.id);
          const IconComponent = audience.icon;

          return (
            <Col key={audience.id} lg={6} xl={4}>
              <Card 
                className={`h-100 cursor-pointer border-2 audience-card ${
                  isSelected ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
                }`}
                onClick={() => handleAudienceToggle(audience.id)}
                style={{ 
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <Card.Body className="p-4 text-center">
                  <div className="position-relative mb-3">
                    <IconComponent 
                      size={48} 
                      style={{ color: audience.color }}
                    />
                    {isSelected && (
                      <MdCheckCircle 
                        size={20} 
                        className="position-absolute top-0 end-0 text-success"
                        style={{ marginTop: '-8px', marginRight: '-8px' }}
                      />
                    )}
                  </div>
                  
                  <h5 className={`fw-bold mb-2 ${isSelected ? 'text-primary' : ''}`}>
                    {audience.name}
                  </h5>
                  
                  <p className="text-muted small mb-3">
                    {audience.description}
                  </p>
                  
                  <div className="small text-secondary">
                    <strong>Examples:</strong> {audience.examples}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Selection Summary */}
      {getSelectedCount() > 0 && (
        <Alert variant="info" className="mb-4">
          <div className="d-flex align-items-center">
            <MdCheckCircle className="me-2 text-success" />
            <div>
              <strong>Selected Audiences ({getSelectedCount()}):</strong>
              <div className="mt-1">{getSelectedNames()}</div>
            </div>
          </div>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="d-flex justify-content-between align-items-center">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          ← Back to Survey
        </Button>

        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary"
            onClick={() => setSelectedAudiences(['public'])}
            disabled={loading}
          >
            Reset to Public
          </Button>
          
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading || getSelectedCount() === 0}
            className="d-flex align-items-center"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                Continue to Schedule →
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <Alert variant="light" className="mt-4 border">
        <h6 className="fw-bold mb-2">💡 Pro Tips:</h6>
        <ul className="small mb-0">
          <li>You can select multiple audiences for broader reach</li>
          <li>Choose audiences that best represent your survey goals</li>
          <li>Different audiences may require different question approaches</li>
          <li>You can change this later in survey settings</li>
        </ul>
      </Alert>
    </Container>
  );
};

export default TargetAudienceSelection;