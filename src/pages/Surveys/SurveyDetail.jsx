// src\pages\Surveys\SurveyDetail.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Badge, Tab, Tabs,
  Form, Modal, Alert, Spinner, Toast, ToastContainer,
  OverlayTrigger, Tooltip, Dropdown, ProgressBar
} from 'react-bootstrap';
import {
  MdEdit, MdDelete, MdShare, MdQrCode, MdAnalytics,
  MdSettings, MdVisibility, MdContentCopy, MdDownload,
  MdNotifications, MdPeople, MdTrendingUp, MdFlag,
  MdSchedule, MdLanguage, MdPalette, MdSecurity
} from 'react-icons/md';
import { FaStar, FaRegStar, FaEye, FaUsers, FaChartLine } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';
import { QRCodeSVG } from 'qrcode.react';
import Swal from 'sweetalert2';


const SurveyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State Management
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    questions: [],
    settings: {},
    thankYouPage: {},
  });
  console.log("Survey State", survey);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Modal States
  const [showQRModal, setShowQRModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Survey Stats
  const [stats, setStats] = useState({
    totalResponses: 0,
    avgRating: 0,
    completionRate: 0,
    npsScore: 0,
    responseRate: 0
  });

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Fetch Survey Data
  useEffect(() => {
    fetchSurveyDetail();
    fetchSurveyStats();
  }, [id]);

  const fetchSurveyDetail = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/surveys/${id}`);
      console.log('response:', response.data.questions)
      setSurvey(response.data);
      setError('');
      console.log('Fetched survey:', response.data);
    } catch (err) {
      console.error('Error fetching survey:', err);
      setError(err.response?.data?.message || 'Failed to load survey details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveyStats = async () => {
    try {
      const response = await axiosInstance.get(`/analytics/survey/${id}`);
      console.log("Stats Response", response.da)
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Survey Actions
  const handleToggleStatus = async () => {
    try {
      const response = await axiosInstance.patch(`/surveys/${id}/status`);
      setSurvey(prev => ({ ...prev, status: response.data.status }));

      showSuccessToast(`Survey ${response.data.status === 'active' ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to update survey status');
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/surveys/${id}`);
      Swal.fire({
        icon: 'success',
        title: 'Survey Deleted!',
        text: 'Survey has been deleted successfully.',
        confirmButtonColor: 'var(--bs-success)'
      });
      navigate('/surveys');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: err.response?.data?.message || 'Failed to delete survey'
      });
    }
  };

  const handleGenerateQR = async () => {
    try {
      const response = await axiosInstance.post(`/surveys/${id}/qr`);
      // QR code is generated, show modal
      setShowQRModal(true);
    } catch (err) {
      showErrorToast('Failed to generate QR code', err.message);
    }
  };

  const handleCopyLink = () => {
    const surveyLink = `${window.location.origin}/survey/${survey.shareableLink || id}`;
    navigator.clipboard.writeText(surveyLink);
    showSuccessToast('Survey link copied to clipboard!');
  };

  const handleExportPDF = async () => {
    try {
      const response = await axiosInstance.get(`/surveys/${id}/export/pdf`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${survey.title}_report.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      showSuccessToast('PDF report downloaded successfully!');
    } catch (err) {
      showErrorToast('Failed to export PDF report', err.message);
    }
  };

  // Toast Functions
  const showSuccessToast = (message) => {
    setToastMessage(message);
    setToastVariant('success');
    setShowToast(true);
  };

  const showErrorToast = (message) => {
    setToastMessage(message);
    setToastVariant('danger');
    setShowToast(true);
  };

  // Get Status Badge
  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      completed: 'primary',
      draft: 'secondary',
      paused: 'warning'
    };
    return <Badge bg={variants[status] || 'secondary'} className="status-badge">{status?.toUpperCase()}</Badge>;
  };

  // Get Question Type Icon
  const getQuestionIcon = (type) => {
    const icons = {
      text: 'fas fa-font',
      textarea: 'fas fa-align-left',
      radio: 'fas fa-dot-circle',
      checkbox: 'fas fa-check-square',
      select: 'fas fa-list',
      rating: 'fas fa-star',
      nps: 'fas fa-chart-line',
      likert: 'fas fa-sliders-h',
      date: 'fas fa-calendar',
      number: 'fas fa-hashtag',
      file: 'fas fa-file-upload',
      matrix: 'fas fa-table'
    };
    return icons[type] || 'fas fa-question';
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Loading survey details...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger" className="text-center">
          <MdFlag className="me-2" size={24} />
          {error}
          <div className="mt-3">
            <Button variant="outline-danger" onClick={() => navigate('/app/surveys')}>
              Back to Surveys
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <Card className="survey-detail-header shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3">
                <div className="flex-grow-1 w-50">
                  <div className="d-flex align-items-center mb-2">
                    <Button
                      variant="link"
                      className="p-0 me-3 text-primary"
                      onClick={() => navigate('/app/surveys')}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Surveys
                    </Button>
                  </div>

                  <div className="d-flex align-items-center mb-2">
                    {survey?.logo && (
                      <img
                        src={survey.logo.url}
                        alt="Survey Logo"
                        className="survey-logo me-3"
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    )}
                    <div>
                      <h1 className="h3 mb-1 fw-bold">{survey?.title}</h1>
                      <p className="text-muted mb-0 w-70">{survey?.description}</p>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap align-items-center gap-3 mt-3">
                    {getStatusBadge(survey?.status)}
                    <Badge bg="light" text="dark" className="d-flex align-items-center">
                      <MdLanguage className="me-1" />
                      {survey?.language === 'both' ? 'Bilingual' : survey?.language?.toUpperCase()}
                    </Badge>
                    <Badge bg="light" text="dark" className="d-flex align-items-center">
                      <MdPeople className="me-1" />
                      {survey?.questions?.length || 0} Questions
                    </Badge>
                    <Badge bg="light" text="dark" className="d-flex align-items-center">
                      <FaUsers className="me-1" />
                      {stats?.totalResponses} Responses
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-wrap gap-2">
                  <OverlayTrigger overlay={<Tooltip>Edit Survey</Tooltip>}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate(`/app/surveys/builder/edit/${id}`)}
                    >
                      <MdEdit />
                    </Button>
                  </OverlayTrigger>

                  <OverlayTrigger overlay={<Tooltip>Share Survey</Tooltip>}>
                    {survey.status !== "inactive" && survey.status !== "draft" ? (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/app/surveys/${id}/distribution`)}
                      >
                        <MdShare />
                      </Button>
                    ) : (
                      <span />
                    )}
                  </OverlayTrigger>

                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-info bg-opacity-10 text-primary rounded-circle p-3 me-3">
                  <FaEye size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{stats?.totalResponses}</h5>
                  <small className="text-muted">Total Responses</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-success bg-opacity-10 text-success rounded-circle p-3 me-3">
                  <FaStar size={24} />
                </div>
                <div>
                  {/* <h5 className="mb-0">{stats?.avgRating ? stats.avgRating.toFixed(1) : 0}</h5> */}
                  <h5 className="mb-0">{stats?.avgRating ? stats.avgRating.toFixed(1) : '0.0'}</h5>

                  <small className="text-muted">Average Rating</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-info bg-opacity-10 text-info rounded-circle p-3 me-3">
                  <MdTrendingUp size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{stats?.completionRate ?? 0}%</h5>
                  <small className="text-muted">Completion Rate</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-warning bg-opacity-10 text-warning rounded-circle p-3 me-3">
                  <FaChartLine size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{stats?.npsScore ?? 0}</h5>
                  <small className="text-muted">NPS Score</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Row>
        <Col>
          <Card className="survey-detail-content">
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                className="survey-tabs"
              >
                {/* Overview Tab */}
                <Tab eventKey="overview" title={
                  <span><MdVisibility className="me-2" />Overview</span>
                }>
                  <div className="p-4">
                    <Row>
                      <Col lg={8}>
                        <Card className="mb-4">
                          <Card.Header>
                            <Card.Title className="mb-0">Survey Questions</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            {survey?.questions && survey.questions.length > 0 ? (
                              <div className="questions-list">
                                {survey?.questions?.map((question, index) => (
                                  <div key={question._id || index} className="question-item mb-4 p-3 border rounded">
                                    <div className="d-flex align-items-start">
                                      <span className="question-number me-3">{index + 1}</span>
                                      <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-2">
                                          <i className={`${getQuestionIcon(question.type)} me-2 text-primary`}></i>
                                          <h6 className="mb-0">{question.questionText || question.title || question.label || "Untitled Question"}</h6>
                                          {question.required && (
                                            <Badge bg="danger" className="ms-2 rounded-pill">Required</Badge>
                                          )}
                                        </div>
                                        {question.description && (
                                          <p className="text-muted small mb-2">{question.description}</p>
                                        )}
                                        {question.options && question.options.length > 0 && (
                                          <div className="options-preview">
                                            <small className="text-muted">Options:</small>
                                            <ul className="list-unstyled ms-3 mb-0">
                                              {question.options.map((option, optIndex) => (
                                                <li key={optIndex} className="small text-muted">
                                                  • {option}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <i className="fas fa-question-circle fa-3x text-muted mb-3"></i>
                                <p className="text-muted">No questions added yet</p>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col lg={4}>
                        <Card className="mb-4">
                          <Card.Header>
                            <Card.Title className="mb-0">Survey Details</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <div className="detail-item mb-3">
                              <strong>Created:</strong>
                              <span className="ms-2">{new Date(survey?.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="detail-item mb-3">
                              <strong>Last Updated:</strong>
                              <span className="ms-2">{new Date(survey?.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="detail-item mb-3">
                              <strong>Theme Color:</strong>
                              <span
                                className="ms-2 theme-color-preview"
                                style={{
                                  backgroundColor: survey?.themeColor,
                                  display: 'inline-block',
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '4px',
                                  border: '1px solid #dee2e6'
                                }}
                              ></span>
                              <span className="ms-2">{survey?.themeColor}</span>
                            </div>
                            {survey?.settings && (
                              <>
                                <div className="detail-item mb-3 d-flex align-items-center justify-content-between">
                                  <strong>Access:</strong>
                                  <div className="ms-2">
                                    {survey?.settings.requireLogin && (
                                      <Badge bg="warning" className="me-1">Login Required</Badge>
                                    )}
                                    {survey?.settings.isPasswordProtected && (
                                      <Badge bg="danger" className="me-1">Password Protected</Badge>
                                    )}
                                    {survey?.settings.isAnonymous && (
                                      <Badge bg="success" className="me-1">Anonymous Allowed</Badge>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </Card.Body>
                        </Card>

                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0">Quick Actions</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <div className="d-grid gap-2">
                              <Button
                                variant="outline-primary"
                                onClick={() => navigate(`/app/surveys/${id}/responses`)}
                              >
                                <MdAnalytics className="me-2" />
                                View Responses
                              </Button>
                              <Button
                                variant="outline-success"
                                onClick={() => navigate(`/app/surveys/${id}/analytics`)}
                              >
                                <MdTrendingUp className="me-2" />
                                View Analytics
                              </Button>
                              <Button
                                variant="outline-warning"
                                onClick={() => navigate(`/app/surveys/${id}/distribution`)}
                              >
                                <MdShare className="me-2" />
                                Distribution & QR
                              </Button>
                              <Button
                                variant="outline-info"
                                onClick={handleCopyLink}
                              >
                                <MdContentCopy className="me-2" />
                                Copy Survey Link
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {/* Settings Tab */}
                <Tab eventKey="settings" title={
                  <span><MdSettings className="me-2" />Settings</span>
                }>
                  <div className="p-4">
                    <Row>
                      <Col lg={8}>
                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0">Survey Configuration</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <Form>
                              <Row>
                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Survey Status</Form.Label>
                                    <div className="d-flex align-items-center">
                                      {getStatusBadge(survey?.status)}
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="ms-2"
                                        onClick={handleToggleStatus}
                                      >
                                        {survey?.status === 'active' ? 'Deactivate' : 'Activate'}
                                      </Button>
                                    </div>
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Language</Form.Label>
                                    <div className="d-flex align-items-center">
                                      <Badge bg="light" text="dark">
                                        <MdLanguage className="me-1" />
                                        {survey?.language === 'both' ? 'Bilingual' : survey?.language?.toUpperCase()}
                                      </Badge>
                                    </div>
                                  </Form.Group>
                                </Col>
                              </Row>

                              <hr />

                              <h6 className="mb-3">Access Settings</h6>
                              <Row>
                                <Col md={6}>
                                  <div className="mb-3">
                                    <Form.Check
                                      type="switch"
                                      id="allowAnonymous"
                                      label="Allow anonymous responses"
                                      checked={survey?.settings?.allowAnonymous || false}
                                      disabled
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <Form.Check
                                      type="switch"
                                      id="requireLogin"
                                      label="Require login to participate"
                                      checked={survey?.settings?.requireLogin || false}
                                      disabled
                                    />
                                  </div>
                                </Col>
                                <Col md={6}>
                                  <div className="mb-3">
                                    <Form.Check
                                      type="switch"
                                      id="multipleResponses"
                                      label="Allow multiple responses per user"
                                      checked={survey?.settings?.multipleResponses || false}
                                      disabled
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <Form.Check
                                      type="switch"
                                      id="isPasswordProtected"
                                      label="Password protected"
                                      checked={survey?.settings?.isPasswordProtected || false}
                                      disabled
                                    />
                                  </div>
                                </Col>
                              </Row>

                              <div className="text-muted">
                                <small>
                                  <i className="fas fa-info-circle me-1"></i>
                                  To modify settings, use the Edit Survey button
                                </small>
                              </div>
                            </Form>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col lg={4}>
                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0">Survey Theme</Card.Title>
                          </Card.Header>
                          <Card.Body className="text-center">
                            {survey?.logo && (
                              <div className="mb-3">
                                <img
                                  src={survey?.logo.url}
                                  alt="Survey Logo"
                                  className="survey-logo-large"
                                  style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                              </div>
                            )}
                            <div className="mb-3">
                              <strong>Theme Color:</strong>
                              <div
                                className="theme-color-large mx-auto mt-2"
                                style={{
                                  backgroundColor: survey?.themeColor,
                                  width: '60px',
                                  height: '60px',
                                  borderRadius: '8px',
                                  border: '2px solid #dee2e6'
                                }}
                              ></div>
                              <small className="text-muted d-block mt-1">{survey?.themeColor}</small>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {/* Analytics Tab */}
                <Tab eventKey="analytics" title={
                  <span><MdAnalytics className="me-2" />Analytics</span>
                }>
                  <div className="p-4">
                    <Row>
                      <Col md={6} className="mb-4">
                        <Card>
                          <Card.Body className="text-center">
                            <h5>Response Rate</h5>
                            <div className="position-relative">
                              <ProgressBar
                                now={stats?.responseRate}
                                variant="success"
                                className="mb-2"
                                style={{ height: '20px' }}
                              />
                              <span className="position-absolute top-50 start-50 translate-middle fw-bold">
                                {stats?.responseRate}%
                              </span>
                            </div>
                            <small className="text-muted">
                              {stats?.totalResponses} responses collected
                            </small>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col md={6} className="mb-4">
                        <Card>
                          <Card.Body className="text-center">
                            <h5>Completion Rate</h5>
                            <div className="position-relative">
                              <ProgressBar
                                now={stats?.completionRate}
                                variant="info"
                                className="mb-2"
                                style={{ height: '20px' }}
                              />
                              <span className="position-absolute top-50 start-50 translate-middle fw-bold">
                                {stats?.completionRate}%
                              </span>
                            </div>
                            <small className="text-muted">
                              Average completion rate
                            </small>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      <Col>
                        <Card>
                          <Card.Body className="text-center py-5">
                            <MdAnalytics size={64} className="text-muted mb-3" />
                            <h5>Detailed Analytics</h5>
                            <p className="text-muted mb-3">
                              View comprehensive analytics including charts, trends, and insights
                            </p>
                            <Button
                              variant="primary"
                              onClick={() => navigate(`/app/surveys/${id}/analytics`)}
                            >
                              <MdTrendingUp className="me-2" />
                              View Full Analytics
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* QR Code Modal */}
      <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <MdQrCode className="me-2" />
            Survey QR Code
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="mb-3">
            {/* <QRCodeSVG
              value={`${window.location.origin}/survey/${survey?.shareableLink || id}`}
              size={256}
              level="H"
              includeMargin={true}
            /> */}
            <QRCodeSVG
              value={`${window.location.origin}/survey/${survey?.shareableLink || id || ""}`}
              size={256}
              level="H" // high error correction taake logo hone ke bawajood QR scan ho jaye
              includeMargin={true}
              bgColor="var(--bs-primary)" // primary background color
              fgColor="var(--bs-dark)" // QR foreground color
              imageSettings={{
                src: "/images/logo.png", // yahan apna logo ka path de do (e.g. public folder me rakho)
                x: undefined,
                y: undefined,
                height: 50, // logo size adjust kro
                width: 50,
                excavate: true, // ye QR ke bich se background nikal deta hai logo ke liye
              }}
            />
          </div>
          <p className="text-muted">
            Scan this QR code to access the survey directly
          </p>
          <div className="d-grid gap-2">
            <Button
              variant="outline-primary"
              onClick={() => {
                // Download QR code logic here
                const canvas = document.querySelector('#qr-code canvas');
                const link = document.createElement('a');
                link.download = `${survey?.title}_qr.png`;
                link.href = canvas.toDataURL();
                link.click();
              }}
            >
              <MdDownload className="me-2" />
              Download QR Code
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Share Modal */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <MdShare className="me-2" />
            Share Survey
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Survey Link</Form.Label>
            <div className="d-flex">
              <Form.Control
                type="text"
                value={`${window.location.origin}/survey/${survey?.shareableLink || id}`}
                readOnly
              />
              <Button
                variant="outline-primary"
                className="ms-2"
                onClick={handleCopyLink}
              >
                <MdContentCopy />
              </Button>
            </div>
          </Form.Group>

          <div className="d-grid gap-2">
            <Button
              variant="success"
              onClick={() => {
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Please take our survey: ${window.location.origin}/survey/${survey?.shareableLink || id}`)}`;
                window.open(whatsappUrl, '_blank');
              }}
            >
              <i className="fab fa-whatsapp me-2"></i>
              Share via WhatsApp
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                const emailSubject = encodeURIComponent(`Survey: ${survey.title}`);
                const emailBody = encodeURIComponent(`Please take our survey: ${window.location.origin}/survey/${survey?.shareableLink || id}`);
                window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
              }}
            >
              <i className="fas fa-envelope me-2"></i>
              Share via Email
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-danger">
            <MdDelete className="me-2" />
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Are you sure you want to delete "<strong>{survey?.title}</strong>"?
            This action cannot be undone and will permanently delete all survey data and responses.
          </Alert>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <MdDelete className="me-2" />
            Delete Survey
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default SurveyDetail;
