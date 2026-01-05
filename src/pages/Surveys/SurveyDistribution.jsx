import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Badge, Form,
  InputGroup, Modal, Spinner, Alert, Tabs, Tab,
  OverlayTrigger, Tooltip, ListGroup, Table,
  Accordion, Offcanvas
} from 'react-bootstrap';
import {
  MdQrCode, MdShare, MdEmail, MdSms, MdLink,
  MdDownload, MdPrint, MdContentCopy, MdSettings,
  MdVisibility, MdAnalytics, MdNotifications,
  MdSchedule, MdGroup, MdMobileScreenShare,
  MdWeb, MdAutorenew, MdLocationOn, MdCode,
  MdStore, MdRestaurant, MdLocalHospital,
  MdSchool, MdBusiness, MdStadium, MdHotel
} from 'react-icons/md';
import {
  FaUsers, FaClock, FaLanguage, FaGlobe,
  FaChartBar, FaEye, FaHandPointer, FaLightbulb,
  FaPalette, FaRocket, FaDownload,
  FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin,
  FaTelegram, FaInstagram
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import logo from '../../../public/images/qr_logo.png';
import { Canvg } from "canvg";


const SurveyDistribution = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  // State Management
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('qr');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  // const [showEmbedModal, setShowEmbedModal] = useState(false); // TODO: Implement embed modal
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);


  const [qrSettings, setQrSettings] = useState({
    size: 256,
    includeTitle: true,
    includeLogo: true,
    customText: 'Scan to share your feedback',
    backgroundColor: 'var(--primary-color)',
    foregroundColor: 'var(--bs-dark)',
    errorCorrectionLevel: 'H' // use high level to keep logo readable
  });

  const [emailSettings, setEmailSettings] = useState({
    subject: 'We value your feedback - Quick Survey',
    message: 'Hello! We would love to hear about your experience. Please take a moment to share your feedback.',
    recipients: '',
    sendSchedule: 'immediate',
    scheduledDate: '',
    includeSurveyPreview: true
  });

  const [smsSettings, setSmsSettings] = useState({
    message: 'Share your feedback: [SURVEY_LINK]. Takes 2 minutes. Thank you!',
    recipients: '',
    sendSchedule: 'immediate',
    scheduledDate: ''
  });

  // Distribution Channels
  const distributionChannels = [
    {
      id: 'qr',
      name: 'QR Codes',
      icon: MdQrCode,
      color: 'var(--bs-primary)',
      description: 'Generate QR codes for physical locations',
      locations: ['Entrance', 'Receipt', 'Table', 'Ticket', 'Kiosk', 'Counter']
    },
    {
      id: 'link',
      name: 'Direct Links',
      icon: MdLink,
      color: 'var(--bs-success)',
      description: 'Share survey URLs directly',
      methods: ['Copy Link', 'Short URL', 'Custom Domain']
    },
    {
      id: 'email',
      name: 'Email Campaign',
      icon: MdEmail,
      color: 'var(--bs-info)',
      description: 'Send surveys via email',
      features: ['Bulk Send', 'Personalization', 'Scheduling']
    },
    {
      id: 'sms',
      name: 'SMS/WhatsApp',
      icon: MdSms,
      color: 'var(--bs-warning)',
      description: 'Mobile messaging distribution',
      platforms: ['SMS', 'WhatsApp', 'Telegram']
    },
    {
      id: 'social',
      name: 'Social Media',
      icon: MdShare,
      color: 'var(--bs-pink)',
      description: 'Share on social platforms',
      platforms: ['Facebook', 'Twitter', 'LinkedIn', 'Instagram']
    },
    {
      id: 'embed',
      name: 'Website Embed',
      icon: MdWeb,
      color: 'var(--bs-purple)',
      description: 'Embed survey in websites/apps',
      types: ['iFrame', 'Widget', 'Modal', 'Popup']
    }
  ];

  // Physical Location Types
  const locationTypes = [
    { id: 'retail', name: 'Retail Store', icon: MdStore, suggestions: ['Counter', 'Receipt', 'Entrance', 'Checkout'] },
    { id: 'restaurant', name: 'Restaurant', icon: MdRestaurant, suggestions: ['Table', 'Receipt', 'Menu', 'Exit'] },
    { id: 'hotel', name: 'Hotel', icon: MdHotel, suggestions: ['Check-in', 'Room', 'Lobby', 'Check-out'] },
    { id: 'hospital', name: 'Healthcare', icon: MdLocalHospital, suggestions: ['Reception', 'Waiting Area', 'Discharge', 'Pharmacy'] },
    { id: 'education', name: 'Education', icon: MdSchool, suggestions: ['Classroom', 'Library', 'Cafeteria', 'Office'] },
    { id: 'office', name: 'Office', icon: MdBusiness, suggestions: ['Entrance', 'Meeting Room', 'Cafeteria', 'Exit'] },
    { id: 'event', name: 'Event/Stadium', icon: MdStadium, suggestions: ['Entry Gate', 'Concession', 'Exit', 'Parking'] }
  ];

  // Load survey data
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/surveys/${id}`);
        console.log('Fetched Survey Data:', response.data);
        const surveyData = response.data.survey; // Access the nested survey object
        setSurvey({
          id: surveyData._id,
          title: surveyData.title,
          description: surveyData.description,
          url: `https://rate-pro-public.vercel.app/survey/${surveyData._id}`,
          // shortUrl: `https://ratepro.me/s/${surveyData._id}`,
          isActive: surveyData.isActive,
          responseCount: surveyData.responseCount,
          distributionStats: surveyData.distributionStats
        });
      } catch (error) {
        console.error('Error fetching survey:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load survey data.'
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSurvey();
    }
  }, [id]);

  const downloadQR = async (format = "png") => {
    const svgElement = document
      .getElementById("qr-preview")
      .getElementsByTagName("svg")[0];

    if (!svgElement) {
      console.error("SVG not found inside #qr-preview");
      return;
    }

    // Clone the SVG so we don't mess the original
    const clone = svgElement.cloneNode(true);

    // Replace CSS variables manually
    const computedBg = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary-color")
      .trim() || "#ffffff";

    clone.querySelectorAll("*").forEach((el) => {
      if (el.getAttribute("fill") === "var(--primary-color)") {
        el.setAttribute("fill", computedBg);
      }
    });

    const svgString = new XMLSerializer().serializeToString(clone);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = qrSettings.size + 32;
    canvas.height = qrSettings.size + 32;

    // White background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const v = await Canvg.fromString(ctx, svgString, { ignoreClear: true });
    await v.render();

    const link = document.createElement("a");
    link.download = `survey-qr-${survey?._id || "code"}.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
  };
 
 const printQR = () => {
  const qrContainer = document.getElementById("qr-preview");
  if (!qrContainer) return console.error("QR preview not found!");

  const cloned = qrContainer.cloneNode(true);

  // Replace CSS vars with actual values (just like download fix)
  const computedBg = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary-color")
    .trim() || "#1fdae4";

  cloned.querySelectorAll("*").forEach((el) => {
    if (el.getAttribute("fill") === "var(--primary-color)") {
      el.setAttribute("fill", computedBg);
    }
  });

  const qrHTML = cloned.innerHTML;
  const title = survey?.title || "Survey QR Code";
  const customText = qrSettings?.customText || "";

  const printWindow = window.open("", "", "width=700,height=900");
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          body {
            font-family: 'Arial', sans-serif;
            text-align: center;
            padding: 40px;
            background: #fff;
          }
          h2 {
            color: #333;
            margin-bottom: 8px;
          }
          p {
            color: #666;
            margin: 8px 0;
          }
          .qr-container {
            display: inline-block;
            background: ${computedBg};
            padding: 16px;
            border-radius: 12px;
            margin: 20px auto;
          }
          svg {
            width: ${qrSettings.size || 256}px;
            height: ${qrSettings.size || 256}px;
          }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        <p>${customText}</p>
        <div class="qr-container">${qrHTML}</div>
        <p>Scan with your phone camera to participate</p>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.onload = () => setTimeout(() => printWindow.print(), 500);
};
 

  // Copy survey link
  const copyLink = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Survey link copied to clipboard',
        timer: 2000,
        showConfirmButton: false
      });
    });
  };

  // Social Media Sharing
  const shareOnSocial = (platform) => {
    const url = encodeURIComponent(survey.url);
    const text = encodeURIComponent(`${survey.title} - ${survey.description}`);

    const socialUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text} ${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`
    };

    if (socialUrls[platform]) {
      window.open(socialUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  // Send Email Campaign
  const sendEmailCampaign = async () => {
    try {
      if (!emailSettings.recipients.trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please enter recipient email addresses'
        });
        return;
      }

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Swal.fire({
        icon: 'success',
        title: 'Email Campaign Sent!',
        text: `Survey emails sent successfully to ${emailSettings.recipients.split(',').length} recipients`,
        timer: 3000,
        showConfirmButton: false
      });

      setShowEmailModal(false);
    } catch (error) {
      console.error('Error sending email:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Failed to send email campaign'
      });
    }
  };

  // Send SMS Campaign
  const sendSMSCampaign = async () => {
    try {
      if (!smsSettings.recipients.trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please enter recipient phone numbers'
        });
        return;
      }

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Swal.fire({
        icon: 'success',
        title: 'SMS Campaign Sent!',
        text: `Survey SMS sent successfully to ${smsSettings.recipients.split(',').length} recipients`,
        timer: 3000,
        showConfirmButton: false
      });

      setShowSMSModal(false);
    } catch (error) {
      console.error('Error sending SMS:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Failed to send SMS campaign'
      });
    }
  };

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!survey) {
    return (
      <Container fluid>
        <Alert variant="danger">
          Survey not found. Please check the survey ID and try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="survey-distribution">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div className="d-flex align-items-center mb-2">
                <MdShare className="me-2 text-primary" size={32} />
                <h1 className="h3 mb-0 fw-bold">Survey Distribution</h1>
              </div>
              <p className="text-muted mb-2">
                Distribute "{survey.title}" across multiple channels
              </p>

              {/* Survey Stats */}
              <div className="d-flex gap-3">
                <Badge bg="primary" className="d-flex align-items-center">
                  <FaEye className="me-1" size={12} />
                  {survey.responseCount} Responses
                </Badge>
                <Badge bg={survey.isActive ? 'success' : 'secondary'} className="d-flex align-items-center">
                  {survey.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => navigate(`/app/surveys/detail/${id}`)}
                className="d-flex align-items-center"
              >
                <MdVisibility className="me-2" />
                View Survey
              </Button>
              <Button
                variant="outline-info"
                onClick={() => navigate(`/app/surveys/${id}/analytics`)}
                className="d-flex align-items-center"
              >
                <MdAnalytics className="me-2" />
                Analytics
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Distribution Channels Overview */}
      <Row className="mb-4">
        <Col>
          <h5 className="mb-3 fw-semibold">Distribution Channels</h5>
          <Row>
            {distributionChannels.map(channel => (
              <Col lg={2} md={4} sm={6} key={channel.id} className="mb-3">
                <Card
                  className="distribution-channel-card h-100 cursor-pointer"
                  onClick={() => setActiveTab(channel.id)}
                  style={{ borderColor: activeTab === channel.id ? channel.color : '' }}
                >
                  <Card.Body className="text-center p-3">
                    <channel.icon
                      size={32}
                      className="mb-2"
                      style={{ color: channel.color }}
                    />
                    <h6 className="mb-1">{channel.name}</h6>
                    <p className="text-muted small mb-2">{channel.description}</p>
                    {/* <Badge
                      bg="light"
                      text="dark"
                      className="small"
                    >
                      {survey?.distributionStats[channel.id] || 0} sent
                    </Badge> */}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Main Distribution Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        {/* QR Code Tab */}
        <Tab eventKey="qr" title={
          <span className="d-flex align-items-center">
            <MdQrCode className="me-2" />
            QR Codes
          </span>
        }>
          <Row>
            <Col lg={8}>
              <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <strong>QR Code Generator</strong>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowCustomizeModal(true)}
                    >
                      <MdSettings className="me-1" />
                      Customize
                    </Button>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => downloadQR('png')}
                    >
                      <MdDownload className="me-1" />
                      Download PNG
                    </Button>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={printQR}
                    >
                      <MdPrint className="me-1" />
                      Print
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div
                        id="qr-preview"
                        className="text-center p-4 rounded"
                      >
                        {qrSettings.includeTitle && <h5 className="mb-2">{survey.title}</h5>}
                        <p className="text-muted mb-3">{qrSettings.customText}</p>

                        <div
                          style={{
                            display: 'inline-block',
                            position: 'relative',
                            backgroundColor: '#1fdae4',
                            padding: '16px',
                            borderRadius: '12px'
                          }}
                        >
                          <QRCodeSVG
                            value={survey.url}
                            size={qrSettings.size}
                            bgColor="var(--primary-color)"
                            fgColor={qrSettings.foregroundColor}
                            level={qrSettings.errorCorrectionLevel}
                            includeMargin={false}
                            imageSettings={{
                              src: logo,
                              x: undefined,
                              y: undefined,
                              height: 60,
                              width: 60,
                              excavate: true,
                            }}
                          />
                        </div>
                        <p className="small text-muted mt-2">
                          Scan with your phone camera
                        </p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <h6 className="mb-3">Physical Location Suggestions</h6>
                      <Accordion>
                        {locationTypes.map(location => (
                          <Accordion.Item eventKey={location.id} key={location.id}>
                            <Accordion.Header>
                              <location.icon className="me-2" />
                              {location.name}
                            </Accordion.Header>
                            <Accordion.Body>
                              <div className="d-flex flex-wrap gap-2">
                                {location.suggestions.map(suggestion => (
                                  <Badge
                                    key={suggestion}
                                    bg="primary"
                                    className="cursor-pointer"
                                    onClick={() => {
                                      setQrSettings(prev => ({
                                        ...prev,
                                        customText: `Scan to share feedback about our ${suggestion.toLowerCase()}`
                                      }));
                                    }}
                                  >
                                    {suggestion}
                                  </Badge>
                                ))}
                              </div>
                            </Accordion.Body>
                          </Accordion.Item>
                        ))}
                      </Accordion>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="mb-4">
                <Card.Header><strong>QR Code Formats</strong></Card.Header>
                <Card.Body>
                  <div className="d-grid gap-2">
                    <Button
                      variant="outline-primary"
                      onClick={() => downloadQR('png')}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span>PNG Image</span>
                      <MdDownload />
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={() => downloadQR('jpg')}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span>JPEG Image</span>
                      <MdDownload />
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={() => downloadQR('svg')}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span>SVG Vector</span>
                      <MdDownload />
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={printQR}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span>Print Ready</span>
                      <MdPrint />
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header><strong>Quick Actions</strong></Card.Header>
                <Card.Body>
                  <div className="d-grid gap-2">
                    <Button
                      variant="primary"
                      onClick={() => copyLink(survey.url)}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span>Copy Survey Link</span>
                      <MdContentCopy />
                    </Button>
                    <Button
                      variant="info"
                      onClick={() => window.open(survey.url, '_blank')}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span>Preview Survey</span>
                      <MdVisibility />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Direct Links Tab */}
        <Tab eventKey="link" title={
          <span className="d-flex align-items-center">
            <MdLink className="me-2" />
            Direct Links
          </span>
        }>
          <Card>
            <Card.Header><strong>Survey Links</strong></Card.Header>
            <Card.Body>
              <Row>
                <Col lg={8}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Full Survey URL</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        value={survey.url}
                        readOnly
                      />
                      <Button
                        variant="outline-primary"
                        onClick={() => copyLink(survey.url)}
                      >
                        <MdContentCopy />
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  {/* <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Short URL</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        value={survey.shortUrl}
                        readOnly
                      />
                      <Button
                        variant="outline-success"
                        onClick={() => copyLink(survey.shortUrl)}
                      >
                        <MdContentCopy />
                      </Button>
                    </InputGroup>
                  </Form.Group> */}

                  <Alert variant="info" className="d-flex align-items-start">
                    <FaLightbulb className="me-2 mt-1" />
                    <div>
                      <strong>Pro Tips:</strong>
                      <ul className="mb-0 mt-1">
                        <li>Use short URLs for SMS and social media</li>
                        <li>Full URLs work better for email campaigns</li>
                        <li>Add UTM parameters for tracking sources</li>
                      </ul>
                    </div>
                  </Alert>
                </Col>

                <Col lg={4}>
                  <Card className="bg-light">
                    <Card.Header className="bg-transparent">
                      <strong>Link Statistics</strong>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Total Clicks:</span>
                        <strong>1,247</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Unique Visitors:</span>
                        <strong>892</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Conversion Rate:</span>
                        <strong>67%</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Avg. Time:</span>
                        <strong>3:24</strong>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        {/* Email Campaign Tab */}
        <Tab eventKey="email" title={
          <span className="d-flex align-items-center">
            <MdEmail className="me-2" />
            Email Campaign
          </span>
        }>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Email Campaign Setup</strong>
              <Button
                variant="primary"
                onClick={() => setShowEmailModal(true)}
                className="d-flex align-items-center"
              >
                <MdEmail className="me-2" />
                Create Campaign
              </Button>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col lg={6}>
                  <h6 className="mb-3">Email Templates</h6>
                  <ListGroup>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Customer Feedback Request</strong>
                        <p className="text-muted small mb-0">Professional template for customer surveys</p>
                      </div>
                      <Button variant="outline-primary" size="sm">Use Template</Button>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Employee Engagement</strong>
                        <p className="text-muted small mb-0">Internal survey template for employees</p>
                      </div>
                      <Button variant="outline-primary" size="sm">Use Template</Button>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Event Feedback</strong>
                        <p className="text-muted small mb-0">Post-event survey invitation</p>
                      </div>
                      <Button variant="outline-primary" size="sm">Use Template</Button>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>

                <Col lg={6}>
                  <h6 className="mb-3">Campaign History</h6>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Recipients</th>
                        <th>Sent</th>
                        <th>Opened</th>
                        <th>Clicked</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Oct 1, 2025</td>
                        <td>250</td>
                        <td>248</td>
                        <td>176 (71%)</td>
                        <td>89 (36%)</td>
                      </tr>
                      <tr>
                        <td>Sep 28, 2025</td>
                        <td>180</td>
                        <td>180</td>
                        <td>125 (69%)</td>
                        <td>67 (37%)</td>
                      </tr>
                      <tr>
                        <td>Sep 25, 2025</td>
                        <td>320</td>
                        <td>318</td>
                        <td>234 (74%)</td>
                        <td>112 (35%)</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        {/* SMS/WhatsApp Tab */}
        <Tab eventKey="sms" title={
          <span className="d-flex align-items-center">
            <FaWhatsapp className="me-2" />
            SMS/WhatsApp
          </span>
        }>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Mobile Messaging Campaign</strong>
              <Button
                variant="success"
                onClick={() => setShowSMSModal(true)}
                className="d-flex align-items-center"
              >
                <MdSms className="me-2" />
                Send SMS Campaign
              </Button>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col lg={6}>
                  <h6 className="mb-3">Message Templates</h6>
                  <Card className="mb-3 border">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong>Customer Feedback SMS</strong>
                        <Badge bg="success">160 chars</Badge>
                      </div>
                      <p className="text-muted small mb-2">
                        "Hi! We hope you enjoyed your recent visit. Please share your feedback: [SURVEY_LINK]. Takes 2 minutes. Thank you!"
                      </p>
                      <Button variant="outline-primary" size="sm">Use Template</Button>
                    </Card.Body>
                  </Card>

                  <Card className="mb-3 border">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong>WhatsApp Survey</strong>
                        <Badge bg="success">140 chars</Badge>
                      </div>
                      <p className="text-muted small mb-2">
                        "🙏 Help us improve! Share your experience: [SURVEY_LINK] Quick 2-min survey. Your feedback matters!"
                      </p>
                      <Button variant="outline-success" size="sm">Use Template</Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={6}>
                  <h6 className="mb-3">Messaging Platforms</h6>
                  <Row>
                    <Col sm={6} className="mb-3">
                      <Card className="text-center p-3 border">
                        <MdSms size={32} className="text-primary mb-2" />
                        <h6>SMS</h6>
                        <p className="text-muted small mb-2">Direct text messages</p>
                        <Button variant="outline-primary" size="sm">Configure</Button>
                      </Card>
                    </Col>
                    <Col sm={6} className="mb-3">
                      <Card className="text-center p-3 border">
                        <FaWhatsapp size={32} className="text-success mb-2" />
                        <h6>WhatsApp</h6>
                        <p className="text-muted small mb-2">WhatsApp Business</p>
                        <Button variant="outline-success" size="sm">Configure</Button>
                      </Card>
                    </Col>
                  </Row>

                  <Alert variant="warning" className="small">
                    <strong>Note:</strong> Ensure you have proper consent before sending marketing messages.
                    Follow local regulations (GDPR, CCPA) for message marketing.
                  </Alert>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        {/* Social Media Tab */}
        <Tab eventKey="social" title={
          <span className="d-flex align-items-center">
            <MdShare className="me-2" />
            Social Media
          </span>
        }>
          <Card>
            <Card.Header><strong>Social Media Distribution</strong></Card.Header>
            <Card.Body>
              <Row>
                <Col lg={8}>
                  <h6 className="mb-3">Share on Social Platforms</h6>
                  <Row>
                    {[
                      { platform: 'facebook', name: 'Facebook', icon: FaFacebook, color: '#1877f2' },
                      { platform: 'twitter', name: 'Twitter', icon: FaTwitter, color: '#1da1f2' },
                      { platform: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, color: '#0077b5' },
                      { platform: 'whatsapp', name: 'WhatsApp', icon: FaWhatsapp, color: '#25d366' },
                      { platform: 'telegram', name: 'Telegram', icon: FaTelegram, color: '#0088cc' },
                      { platform: 'instagram', name: 'Instagram', icon: FaInstagram, color: '#e1306c' }
                    ].map(social => (
                      <Col md={4} sm={6} key={social.platform} className="mb-3">
                        <Card
                          className="social-share-card text-center cursor-pointer h-100"
                          onClick={() => shareOnSocial(social.platform)}
                        >
                          <Card.Body className="p-3">
                            <social.icon
                              size={32}
                              className="mb-2"
                              style={{ color: social.color }}
                            />
                            <h6 className="mb-1">{social.name}</h6>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              style={{ borderColor: social.color, color: social.color }}
                            >
                              Share Survey
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Col>

                <Col lg={4}>
                  <Card className="bg-light">
                    <Card.Header className="bg-transparent">
                      <strong>Social Sharing Tips</strong>
                    </Card.Header>
                    <Card.Body>
                      <ul className="small mb-0">
                        <li>Use engaging visuals with your survey link</li>
                        <li>Add relevant hashtags to increase reach</li>
                        <li>Post during peak engagement hours</li>
                        <li>Consider offering incentives for participation</li>
                        <li>Tag relevant accounts or locations</li>
                        <li>Use Stories for temporary campaigns</li>
                      </ul>
                    </Card.Body>
                  </Card>

                  <Card className="mt-3">
                    <Card.Header><strong>Social Stats</strong></Card.Header>
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Facebook Shares:</span>
                        <strong>24</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Twitter Clicks:</span>
                        <strong>18</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>LinkedIn Views:</span>
                        <strong>35</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>WhatsApp Forwards:</span>
                        <strong>12</strong>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        {/* Website Embed Tab */}
        <Tab eventKey="embed" title={
          <span className="d-flex align-items-center">
            <MdWeb className="me-2" />
            Website Embed
          </span>
        }>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Website Integration</strong>
              <Button
                variant="info"
                onClick={() => alert('Embed modal coming soon!')}
                className="d-flex align-items-center"
              >
                <MdCode className="me-2" />
                Get Embed Code
              </Button>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col lg={6}>
                  <h6 className="mb-3">Embed Options</h6>

                  <Card className="mb-3 border">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>iFrame Embed</strong>
                        <Badge bg="primary">Recommended</Badge>
                      </div>
                      <p className="text-muted small mb-2">
                        Full survey embedded in your webpage with responsive design
                      </p>
                      <Button variant="outline-primary" size="sm">Get Code</Button>
                    </Card.Body>
                  </Card>

                  <Card className="mb-3 border">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Modal Popup</strong>
                        <Badge bg="success">High Engagement</Badge>
                      </div>
                      <p className="text-muted small mb-2">
                        Survey opens in a modal overlay when user clicks a button
                      </p>
                      <Button variant="outline-success" size="sm">Get Code</Button>
                    </Card.Body>
                  </Card>

                  <Card className="mb-3 border">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Floating Widget</strong>
                        <Badge bg="info">Non-intrusive</Badge>
                      </div>
                      <p className="text-muted small mb-2">
                        Small floating button that expands to show survey
                      </p>
                      <Button variant="outline-info" size="sm">Get Code</Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={6}>
                  <h6 className="mb-3">Integration Preview</h6>
                  <div className="embed-preview p-3 border rounded bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-white border rounded">
                      <span className="small">🌐 yourwebsite.com</span>
                      <div className="d-flex gap-1">
                        <div className="rounded-circle bg-danger" style={{ width: '8px', height: '8px' }}></div>
                        <div className="rounded-circle bg-warning" style={{ width: '8px', height: '8px' }}></div>
                        <div className="rounded-circle bg-success" style={{ width: '8px', height: '8px' }}></div>
                      </div>
                    </div>

                    <div className="p-3 bg-white border rounded">
                      <h6>Your Website Content</h6>
                      <p className="text-muted small mb-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

                      <div className="p-3 border rounded">
                        <div className="text-center">
                          <h6 className="text-primary">{survey.title}</h6>
                          <p className="small text-muted">{survey.description}</p>
                          <Button size="sm" variant="primary">Start Survey</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Email Campaign Modal */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Email Campaign</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Email Subject</Form.Label>
            <Form.Control
              type="text"
              value={emailSettings.subject}
              onChange={(e) => setEmailSettings({ ...emailSettings, subject: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Message Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={emailSettings.message}
              onChange={(e) => setEmailSettings({ ...emailSettings, message: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Recipients (comma-separated emails)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={emailSettings.recipients}
              onChange={(e) => setEmailSettings({ ...emailSettings, recipients: e.target.value })}
              placeholder="email1@example.com, email2@example.com, ..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={sendEmailCampaign}>
            Send Campaign
          </Button>
        </Modal.Footer>
      </Modal>

      {/* SMS Campaign Modal */}
      <Modal show={showSMSModal} onHide={() => setShowSMSModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Send SMS Campaign</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>SMS Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={smsSettings.message}
              onChange={(e) => setSmsSettings({ ...smsSettings, message: e.target.value })}
              maxLength={160}
            />
            <Form.Text className="text-muted">
              {smsSettings.message.length}/160 characters
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Recipients (comma-separated phone numbers)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={smsSettings.recipients}
              onChange={(e) => setSmsSettings({ ...smsSettings, recipients: e.target.value })}
              placeholder="+1234567890, +0987654321, ..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSMSModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={sendSMSCampaign}>
            Send SMS Campaign
          </Button>
        </Modal.Footer>
      </Modal>

      {/* QR Customize Modal */}
      <Modal show={showCustomizeModal} onHide={() => setShowCustomizeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Customize QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Size</Form.Label>
                <Form.Range
                  min="128"
                  max="512"
                  value={qrSettings.size}
                  onChange={(e) => setQrSettings({ ...qrSettings, size: parseInt(e.target.value) })}
                />
                <Form.Text>{qrSettings.size}px</Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Custom Text</Form.Label>
                <Form.Control
                  type="text"
                  value={qrSettings.customText}
                  onChange={(e) => setQrSettings({ ...qrSettings, customText: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Background Color</Form.Label>
                <Form.Control
                  type="color"
                  value={qrSettings.backgroundColor}
                  onChange={(e) => setQrSettings({ ...qrSettings, backgroundColor: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Foreground Color</Form.Label>
                <Form.Control
                  type="color"
                  value={qrSettings.foregroundColor}
                  onChange={(e) => setQrSettings({ ...qrSettings, foregroundColor: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="text-center mt-3">
            <QRCodeSVG
              value={survey.url}
              size={128}
              bgColor={qrSettings.backgroundColor}
              fgColor={qrSettings.foregroundColor}
              level={qrSettings.errorCorrectionLevel}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCustomizeModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowCustomizeModal(false)}>
            Apply Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SurveyDistribution;