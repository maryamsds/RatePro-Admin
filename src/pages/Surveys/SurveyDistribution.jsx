import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
import logo from '../../images/qr_logo.png';
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
      <div className="w-full flex justify-center items-center" style={{ minHeight: '400px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="w-full">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-md">
          Survey not found. Please check the survey ID and try again.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              <MdShare className="mr-2 text-[var(--primary-color)]" size={32} />
              <h1 className="text-xl font-bold mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Survey Distribution</h1>
            </div>
            <p className="text-[var(--text-secondary)] mb-2">
              Distribute "{survey.title}" across multiple channels
            </p>

            {/* Survey Stats */}
            <div className="flex gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-[var(--primary-light)] text-[var(--primary-color)]">
                <FaEye className="mr-1" size={12} />
                {survey.responseCount} Responses
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${survey.isActive ? 'bg-[var(--success-light)] text-[var(--success-color)]' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                {survey.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="flex items-center px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-card)] dark:hover:bg-[var(--dark-card)]"
              onClick={() => navigate(`/app/surveys/detail/${id}`)}
            >
              <MdVisibility className="mr-2" />
              View Survey
            </button>
            <button
              className="flex items-center px-4 py-2 rounded-md font-medium transition-colors border border-[var(--info-color)] text-[var(--info-color)] hover:bg-[var(--info-color)] hover:text-white"
              onClick={() => navigate(`/app/surveys/${id}/analytics`)}
            >
              <MdAnalytics className="mr-2" />
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Distribution Channels Overview */}
      <div className="mb-6">
        <h5 className="mb-3 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Distribution Channels</h5>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {distributionChannels.map(channel => (
            <div
              key={channel.id}
              className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] p-4 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setActiveTab(channel.id)}
              style={{ borderColor: activeTab === channel.id ? channel.color : undefined }}
            >
              <div className="text-center">
                <channel.icon
                  size={32}
                  className="mb-2 mx-auto"
                  style={{ color: channel.color }}
                />
                <h6 className="mb-1 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{channel.name}</h6>
                <p className="text-xs text-[var(--text-secondary)]">{channel.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Distribution Tab Navigation */}
      <div className="flex gap-2 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] mb-4">
        {[
          { key: 'qr', icon: <MdQrCode className="mr-2" />, label: 'QR Codes' },
          { key: 'link', icon: <MdLink className="mr-2" />, label: 'Direct Links' },
          { key: 'email', icon: <MdEmail className="mr-2" />, label: 'Email Campaign' },
          { key: 'sms', icon: <FaWhatsapp className="mr-2" />, label: 'SMS/WhatsApp' },
          { key: 'social', icon: <MdShare className="mr-2" />, label: 'Social Media' },
          { key: 'embed', icon: <MdWeb className="mr-2" />, label: 'Website Embed' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`flex items-center px-4 py-3 border-b-2 transition-colors ${activeTab === tab.key
              ? 'border-[var(--primary-color)] text-[var(--primary-color)] font-medium'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--primary-color)]'
              }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* QR Code Tab */}
      {activeTab === 'qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="mb-4 bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="flex justify-between items-center p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">QR Code Generator</strong>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white" onClick={() => setShowCustomizeModal(true)}>
                    <MdSettings className="mr-1 inline" /> Customize
                  </button>
                  <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--success-color)] text-[var(--success-color)] hover:bg-[var(--success-color)] hover:text-white" onClick={() => downloadQR('png')}>
                    <MdDownload className="mr-1 inline" /> Download PNG
                  </button>
                  <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--info-color)] text-[var(--info-color)] hover:bg-[var(--info-color)] hover:text-white" onClick={printQR}>
                    <MdPrint className="mr-1 inline" /> Print
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div id="qr-preview" className="text-center p-4 rounded-md">
                      {qrSettings.includeTitle && <h5 className="mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">{survey.title}</h5>}
                      <p className="text-[var(--text-secondary)] mb-3">{qrSettings.customText}</p>
                      <div style={{ display: 'inline-block', position: 'relative', backgroundColor: '#1fdae4', padding: '16px', borderRadius: '12px' }}>
                        <QRCodeSVG
                          value={survey.url}
                          size={qrSettings.size}
                          bgColor="var(--primary-color)"
                          fgColor={qrSettings.foregroundColor}
                          level={qrSettings.errorCorrectionLevel}
                          includeMargin={false}
                          imageSettings={{ src: logo, x: undefined, y: undefined, height: 60, width: 60, excavate: true }}
                        />
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mt-2">Scan with your phone camera</p>
                    </div>
                  </div>
                  <div>
                    <h6 className="mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Physical Location Suggestions</h6>
                    {locationTypes.map(location => (
                      <details key={location.id} className="mb-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
                        <summary className="flex items-center gap-2 p-3 cursor-pointer hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          <location.icon className="mr-2" />
                          {location.name}
                        </summary>
                        <div className="p-3 pt-0">
                          <div className="flex flex-wrap gap-2">
                            {location.suggestions.map(suggestion => (
                              <span
                                key={suggestion}
                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-[var(--primary-light)] text-[var(--primary-color)] cursor-pointer hover:opacity-80"
                                onClick={() => {
                                  setQrSettings(prev => ({
                                    ...prev,
                                    customText: `Scan to share feedback about our ${suggestion.toLowerCase()}`
                                  }));
                                }}
                              >
                                {suggestion}
                              </span>
                            ))}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="mb-4 bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]"><strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">QR Code Formats</strong></div>
              <div className="p-6">
                <div className="grid gap-2">
                  <button className="w-full flex justify-between items-center px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white" onClick={() => downloadQR('png')}>
                    <span>PNG Image</span> <MdDownload />
                  </button>
                  <button className="w-full flex justify-between items-center px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white" onClick={() => downloadQR('jpg')}>
                    <span>JPEG Image</span> <MdDownload />
                  </button>
                  <button className="w-full flex justify-between items-center px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white" onClick={() => downloadQR('svg')}>
                    <span>SVG Vector</span> <MdDownload />
                  </button>
                  <button className="w-full flex justify-between items-center px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]" onClick={printQR}>
                    <span>Print Ready</span> <MdPrint />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]"><strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Quick Actions</strong></div>
              <div className="p-6">
                <div className="grid gap-2">
                  <button className="w-full flex justify-between items-center px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]" onClick={() => copyLink(survey.url)}>
                    <span>Copy Survey Link</span> <MdContentCopy />
                  </button>
                  <button className="w-full flex justify-between items-center px-4 py-2 rounded-md font-medium transition-colors border border-[var(--info-color)] text-[var(--info-color)] hover:bg-[var(--info-color)] hover:text-white" onClick={() => window.open(survey.url, '_blank')}>
                    <span>Preview Survey</span> <MdVisibility />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Links Tab */}
      {activeTab === 'link' && (
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]"><strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Survey Links</strong></div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <div className="mb-3">
                  <label className="block mb-1 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Full Survey URL</label>
                  <div className="flex">
                    <input type="text" value={survey.url} readOnly className="flex-1 px-3 py-2 rounded-l-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30" />
                    <button className="px-4 py-2 rounded-r-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white" onClick={() => copyLink(survey.url)}>
                      <MdContentCopy />
                    </button>
                  </div>
                </div>

                {/* Commented out short URL section preserved */}

                <div className="p-4 bg-[var(--info-light)] border border-[var(--info-color)]/30 rounded-md flex items-start">
                  <FaLightbulb className="mr-2 mt-1 text-[var(--info-color)]" />
                  <div>
                    <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Pro Tips:</strong>
                    <ul className="mb-0 mt-1 ml-4 list-disc text-[var(--text-secondary)]">
                      <li>Use short URLs for SMS and social media</li>
                      <li>Full URLs work better for email campaigns</li>
                      <li>Add UTM parameters for tracking sources</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]"><strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Link Statistics</strong></div>
                  <div className="p-6">
                    <div className="flex justify-between mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]"><span>Total Clicks:</span><strong>1,247</strong></div>
                    <div className="flex justify-between mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]"><span>Unique Visitors:</span><strong>892</strong></div>
                    <div className="flex justify-between mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]"><span>Conversion Rate:</span><strong>67%</strong></div>
                    <div className="flex justify-between text-[var(--light-text)] dark:text-[var(--dark-text)]"><span>Avg. Time:</span><strong>3:24</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Campaign Tab */}
      {activeTab === 'email' && (
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex justify-between items-center p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Email Campaign Setup</strong>
            <button className="flex items-center px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]" onClick={() => setShowEmailModal(true)}>
              <MdEmail className="mr-2" /> Create Campaign
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h6 className="mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Email Templates</h6>
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md divide-y divide-[var(--light-border)] dark:divide-[var(--dark-border)]">
                  <div className="flex justify-between items-center p-4">
                    <div>
                      <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Customer Feedback Request</strong>
                      <p className="text-[var(--text-secondary)] text-sm mb-0">Professional template for customer surveys</p>
                    </div>
                    <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white">Use Template</button>
                  </div>
                  <div className="flex justify-between items-center p-4">
                    <div>
                      <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Employee Engagement</strong>
                      <p className="text-[var(--text-secondary)] text-sm mb-0">Internal survey template for employees</p>
                    </div>
                    <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white">Use Template</button>
                  </div>
                  <div className="flex justify-between items-center p-4">
                    <div>
                      <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Event Feedback</strong>
                      <p className="text-[var(--text-secondary)] text-sm mb-0">Post-event survey invitation</p>
                    </div>
                    <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white">Use Template</button>
                  </div>
                </div>
              </div>

              <div>
                <h6 className="mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Campaign History</h6>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <th className="text-left p-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Date</th>
                        <th className="text-left p-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Recipients</th>
                        <th className="text-left p-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Sent</th>
                        <th className="text-left p-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Opened</th>
                        <th className="text-left p-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Clicked</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <td className="p-2 text-[var(--text-secondary)]">Oct 1, 2025</td><td className="p-2 text-[var(--text-secondary)]">250</td><td className="p-2 text-[var(--text-secondary)]">248</td><td className="p-2 text-[var(--text-secondary)]">176 (71%)</td><td className="p-2 text-[var(--text-secondary)]">89 (36%)</td>
                      </tr>
                      <tr className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <td className="p-2 text-[var(--text-secondary)]">Sep 28, 2025</td><td className="p-2 text-[var(--text-secondary)]">180</td><td className="p-2 text-[var(--text-secondary)]">180</td><td className="p-2 text-[var(--text-secondary)]">125 (69%)</td><td className="p-2 text-[var(--text-secondary)]">67 (37%)</td>
                      </tr>
                      <tr className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <td className="p-2 text-[var(--text-secondary)]">Sep 25, 2025</td><td className="p-2 text-[var(--text-secondary)]">320</td><td className="p-2 text-[var(--text-secondary)]">318</td><td className="p-2 text-[var(--text-secondary)]">234 (74%)</td><td className="p-2 text-[var(--text-secondary)]">112 (35%)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMS/WhatsApp Tab */}
      {activeTab === 'sms' && (
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex justify-between items-center p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Mobile Messaging Campaign</strong>
            <button className="flex items-center px-4 py-2 rounded-md font-medium transition-colors border border-[var(--success-color)] text-[var(--success-color)] hover:bg-[var(--success-color)] hover:text-white" onClick={() => setShowSMSModal(true)}>
              <MdSms className="mr-2" /> Send SMS Campaign
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h6 className="mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Message Templates</h6>
                <div className="mb-3 bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Customer Feedback SMS</strong>
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-[var(--success-light)] text-[var(--success-color)]">160 chars</span>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm mb-2">
                      "Hi! We hope you enjoyed your recent visit. Please share your feedback: [SURVEY_LINK]. Takes 2 minutes. Thank you!"
                    </p>
                    <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white">Use Template</button>
                  </div>
                </div>

                <div className="mb-3 bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">WhatsApp Survey</strong>
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-[var(--success-light)] text-[var(--success-color)]">140 chars</span>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm mb-2">
                      "🙏 Help us improve! Share your experience: [SURVEY_LINK] Quick 2-min survey. Your feedback matters!"
                    </p>
                    <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--success-color)] text-[var(--success-color)] hover:bg-[var(--success-color)] hover:text-white">Use Template</button>
                  </div>
                </div>
              </div>

              <div>
                <h6 className="mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Messaging Platforms</h6>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md">
                    <MdSms size={32} className="text-[var(--primary-color)] mb-2 mx-auto" />
                    <h6 className="text-[var(--light-text)] dark:text-[var(--dark-text)]">SMS</h6>
                    <p className="text-[var(--text-secondary)] text-sm mb-2">Direct text messages</p>
                    <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white">Configure</button>
                  </div>
                  <div className="text-center p-4 bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md">
                    <FaWhatsapp size={32} className="mb-2 mx-auto" style={{ color: '#25d366' }} />
                    <h6 className="text-[var(--light-text)] dark:text-[var(--dark-text)]">WhatsApp</h6>
                    <p className="text-[var(--text-secondary)] text-sm mb-2">WhatsApp Business</p>
                    <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--success-color)] text-[var(--success-color)] hover:bg-[var(--success-color)] hover:text-white">Configure</button>
                  </div>
                </div>

                <div className="mt-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Ensure you have proper consent before sending marketing messages.
                  Follow local regulations (GDPR, CCPA) for message marketing.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]"><strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Social Media Distribution</strong></div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <h6 className="mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Share on Social Platforms</h6>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { platform: 'facebook', name: 'Facebook', icon: FaFacebook, color: '#1877f2' },
                    { platform: 'twitter', name: 'Twitter', icon: FaTwitter, color: '#1da1f2' },
                    { platform: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, color: '#0077b5' },
                    { platform: 'whatsapp', name: 'WhatsApp', icon: FaWhatsapp, color: '#25d366' },
                    { platform: 'telegram', name: 'Telegram', icon: FaTelegram, color: '#0088cc' },
                    { platform: 'instagram', name: 'Instagram', icon: FaInstagram, color: '#e1306c' }
                  ].map(social => (
                    <div
                      key={social.platform}
                      className="text-center cursor-pointer bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md p-4 hover:shadow-lg transition-all"
                      onClick={() => shareOnSocial(social.platform)}
                    >
                      <social.icon size={32} className="mb-2 mx-auto" style={{ color: social.color }} />
                      <h6 className="mb-1 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{social.name}</h6>
                      <button
                        className="px-4 py-2 rounded-md font-medium transition-colors border text-sm"
                        style={{ borderColor: social.color, color: social.color }}
                      >
                        Share Survey
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]"><strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Social Sharing Tips</strong></div>
                  <div className="p-6">
                    <ul className="text-sm mb-0 ml-4 list-disc text-[var(--text-secondary)]">
                      <li>Use engaging visuals with your survey link</li>
                      <li>Add relevant hashtags to increase reach</li>
                      <li>Post during peak engagement hours</li>
                      <li>Consider offering incentives for participation</li>
                      <li>Tag relevant accounts or locations</li>
                      <li>Use Stories for temporary campaigns</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-3 bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]"><strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Social Stats</strong></div>
                  <div className="p-6">
                    <div className="flex justify-between mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]"><span>Facebook Shares:</span><strong>24</strong></div>
                    <div className="flex justify-between mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]"><span>Twitter Clicks:</span><strong>18</strong></div>
                    <div className="flex justify-between mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]"><span>LinkedIn Views:</span><strong>35</strong></div>
                    <div className="flex justify-between text-[var(--light-text)] dark:text-[var(--dark-text)]"><span>WhatsApp Forwards:</span><strong>12</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Website Embed Tab */}
      {activeTab === 'embed' && (
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex justify-between items-center p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Website Integration</strong>
            <button className="flex items-center px-4 py-2 rounded-md font-medium transition-colors border border-[var(--info-color)] text-[var(--info-color)] hover:bg-[var(--info-color)] hover:text-white" onClick={() => alert('Embed modal coming soon!')}>
              <MdCode className="mr-2" /> Get Embed Code
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h6 className="mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Embed Options</h6>

                <div className="mb-3 bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">iFrame Embed</strong>
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-[var(--primary-light)] text-[var(--primary-color)]">Recommended</span>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm mb-2">Full survey embedded in your webpage with responsive design</p>
                    <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white">Get Code</button>
                  </div>
                </div>

                <div className="mb-3 bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Modal Popup</strong>
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-[var(--success-light)] text-[var(--success-color)]">High Engagement</span>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm mb-2">Survey opens in a modal overlay when user clicks a button</p>
                    <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--success-color)] text-[var(--success-color)] hover:bg-[var(--success-color)] hover:text-white">Get Code</button>
                  </div>
                </div>

                <div className="mb-3 bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Floating Widget</strong>
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-[var(--info-light)] text-[var(--info-color)]">Non-intrusive</span>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm mb-2">Small floating button that expands to show survey</p>
                    <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--info-color)] text-[var(--info-color)] hover:bg-[var(--info-color)] hover:text-white">Get Code</button>
                  </div>
                </div>
              </div>

              <div>
                <h6 className="mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Integration Preview</h6>
                <div className="p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                  <div className="flex justify-between items-center mb-3 p-2 bg-white dark:bg-gray-800 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md">
                    <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">🌐 yourwebsite.com</span>
                    <div className="flex gap-1">
                      <div className="rounded-full bg-red-500" style={{ width: '8px', height: '8px' }}></div>
                      <div className="rounded-full bg-yellow-500" style={{ width: '8px', height: '8px' }}></div>
                      <div className="rounded-full bg-green-500" style={{ width: '8px', height: '8px' }}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md">
                    <h6 className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Your Website Content</h6>
                    <p className="text-[var(--text-secondary)] text-sm mb-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    <div className="p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md">
                      <div className="text-center">
                        <h6 className="text-[var(--primary-color)]">{survey.title}</h6>
                        <p className="text-sm text-[var(--text-secondary)]">{survey.description}</p>
                        <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]">Start Survey</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Campaign Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowEmailModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Create Email Campaign</h5>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl" onClick={() => setShowEmailModal(false)}>&times;</button>
            </div>
            <div className="p-6">
              <div className="mb-3">
                <label className="block mb-1 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Email Subject</label>
                <input type="text" value={emailSettings.subject} onChange={(e) => setEmailSettings({ ...emailSettings, subject: e.target.value })} className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30" />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Message Content</label>
                <textarea rows={4} value={emailSettings.message} onChange={(e) => setEmailSettings({ ...emailSettings, message: e.target.value })} className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30" />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Recipients (comma-separated emails)</label>
                <textarea rows={3} value={emailSettings.recipients} onChange={(e) => setEmailSettings({ ...emailSettings, recipients: e.target.value })} placeholder="email1@example.com, email2@example.com, ..." className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => setShowEmailModal(false)}>Cancel</button>
              <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]" onClick={sendEmailCampaign}>Send Campaign</button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Campaign Modal */}
      {showSMSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowSMSModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Send SMS Campaign</h5>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl" onClick={() => setShowSMSModal(false)}>&times;</button>
            </div>
            <div className="p-6">
              <div className="mb-3">
                <label className="block mb-1 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">SMS Message</label>
                <textarea rows={3} value={smsSettings.message} onChange={(e) => setSmsSettings({ ...smsSettings, message: e.target.value })} maxLength={160} className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30" />
                <span className="text-sm text-[var(--text-secondary)]">{smsSettings.message.length}/160 characters</span>
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Recipients (comma-separated phone numbers)</label>
                <textarea rows={3} value={smsSettings.recipients} onChange={(e) => setSmsSettings({ ...smsSettings, recipients: e.target.value })} placeholder="+1234567890, +0987654321, ..." className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => setShowSMSModal(false)}>Cancel</button>
              <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--success-color)] text-[var(--success-color)] hover:bg-[var(--success-color)] hover:text-white" onClick={sendSMSCampaign}>Send SMS Campaign</button>
            </div>
          </div>
        </div>
      )}

      {/* QR Customize Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCustomizeModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Customize QR Code</h5>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl" onClick={() => setShowCustomizeModal(false)}>&times;</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-3">
                    <label className="block mb-1 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Size</label>
                    <input type="range" min="128" max="512" value={qrSettings.size} onChange={(e) => setQrSettings({ ...qrSettings, size: parseInt(e.target.value) })} className="w-full" />
                    <span className="text-sm text-[var(--text-secondary)]">{qrSettings.size}px</span>
                  </div>
                  <div className="mb-3">
                    <label className="block mb-1 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Custom Text</label>
                    <input type="text" value={qrSettings.customText} onChange={(e) => setQrSettings({ ...qrSettings, customText: e.target.value })} className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30" />
                  </div>
                </div>
                <div>
                  <div className="mb-3">
                    <label className="block mb-1 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Background Color</label>
                    <input type="color" value={qrSettings.backgroundColor} onChange={(e) => setQrSettings({ ...qrSettings, backgroundColor: e.target.value })} className="w-full h-10 p-1 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]" />
                  </div>
                  <div className="mb-3">
                    <label className="block mb-1 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Foreground Color</label>
                    <input type="color" value={qrSettings.foregroundColor} onChange={(e) => setQrSettings({ ...qrSettings, foregroundColor: e.target.value })} className="w-full h-10 p-1 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]" />
                  </div>
                </div>
              </div>

              <div className="text-center mt-3">
                <QRCodeSVG
                  value={survey.url}
                  size={128}
                  bgColor={qrSettings.backgroundColor}
                  fgColor={qrSettings.foregroundColor}
                  level={qrSettings.errorCorrectionLevel}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => setShowCustomizeModal(false)}>Cancel</button>
              <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]" onClick={() => setShowCustomizeModal(false)}>Apply Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyDistribution;