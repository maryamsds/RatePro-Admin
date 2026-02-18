// src\pages\Surveys\SurveyDetail.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      // API returns { survey: {...} } - extract the survey object
      const surveyData = response.data.survey || response.data;
      console.log('Fetched survey:', surveyData);
      setSurvey(surveyData);
      setError('');
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
      // Handle different response shapes: { stats: {...} } or direct stats object
      const statsData = response.data?.stats || response.data || {};
      console.log('Stats Response:', statsData);
      setStats(prev => ({ ...prev, ...statsData }));
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Keep default stats on error
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
    const colorMap = {
      active: 'bg-[var(--success-color)]',
      completed: 'bg-[var(--primary-color)]',
      draft: 'bg-[var(--text-secondary)]',
      paused: 'bg-[var(--warning-color)]'
    };
    return <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-white ${colorMap[status] || 'bg-[var(--text-secondary)]'}`}>{status?.toUpperCase()}</span>;
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
      <div className="w-full py-4 px-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div>
            <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-[var(--text-secondary)]">Loading survey details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-4 px-4">
        <div className="bg-[var(--danger-light)] border border-[var(--danger-color)] rounded-md p-6">
          <div className="text-center">
            <MdFlag className="inline mr-2 text-[var(--danger-color)]" size={24} />
            <span className="text-[var(--danger-color)]">{error}</span>
            <div className="mt-3">
              <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--danger-color)] text-[var(--danger-color)] hover:bg-[var(--danger-color)] hover:text-white" onClick={() => navigate('/app/surveys')}>
                Back to Surveys
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 px-4">
      {/* Header Section */}
      <div className="mb-4">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <button
                  className="text-[var(--primary-color)] hover:underline bg-transparent border-none cursor-pointer"
                  onClick={() => navigate('/app/surveys')}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Surveys
                </button>
              </div>

              <div className="flex items-center mb-2">
                {survey?.logo && (
                  <img
                    src={survey.logo.url}
                    alt="Survey Logo"
                    className="w-[50px] h-[50px] object-cover rounded-md mr-3"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">{survey?.title}</h1>
                  <p className="text-[var(--text-secondary)] mb-0 max-w-[70%]">{survey?.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                {getStatusBadge(survey?.status)}
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  <MdLanguage className="mr-1" />
                  {survey?.language === 'both' ? 'Bilingual' : survey?.language?.toUpperCase()}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  <MdPeople className="mr-1" />
                  {survey?.questions?.length || 0} Questions
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  <FaUsers className="mr-1" />
                  {stats?.totalResponses} Responses
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Edit button - only shown for draft surveys */}
              {survey.status === 'draft' && (
                <button
                  title="Edit Survey"
                  className="p-2 rounded-md transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white"
                  onClick={() => navigate(`/app/surveys/builder/edit/${id}`)}
                >
                  <MdEdit />
                </button>
              )}

              {survey.status !== "inactive" && survey.status !== "draft" && (
                <button
                  title="Share Survey"
                  className="p-2 rounded-md transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white"
                  onClick={() => navigate(`/app/surveys/${id}/distribution`)}
                >
                  <MdShare />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
              <FaEye size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                {survey?.totalResponses ?? stats?.totalResponses ?? '—'}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">Total Responses</div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-3">
              <FaStar size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                {survey?.averageRating != null && survey?.averageRating > 0
                  ? survey.averageRating.toFixed(1)
                  : (stats?.avgRating != null && stats?.avgRating > 0
                    ? stats.avgRating.toFixed(1)
                    : '—')}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">Average Rating</div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 mr-3">
              <MdTrendingUp size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                {survey?.averageScore != null && survey?.averageScore > 0
                  ? survey.averageScore.toFixed(1)
                  : (stats?.completionRate != null && stats?.completionRate > 0
                    ? `${stats.completionRate}%`
                    : '—')}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">Average Score</div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-3">
              <FaChartLine size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                {stats?.npsScore != null && stats?.npsScore !== 0
                  ? stats.npsScore
                  : '—'}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">NPS Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          {/* Tab Navigation */}
          <div className="flex border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
            {[
              { key: 'overview', icon: <MdVisibility className="mr-2" />, label: 'Overview' },
              { key: 'settings', icon: <MdSettings className="mr-2" />, label: 'Settings' },
              { key: 'analytics', icon: <MdAnalytics className="mr-2" />, label: 'Analytics' },
            ].map(tab => (
              <button
                key={tab.key}
                className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-b-2 border-[var(--primary-color)] text-[var(--primary-color)]'
                    : 'border-b-2 border-transparent text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)]'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8">
                    <div className="mb-4 bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <div className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Survey Questions</strong>
                      </div>
                      <div className="p-4">
                        {survey?.questions && survey.questions.length > 0 ? (
                          <div className="space-y-4">
                            {survey?.questions?.map((question, index) => (
                              <div key={question._id || index} className="mb-4 p-3 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md">
                                <div className="flex items-start">
                                  <span className="text-[var(--primary-color)] font-bold mr-3">{index + 1}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                      <i className={`${getQuestionIcon(question.type)} mr-2 text-[var(--primary-color)]`}></i>
                                      <h6 className="mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)] font-medium">{question.questionText || question.title || question.label || "Untitled Question"}</h6>
                                      {question.required && (
                                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-white bg-[var(--danger-color)]">Required</span>
                                      )}
                                    </div>
                                    {question.description && (
                                      <p className="text-[var(--text-secondary)] text-sm mb-2">{question.description}</p>
                                    )}
                                    {question.options && question.options.length > 0 && (
                                      <div>
                                        <small className="text-[var(--text-secondary)]">Options:</small>
                                        <ul className="list-none ml-3 mb-0">
                                          {question.options.map((option, optIndex) => (
                                            <li key={optIndex} className="text-sm text-[var(--text-secondary)]">
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
                            <i className="fas fa-question-circle text-[var(--text-secondary)] mb-3" style={{fontSize: '3rem'}}></i>
                            <p className="text-[var(--text-secondary)]">No questions added yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4">
                    <div className="mb-4 bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <div className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Survey Details</strong>
                      </div>
                      <div className="p-4">
                        <div className="mb-3 flex justify-between items-center">
                          <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Created:</strong>
                          <span className="ml-2 text-[var(--text-secondary)]">{new Date(survey?.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mb-3 flex justify-between items-center">
                          <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Last Updated:</strong>
                          <span className="ml-2 text-[var(--text-secondary)]">{new Date(survey?.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mb-3 flex justify-between items-center">
                          <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Theme Color:</strong>
                          <div className="flex items-center">
                            <span
                              className="ml-2 inline-block w-5 h-5 rounded border border-[var(--light-border)] dark:border-[var(--dark-border)]"
                              style={{
                                backgroundColor: survey?.themeColor
                              }}
                            ></span>
                            <span className="ml-2 text-[var(--text-secondary)]">{survey?.themeColor}</span>
                          </div>
                        </div>
                        {survey?.settings && (
                          <>
                            <div className="mb-3 flex items-center justify-between">
                              <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Access:</strong>
                              <div className="ml-2 flex flex-wrap gap-1">
                                {survey?.settings.requireLogin && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-white bg-[var(--warning-color)]">Login Required</span>
                                )}
                                {survey?.settings.isPasswordProtected && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-white bg-[var(--danger-color)]">Password Protected</span>
                                )}
                                {survey?.settings.isAnonymous && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-white bg-[var(--success-color)]">Anonymous Allowed</span>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <div className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Quick Actions</strong>
                      </div>
                      <div className="p-4">
                        <div className="space-y-2">
                          <button
                            className="w-full px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white"
                            onClick={() => navigate(`/app/surveys/${id}/responses`)}
                          >
                            <MdAnalytics className="mr-2 inline" />
                            View Responses
                          </button>
                          <button
                            className="w-full px-4 py-2 rounded-md font-medium transition-colors border border-[var(--success-color)] text-[var(--success-color)] hover:bg-[var(--success-color)] hover:text-white"
                            onClick={() => navigate(`/app/surveys/${id}/analytics`)}
                          >
                            <MdTrendingUp className="mr-2 inline" />
                            View Analytics
                          </button>
                          <button
                            className="w-full px-4 py-2 rounded-md font-medium transition-colors border border-[var(--warning-color)] text-[var(--warning-color)] hover:bg-[var(--warning-color)] hover:text-white"
                            onClick={() => navigate(`/app/surveys/${id}/distribution`)}
                          >
                            <MdShare className="mr-2 inline" />
                            Distribution & QR
                          </button>
                          <button
                            className="w-full px-4 py-2 rounded-md font-medium transition-colors border border-[var(--info-color)] text-[var(--info-color)] hover:bg-[var(--info-color)] hover:text-white"
                            onClick={handleCopyLink}
                          >
                            <MdContentCopy className="mr-2 inline" />
                            Copy Survey Link
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8">
                    <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <div className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Survey Configuration</strong>
                      </div>
                      <div className="p-4">
                        <form>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="mb-3">
                                <label className="block mb-1 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Survey Status</label>
                                <div className="flex items-center">
                                  {getStatusBadge(survey?.status)}
                                  <button
                                    type="button"
                                    className="ml-2 px-3 py-1 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white"
                                    onClick={handleToggleStatus}
                                  >
                                    {survey?.status === 'active' ? 'Deactivate' : 'Activate'}
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="mb-3">
                                <label className="block mb-1 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Language</label>
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                    <MdLanguage className="mr-1" />
                                    {survey?.language === 'both' ? 'Bilingual' : survey?.language?.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <hr className="my-4 border-[var(--light-border)] dark:border-[var(--dark-border)]" />

                          <h6 className="mb-3 text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Access Settings</h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="mb-3">
                                <label className="flex items-center gap-2 cursor-default text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                  <input
                                    type="checkbox"
                                    checked={survey?.settings?.allowAnonymous || false}
                                    disabled
                                    className="w-4 h-4"
                                  />
                                  <span>Allow anonymous responses</span>
                                </label>
                              </div>
                              <div className="mb-3">
                                <label className="flex items-center gap-2 cursor-default text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                  <input
                                    type="checkbox"
                                    checked={survey?.settings?.requireLogin || false}
                                    disabled
                                    className="w-4 h-4"
                                  />
                                  <span>Require login to participate</span>
                                </label>
                              </div>
                            </div>
                            <div>
                              <div className="mb-3">
                                <label className="flex items-center gap-2 cursor-default text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                  <input
                                    type="checkbox"
                                    checked={survey?.settings?.multipleResponses || false}
                                    disabled
                                    className="w-4 h-4"
                                  />
                                  <span>Allow multiple responses per user</span>
                                </label>
                              </div>
                              <div className="mb-3">
                                <label className="flex items-center gap-2 cursor-default text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                  <input
                                    type="checkbox"
                                    checked={survey?.settings?.isPasswordProtected || false}
                                    disabled
                                    className="w-4 h-4"
                                  />
                                  <span>Password protected</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="text-[var(--text-secondary)]">
                            <small>
                              <i className="fas fa-info-circle mr-1"></i>
                              To modify settings, use the Edit Survey button
                            </small>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4">
                    <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <div className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Survey Theme</strong>
                      </div>
                      <div className="p-4 text-center">
                        {survey?.logo && (
                          <div className="mb-3">
                            <img
                              src={survey?.logo.url}
                              alt="Survey Logo"
                              className="max-w-[150px] max-h-[150px] object-cover rounded-md mx-auto"
                            />
                          </div>
                        )}
                        <div className="mb-3">
                          <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Theme Color:</strong>
                          <div
                            className="w-[60px] h-[60px] rounded-md border-2 border-[var(--light-border)] dark:border-[var(--dark-border)] mx-auto mt-2"
                            style={{
                              backgroundColor: survey?.themeColor
                            }}
                          ></div>
                          <small className="text-[var(--text-secondary)] block mt-1">{survey?.themeColor}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <div className="p-4 text-center">
                      <h5 className="text-xl font-bold mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Response Rate</h5>
                      <div className="relative">
                        <div className="w-full h-5 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
                          <div className="h-full bg-[var(--success-color)] rounded-full" style={{ width: `${stats?.responseRate || 0}%` }}></div>
                        </div>
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          {stats?.responseRate}%
                        </span>
                      </div>
                      <small className="text-[var(--text-secondary)]">
                        {stats?.totalResponses} responses collected
                      </small>
                    </div>
                  </div>

                  <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <div className="p-4 text-center">
                      <h5 className="text-xl font-bold mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Completion Rate</h5>
                      <div className="relative">
                        <div className="w-full h-5 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
                          <div className="h-full bg-[var(--info-color)] rounded-full" style={{ width: `${stats?.completionRate || 0}%` }}></div>
                        </div>
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          {stats?.completionRate}%
                        </span>
                      </div>
                      <small className="text-[var(--text-secondary)]">
                        Average completion rate
                      </small>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <div className="p-4 text-center py-12">
                      <MdAnalytics size={64} className="text-[var(--text-secondary)] mb-3 mx-auto" />
                      <h5 className="text-xl font-bold mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Detailed Analytics</h5>
                      <p className="text-[var(--text-secondary)] mb-3">
                        View comprehensive analytics including charts, trends, and insights
                      </p>
                      <button
                        className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]"
                        onClick={() => navigate(`/app/surveys/${id}/analytics`)}
                      >
                        <MdTrendingUp className="mr-2 inline" />
                        View Full Analytics
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowQRModal(false)}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="mb-0 flex items-center text-[var(--light-text)] dark:text-[var(--dark-text)] text-xl font-bold"><MdQrCode className="mr-2" /> Survey QR Code</h5>
              <button className="p-2 rounded-md transition-colors hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] text-[var(--text-secondary)]" onClick={() => setShowQRModal(false)}>&times;</button>
            </div>
            <div className="p-4 text-center">
              <div className="mb-3">
                <QRCodeSVG
                  value={`${window.location.origin}/survey/${survey?.shareableLink || id || ""}`}
                  size={256}
                  level="H"
                  includeMargin={true}
                  bgColor="var(--bs-primary)"
                  fgColor="var(--bs-dark)"
                  imageSettings={{
                    src: "/images/logo.png",
                    x: undefined,
                    y: undefined,
                    height: 50,
                    width: 50,
                    excavate: true,
                  }}
                />
              </div>
              <p className="text-[var(--text-secondary)]">
                Scan this QR code to access the survey directly
              </p>
              <div className="space-y-2">
                <button
                  className="w-full px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white"
                  onClick={() => {
                    const canvas = document.querySelector('#qr-code canvas');
                    const link = document.createElement('a');
                    link.download = `${survey?.title}_qr.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                  }}
                >
                  <MdDownload className="mr-2 inline" />
                  Download QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowShareModal(false)}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="mb-0 flex items-center text-[var(--light-text)] dark:text-[var(--dark-text)] text-xl font-bold"><MdShare className="mr-2" /> Share Survey</h5>
              <button className="p-2 rounded-md transition-colors hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] text-[var(--text-secondary)]" onClick={() => setShowShareModal(false)}>&times;</button>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <label className="block mb-1 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Survey Link</label>
                <div className="flex">
                  <input
                    type="text"
                    value={`${window.location.origin}/survey/${survey?.shareableLink || id}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)]"
                  />
                  <button
                    className="ml-2 px-3 py-2 rounded-md transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white"
                    onClick={handleCopyLink}
                  >
                    <MdContentCopy />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-[var(--success-color)] text-white hover:bg-[var(--success-hover)]"
                  onClick={() => {
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Please take our survey: ${window.location.origin}/survey/${survey?.shareableLink || id}`)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  <i className="fab fa-whatsapp mr-2"></i>
                  Share via WhatsApp
                </button>

                <button
                  className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]"
                  onClick={() => {
                    const emailSubject = encodeURIComponent(`Survey: ${survey.title}`);
                    const emailBody = encodeURIComponent(`Please take our survey: ${window.location.origin}/survey/${survey?.shareableLink || id}`);
                    window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
                  }}
                >
                  <i className="fas fa-envelope mr-2"></i>
                  Share via Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDeleteModal(false)}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="mb-0 text-[var(--danger-color)] flex items-center text-xl font-bold"><MdDelete className="mr-2" /> Confirm Delete</h5>
              <button className="p-2 rounded-md transition-colors hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] text-[var(--text-secondary)]" onClick={() => setShowDeleteModal(false)}>&times;</button>
            </div>
            <div className="p-4">
              <div className="p-3 bg-[var(--warning-light)] border border-[var(--warning-color)] rounded-md">
                <i className="fas fa-exclamation-triangle mr-2 text-[var(--warning-color)]"></i>
                <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  Are you sure you want to delete "<strong>{survey?.title}</strong>"?
                  This action cannot be undone and will permanently delete all survey data and responses.
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 pt-0">
              <button className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--danger-color)] text-white hover:bg-[var(--danger-hover)] flex items-center" onClick={handleDelete}>
                <MdDelete className="mr-2" />
                Delete Survey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 p-3">
          <div className={`px-4 py-3 rounded-md shadow-lg text-white ${
            toastVariant === 'success' 
              ? 'bg-[var(--success-color)]' 
              : toastVariant === 'danger' 
                ? 'bg-[var(--danger-color)]' 
                : 'bg-[var(--primary-color)]'
          }`}>
            <div className="flex items-center justify-between">
              <span>{toastMessage}</span>
              <button className="ml-3 text-white/80 hover:text-white" onClick={() => setShowToast(false)}>&times;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyDetail;
