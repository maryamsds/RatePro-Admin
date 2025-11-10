// src/pages/SurveySchedule/SurveySchedule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Form,
  Alert,
  Spinner,
  Badge,
  ProgressBar
} from 'react-bootstrap';
import {
  MdCalendarToday,
  MdAccessTime,
  MdSend,
  MdSchedule,
  MdAutorenew,
  MdInfo,
  MdArrowBack,
  MdArrowForward,
  MdPeople,
  MdPublish,
  // MdDraft
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';

const SurveySchedule = ({ onSchedule }) => {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  // Get survey data from location state
  const surveyData = location.state?.survey;
  const fromAudienceSelection = location.state?.fromAudienceSelection;

  const [survey, setSurvey] = useState(surveyData || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [schedule, setSchedule] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    autoPublish: true,
    repeat: {
      enabled: false,
      frequency: 'none',
      endRepeatDate: ''
    }
  });

  // Audience options for display
  const audienceOptions = {
    'employee': { name: 'Employees', icon: '👥', color: '#0d6efd' },
    'customer': { name: 'Customers', icon: '🛍️', color: '#198754' },
    'public': { name: 'General Public', icon: '🌍', color: '#6f42c1' },
    'vendor': { name: 'Vendors/Partners', icon: '🚚', color: '#fd7e14' },
    'guest': { name: 'Guests/Visitors', icon: '🏨', color: '#20c997' },
    'student': { name: 'Students', icon: '🎓', color: '#dc3545' },
    'patient': { name: 'Patients', icon: '🏥', color: '#0dcaf0' },
    'all': { name: 'All Audiences', icon: '👤', color: '#6c757d' }
  };

  // Fetch survey data if not provided
  useEffect(() => {
    if (!survey && surveyId) {
      fetchSurveyData();
    }
  }, [surveyId, survey]);

  const fetchSurveyData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/surveys/${surveyId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSurvey(response.data);

      // Set existing schedule if available
      if (response.data.schedule) {
        const existingSchedule = response.data.schedule;
        setSchedule({
          startDate: existingSchedule.startDate ? existingSchedule.startDate.split('T')[0] : '',
          startTime: existingSchedule.startDate ? existingSchedule.startDate.split('T')[1]?.substring(0, 5) : '',
          endDate: existingSchedule.endDate ? existingSchedule.endDate.split('T')[0] : '',
          endTime: existingSchedule.endDate ? existingSchedule.endDate.split('T')[1]?.substring(0, 5) : '',
          timezone: existingSchedule.timezone || 'UTC',
          autoPublish: existingSchedule.autoPublish || false,
          repeat: existingSchedule.repeat || { enabled: false, frequency: 'none', endRepeatDate: '' }
        });
      }
    } catch (err) {
      console.error('Error fetching survey:', err);
      setError('Failed to load survey data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('repeat.')) {
      const repeatField = name.split('.')[1];
      setSchedule(prev => ({
        ...prev,
        repeat: {
          ...prev.repeat,
          [repeatField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setSchedule(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!schedule.startDate || !schedule.startTime) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please provide start date and time.',
        icon: 'warning',
        confirmButtonColor: 'var(--bs-warning)'
      });
      return;
    }

    // Create datetime strings
    const startDateTime = new Date(`${schedule.startDate}T${schedule.startTime}`);
    const endDateTime = schedule.endDate && schedule.endTime
      ? new Date(`${schedule.endDate}T${schedule.endTime}`)
      : null;

    // Validation: start time should be in future (unless it's immediate)
    const now = new Date();
    if (startDateTime <= now && schedule.autoPublish) {
      const result = await Swal.fire({
        title: 'Past Date/Time',
        text: 'The start time is in the past. The survey will be published immediately. Continue?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: 'var(--bs-primary)',
        cancelButtonColor: 'var(--bs-secondary)',
        confirmButtonText: 'Publish Now',
        cancelButtonText: 'Change Time'
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    // Validation: end time should be after start time
    if (endDateTime && endDateTime <= startDateTime) {
      Swal.fire({
        title: 'Invalid End Time',
        text: 'End time must be after start time.',
        icon: 'error',
        confirmButtonColor: 'var(--bs-danger)'
      });
      return;
    }

    try {
      setSaving(true);

      const scheduleData = {
        startDate: startDateTime.toISOString(),
        endDate: endDateTime ? endDateTime.toISOString() : null,
        timezone: schedule.timezone,
        autoPublish: schedule.autoPublish,
        repeat: schedule.repeat.enabled ? {
          enabled: true,
          frequency: schedule.repeat.frequency,
          endRepeatDate: schedule.repeat.endRepeatDate || null
        } : { enabled: false, frequency: 'none' }
      };

      // If the repeat frequency is "none", remove it from the payload
      if (surveyData.schedule?.repeat?.frequency === "none") {
        delete surveyData.schedule.repeat.frequency;

        // If repeat is now empty, remove repeat entirely
        if (Object.keys(surveyData.schedule.repeat).length === 0) {
          delete surveyData.schedule.repeat;
        }
      }

      const response = await axios.put(`/api/surveys/${surveyId}/schedule`, scheduleData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Success message
      const publishTime = startDateTime <= now ? 'immediately' : `at ${startDateTime.toLocaleString()}`;

      await Swal.fire({
        title: 'Survey Scheduled!',
        text: `Your survey will be ${schedule.autoPublish ? 'published' : 'available'} ${publishTime}.`,
        icon: 'success',
        confirmButtonColor: 'var(--bs-success)',
        timer: 3000,
        showConfirmButton: false
      });

      // Call onSchedule if provided (for embedded use)
      if (onSchedule) {
        onSchedule(response.data.survey);
      } else {
        // Navigate back to surveys list
        setTimeout(() => {
          navigate('/app/surveys');
        }, 2000);
      }

    } catch (err) {
      console.error('Error scheduling survey:', err);
      Swal.fire({
        title: 'Scheduling Failed',
        text: err.response?.data?.message || 'Failed to schedule survey. Please try again.',
        icon: 'error',
        confirmButtonColor: 'var(--bs-danger)'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <h5>Loading survey data...</h5>
        </div>
      </Container>
    );
  }

  if (error && !survey) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Alert variant="danger" className="text-center">
          <h5>Error Loading Survey</h5>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate('/app/surveys')}>
            Back to Surveys
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="survey-schedule py-4">
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="mb-1">Schedule Survey</h2>
            <p className="text-muted mb-0">
              Set when your survey should be published: <strong>{survey?.title}</strong>
            </p>
          </div>
          <Badge bg="success" className="fs-6">Step 3 of 3</Badge>
        </div>

        {/* Progress Bar */}
        <ProgressBar now={100} className="mb-3" style={{ height: '8px' }} />
      </div>

      <Row>
        <Col lg={8}>
          {/* Survey & Audience Summary */}
          {survey && (
            <Card className="mb-4 bg-light">
              <Card.Body>
                <h6 className="fw-bold mb-3 d-flex align-items-center">
                  <MdInfo className="me-2" />
                  Survey Summary
                </h6>

                <Row>
                  <Col md={6}>
                    <div className="mb-2">
                      <small className="text-muted">Survey Title:</small>
                      <div className="fw-semibold">{survey.title}</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Status:</small>
                      <div>
                        <Badge bg={survey.status === 'active' ? 'success' : survey.status === 'draft' ? 'warning' : 'secondary'}>
                          {survey.status === 'active' && <MdPublish className="me-1" />}
                          {survey.status === 'draft' && <MdDraft className="me-1" />}
                          {survey.status || 'Draft'}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-2">
                      <small className="text-muted">Target Audience:</small>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {(survey.targetAudience || ['public']).map(audienceId => {
                          const audience = audienceOptions[audienceId];
                          return audience ? (
                            <Badge key={audienceId} bg="primary" className="small">
                              {audience.icon} {audience.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Questions:</small>
                      <div className="fw-semibold">{survey.questions?.length || 0} questions</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Scheduling Form */}
          <Card>
            <Card.Header className="d-flex align-items-center">
              <MdSchedule className="me-2" />
              <strong>Schedule Settings</strong>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Auto-Publish Toggle */}
                <Alert variant="info" className="mb-4">
                  <Form.Check
                    type="switch"
                    id="auto-publish"
                    name="autoPublish"
                    label="Enable Auto-Publishing"
                    checked={schedule.autoPublish}
                    onChange={handleChange}
                    className="mb-2"
                  />
                  <small className="text-muted">
                    {schedule.autoPublish
                      ? 'Survey will automatically become active at the specified start time.'
                      : 'Survey will be scheduled but you\'ll need to manually publish it.'
                    }
                  </small>
                </Alert>

                {/* Start Date & Time */}
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <MdCalendarToday className="me-2" />
                        Start Date *
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={schedule.startDate}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <MdAccessTime className="me-2" />
                        Start Time *
                      </Form.Label>
                      <Form.Control
                        type="time"
                        name="startTime"
                        value={schedule.startTime}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* End Date & Time */}
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">End Date (Optional)</Form.Label>
                      <Form.Control
                        type="date"
                        name="endDate"
                        value={schedule.endDate}
                        onChange={handleChange}
                        min={schedule.startDate}
                      />
                      <Form.Text className="text-muted">
                        Leave empty for unlimited duration
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">End Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="endTime"
                        value={schedule.endTime}
                        onChange={handleChange}
                        disabled={!schedule.endDate}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Timezone */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Timezone</Form.Label>
                  <Form.Select
                    name="timezone"
                    value={schedule.timezone}
                    onChange={handleChange}
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Dubai">Dubai (GST)</option>
                    <option value="Asia/Kolkata">India (IST)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </Form.Select>
                </Form.Group>

                {/* Repeat Settings */}
                <Card className="mb-4 bg-light">
                  <Card.Header className="d-flex align-items-center bg-transparent border-0 pb-0">
                    <MdAutorenew className="me-2" />
                    <strong>Repeat Settings</strong>
                  </Card.Header>
                  <Card.Body className="pt-3">
                    <Form.Check
                      type="switch"
                      id="repeat-enabled"
                      name="repeat.enabled"
                      label="Repeat this survey"
                      checked={schedule.repeat.enabled}
                      onChange={handleChange}
                      className="mb-3"
                    />

                    {schedule.repeat.enabled && (
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Frequency</Form.Label>
                            <Form.Select
                              name="repeat.frequency"
                              value={schedule.repeat.frequency}
                              onChange={handleChange}
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Stop Repeating On</Form.Label>
                            <Form.Control
                              type="date"
                              name="repeat.endRepeatDate"
                              value={schedule.repeat.endRepeatDate}
                              onChange={handleChange}
                              min={schedule.startDate}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    )}
                  </Card.Body>
                </Card>

                {/* Action Buttons */}
                <div className="d-flex justify-content-between align-items-center">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/app/surveys')}
                    disabled={saving}
                    className="d-flex align-items-center"
                  >
                    <MdArrowBack className="me-2" />
                    Cancel
                  </Button>

                  <div className="d-flex gap-2">
                    {fromAudienceSelection && (
                      <Button
                        variant="outline-primary"
                        onClick={() => navigate(`/app/surveys/${surveyId}/target-audience`)}
                        disabled={saving}
                      >
                        ← Back to Audience
                      </Button>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={saving}
                      className="d-flex align-items-center"
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <MdSend className="me-2" />
                          {schedule.autoPublish ? 'Schedule & Publish' : 'Save Schedule'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Schedule Preview */}
          <Card className="sticky-top" style={{ top: '1rem' }}>
            <Card.Header>
              <strong>Schedule Preview</strong>
            </Card.Header>
            <Card.Body>
              {schedule.startDate && schedule.startTime ? (
                <div>
                  <div className="mb-3">
                    <small className="text-muted">Survey will start:</small>
                    <div className="fw-bold text-success">
                      {new Date(`${schedule.startDate}T${schedule.startTime}`).toLocaleString()}
                    </div>
                  </div>

                  {schedule.endDate && schedule.endTime && (
                    <div className="mb-3">
                      <small className="text-muted">Survey will end:</small>
                      <div className="fw-bold text-danger">
                        {new Date(`${schedule.endDate}T${schedule.endTime}`).toLocaleString()}
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <small className="text-muted">Timezone:</small>
                    <div className="fw-semibold">{schedule.timezone}</div>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">Auto-publish:</small>
                    <div>
                      <Badge bg={schedule.autoPublish ? 'success' : 'warning'}>
                        {schedule.autoPublish ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>

                  {schedule.repeat.enabled && (
                    <div className="mb-3">
                      <small className="text-muted">Repeat:</small>
                      <div className="fw-semibold text-info">
                        {schedule.repeat.frequency}
                        {schedule.repeat.endRepeatDate && (
                          <small className="d-block text-muted">
                            Until: {new Date(schedule.repeat.endRepeatDate).toLocaleDateString()}
                          </small>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted">
                  <MdSchedule size={48} className="mb-2" />
                  <p>Set start date and time to see preview</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SurveySchedule