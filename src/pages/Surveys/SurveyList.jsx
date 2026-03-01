// rateProAdmin/src/pages/Surveys/SurveyList.jsx
"use client"
import { useState, useEffect } from "react"
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdFileDownload,
  MdFileUpload,
  MdSearch,
  MdAssignment,
  MdSort,
  MdArrowDropUp,
  MdArrowDropDown,
  MdErrorOutline,
  MdBarChart,
  MdToggleOn,
  MdToggleOff,
  MdShare,
  MdVisibility,
  MdFeedback,
  MdLock,
  MdArchive
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
import axiosInstance from "../../api/axiosInstance.js"
import Swal from "sweetalert2"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"


const SurveyList = ({ darkMode }) => {
  const navigate = useNavigate();
  const { setGlobalLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [sortField, setSortField] = useState("-createdAt")
  const [surveys, setSurveys] = useState([])

  const handleEdit = (surveyId) => {
    navigate(`/app/surveys/builder/edit/${surveyId}`);
  };

  const handleAnalytics = (surveyId) => {
    navigate(`/app/surveys/${surveyId}/analytics`);
  };

  const handleDistribution = (surveyId) => {
    navigate(`/app/surveys/${surveyId}/distribution`);
  };

  const handleDelete = (survey) => {
    setSelectedSurvey(survey)
    setShowDeleteModal(true)
  }

  const handleViewSurvey = (id) => {
    navigate(`/app/surveys/detail/${id}`);
  };

  const handleFeedback = (id) => {
    navigate(`/app/surveys/responses/${id}`);
  };

  // Fetch surveys with filters and pagination
  const fetchSurveys = async () => {
    try {
      setLoading(true);
      setError(null);
      setGlobalLoading(true);

      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sort: sortField,
      });

      // ✅ Add tenant only if user is NOT admin
      if (user?.role !== "admin" && user?.tenant) {
        params.append("tenant", user.tenant);
      }

      // Optional: if user is not admin and has no tenant, show error
      if (user?.role !== "admin" && !user?.tenant) {
        setError("No tenant associated with your account");
        setLoading(false);
        setGlobalLoading(false);
        return;
      }

      if (searchTerm) params.append("search", searchTerm);
      if (filterStatus !== "all") params.append("status", filterStatus);

      const response = await axiosInstance.get(`/surveys?${params}`);
      console.log("Fetched surveys:", response.data);
      setSurveys(response.data.surveys);
      setTotalItems(response.data.total);
    } catch (err) {
      console.error("Error fetching surveys:", err);
      const errorMessage =
        err.response?.status === 403
          ? "You do not have permission to view these surveys. Please contact your administrator."
          : err.response?.data?.message || "Failed to load surveys";

      setError(errorMessage);

      Swal.fire({
        icon: "error",
        title: "Error Loading Surveys",
        text: errorMessage,
        confirmButtonColor: "#dc3545",
        showConfirmButton: err.response?.status !== 403,
      });
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  // Activate/Deactivate survey (using new permission-based endpoints)
  const toggleStatus = async (surveyId, currentStatus) => {
    try {
      setGlobalLoading(true);
      const isActive = currentStatus.toLowerCase() === 'active';
      const endpoint = isActive ? 'deactivate' : 'activate';
      const newStatus = isActive ? 'inactive' : 'active';

      await axiosInstance.put(`/surveys/${surveyId}/${endpoint}`);

      // Re-fetch to get updated allowedActions from backend
      await fetchSurveys();

      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Survey is now ${newStatus}`,
        confirmButtonColor: '#198754',
        timer: 1500
      });
    } catch (err) {
      console.error('Error toggling status:', err);
      const errorMessage = err.response?.status === 403
        ? 'You do not have permission to perform this action'
        : err.response?.data?.message || 'Failed to update survey status';
      Swal.fire({
        icon: 'error',
        title: 'Status Update Failed',
        text: errorMessage,
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setGlobalLoading(false);
    }
  };

  // Close survey (permanently stops collection)
  const closeSurvey = async (surveyId) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Close Survey?',
      text: 'This will permanently stop collecting responses. This cannot be undone — you will not be able to reactivate the survey.',
      showCancelButton: true,
      confirmButtonText: 'Yes, Close It',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    });

    if (!result.isConfirmed) return;

    try {
      setGlobalLoading(true);
      await axiosInstance.put(`/surveys/${surveyId}/close`);
      await fetchSurveys();

      Swal.fire({
        icon: 'success',
        title: 'Survey Closed',
        text: 'The survey has been closed and will no longer accept responses',
        confirmButtonColor: '#198754',
        timer: 1500
      });
    } catch (err) {
      console.error('Error closing survey:', err);
      Swal.fire({
        icon: 'error',
        title: 'Close Failed',
        text: err.response?.data?.message || 'Failed to close survey',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setGlobalLoading(false);
    }
  };

  // Archive survey (terminal read-only state)
  const archiveSurvey = async (surveyId) => {
    const result = await Swal.fire({
      icon: 'info',
      title: 'Archive Survey?',
      text: 'This will move the survey to the archive. It will be read-only and preserved for historical purposes.',
      showCancelButton: true,
      confirmButtonText: 'Yes, Archive It',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'var(--primary-color)',
      cancelButtonColor: '#6c757d'
    });

    if (!result.isConfirmed) return;

    try {
      setGlobalLoading(true);
      await axiosInstance.put(`/surveys/${surveyId}/archive`);
      await fetchSurveys();

      Swal.fire({
        icon: 'success',
        title: 'Survey Archived',
        text: 'The survey has been archived successfully',
        confirmButtonColor: '#198754',
        timer: 1500
      });
    } catch (err) {
      console.error('Error archiving survey:', err);
      Swal.fire({
        icon: 'error',
        title: 'Archive Failed',
        text: err.response?.data?.message || 'Failed to archive survey',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setGlobalLoading(false);
    }
  };

  // Delete survey
  const confirmDelete = async () => {
    try {
      setGlobalLoading(true);
      await axiosInstance.delete(`/surveys/${selectedSurvey._id}`);

      // Update local state
      setSurveys(surveys.filter(s => s._id !== selectedSurvey._id));
      setShowDeleteModal(false);
      setSelectedSurvey(null);

      Swal.fire({
        icon: 'success',
        title: 'Survey Deleted',
        text: 'The survey has been successfully deleted',
        confirmButtonColor: '#198754',
        timer: 1500
      });
    } catch (err) {
      console.error('Error deleting survey:', err);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: err.response?.status === 403
          ? 'You do not have permission to delete this survey'
          : err.response?.data?.message || 'Failed to delete survey',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setGlobalLoading(false);
    }
  };

  // Effect to fetch surveys when filters/pagination change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSurveys();
    }, searchTerm ? 500 : 0); // Debounce search

    return () => clearTimeout(debounceTimer);
  }, [currentPage, itemsPerPage, searchTerm, filterStatus, sortField]);

  const getSortIcon = (field) => {
    if (sortField === field) return MdArrowDropUp;
    if (sortField === `-${field}`) return MdArrowDropDown;
    return MdSort;
  };

  // Status badge styling based on survey status
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-[var(--success-light)] text-[var(--success-color)]',
      draft: 'bg-[var(--warning-light)] text-[var(--warning-color)]',
      inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
      scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      closed: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      archived: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    };
    return styles[status?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header Section */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] flex items-center gap-2">
              <MdAssignment />
              Surveys
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Create and manage your feedback surveys</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] flex items-center gap-2"
              onClick={() => {
                Swal.fire({
                  title: 'Import Survey',
                  html: `
                    <input type="file" accept=".json" class="form-control" id="surveyImport">
                  `,
                  showCancelButton: true,
                  confirmButtonText: 'Import',
                  confirmButtonColor: 'var(--primary-color)',
                  cancelButtonColor: '#6c757d'
                });
              }}
            >
              <MdFileUpload />
              Import
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2"
              onClick={() => navigate("/app/surveys/create")}
            >
              <MdAdd />
              Create Survey
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-5">
            <div className="flex items-center">
              <span className="px-3 py-2 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-r-0 border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-l-md text-[var(--light-text)] dark:text-[var(--dark-text)]">
                <MdSearch />
              </span>
              <input
                type="text"
                className="flex-1 px-3 py-2 rounded-r-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                placeholder="Search surveys by title, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="lg:col-span-3">
            <select
              className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Surveys</option>
              <option value="draft">Draft Surveys</option>
              <option value="inactive">Inactive Surveys</option>
              <option value="scheduled">Scheduled Surveys</option>
              <option value="closed">Closed Surveys</option>
              <option value="archived">Archived Surveys</option>
            </select>
          </div>
          <div className="lg:col-span-4">
            <div className="flex gap-2">
              <button type="button" className="flex-1 px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] flex items-center justify-center gap-2">
                <MdSearch />
                Advanced Filters
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] flex items-center gap-2"
                onClick={() => {
                  Swal.fire({
                    title: 'Export Surveys',
                    text: 'Choose export format',
                    icon: 'info',
                    showDenyButton: true,
                    confirmButtonText: 'Export as PDF',
                    denyButtonText: 'Export as Excel',
                    confirmButtonColor: 'var(--primary-color)',
                    denyButtonColor: '#198754'
                  });
                }}
              >
                <MdFileDownload />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Survey Table */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="p-6">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MdErrorOutline size={48} className="text-[var(--danger-color)] mb-4" />
              <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] mb-4">{error}</p>
              <button
                type="button"
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2"
                onClick={fetchSurveys}
              >
                <MdErrorOutline />
                Try Again
              </button>
            </div>
          ) : surveys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MdAssignment size={64} className="text-[var(--text-secondary)] mb-4" />
              <h5 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">No surveys found</h5>
              <p className="text-[var(--text-secondary)] mb-4">Create your first survey to get started</p>
              <button
                type="button"
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2"
                onClick={() => navigate("/app/surveys/create")}
              >
                <MdAdd />
                Create Your First Survey
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                  <tr>
                    <th
                      onClick={() =>
                        setSortField(sortField === "title" ? "-title" : "title")
                      }
                      className="px-4 py-3 text-left font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] cursor-pointer hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] transition-colors"
                    >
                      <span className="flex items-center">
                        Title
                        {(() => {
                          const Icon = getSortIcon("title");
                          return <Icon className="ml-2" />;
                        })()}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Description</th>
                    <th
                      onClick={() =>
                        setSortField(sortField === "status" ? "-status" : "status")
                      }
                      className="px-4 py-3 text-left font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] cursor-pointer hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] transition-colors"
                    >
                      <span className="flex items-center">
                        Status
                        {(() => {
                          const Icon = getSortIcon("status");
                          return <Icon className="ml-2" />;
                        })()}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Responses</th>
                    <th
                      onClick={() =>
                        setSortField(
                          sortField === "createdAt" ? "-createdAt" : "createdAt"
                        )
                      }
                      className="px-4 py-3 text-left font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] cursor-pointer hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] transition-colors"
                    >
                      <span className="flex items-center">
                        Created At
                        {(() => {
                          const Icon = getSortIcon("createdAt");
                          return <Icon className="ml-2" />;
                        })()}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.length > 0 ? (
                    surveys.map((survey) => {
                      const actions = survey.allowedActions || {};
                      return (
                        <tr key={survey._id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] transition-colors">
                          <td className="px-4 py-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{survey.title}</td>
                          <td className="px-4 py-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                            <span className="line-clamp-1">{survey.description}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusBadge(survey.status)}`}>
                              {survey.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]">
                              {survey.totalResponses || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                            {new Date(survey.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end items-center gap-1">

                              {/* Activate / Deactivate Toggle */}
                              {(actions.activate || actions.deactivate) && user?.role !== "admin" && (
                                <button
                                  type="button"
                                  className={`p-2 rounded-md transition-colors ${actions.deactivate
                                      ? "text-[var(--success-color)] hover:bg-[var(--success-light)]"
                                      : "text-[var(--text-secondary)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]"
                                    }`}
                                  onClick={() => toggleStatus(survey._id, survey.status)}
                                  title={actions.deactivate ? "Deactivate Survey" : "Activate Survey"}
                                >
                                  {actions.deactivate ? (
                                    <MdToggleOn size={20} />
                                  ) : (
                                    <MdToggleOff size={20} />
                                  )}
                                </button>
                              )}

                              {/* Edit — only for draft/scheduled */}
                              {actions.edit && user?.role !== "admin" && (
                                <button
                                  type="button"
                                  className="p-2 rounded-md transition-colors text-[var(--primary-color)] hover:bg-[var(--primary-light)]"
                                  onClick={() => handleEdit(survey._id)}
                                  title="Edit Survey"
                                >
                                  <MdEdit size={20} />
                                </button>
                              )}

                              {/* Analytics — only if responses > 0 */}
                              {actions.analytics && (
                                <button
                                  type="button"
                                  className="p-2 rounded-md transition-colors text-[var(--info-color)] hover:bg-[var(--info-light)]"
                                  onClick={() => handleAnalytics(survey._id)}
                                  title="View Analytics"
                                >
                                  <MdBarChart size={20} />
                                </button>
                              )}

                              {/* Distribution — only for active */}
                              {actions.distribution && (
                                <button
                                  type="button"
                                  className="p-2 rounded-md transition-colors text-[var(--primary-color)] hover:bg-[var(--primary-light)]"
                                  onClick={() => handleDistribution(survey._id)}
                                  title="Distribution & QR Codes"
                                >
                                  <MdShare size={20} />
                                </button>
                              )}

                              {/* Close — only for active surveys */}
                              {actions.close && user?.role !== "admin" && (
                                <button
                                  type="button"
                                  className="p-2 rounded-md transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={() => closeSurvey(survey._id)}
                                  title="Close Survey (permanently stop collection)"
                                >
                                  <MdLock size={20} />
                                </button>
                              )}

                              {/* Archive — only for closed surveys */}
                              {actions.archive && user?.role !== "admin" && (
                                <button
                                  type="button"
                                  className="p-2 rounded-md transition-colors text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                  onClick={() => archiveSurvey(survey._id)}
                                  title="Archive Survey"
                                >
                                  <MdArchive size={20} />
                                </button>
                              )}

                              {/* Delete — only for draft/inactive/scheduled with 0 responses */}
                              {actions.delete && user?.role !== "admin" && (
                                <button
                                  type="button"
                                  className="p-2 rounded-md transition-colors text-[var(--danger-color)] hover:bg-[var(--danger-light)]"
                                  onClick={() => handleDelete(survey)}
                                  title="Delete Survey"
                                >
                                  <MdDelete size={20} />
                                </button>
                              )}

                              {/* View Survey — always visible */}
                              <button
                                type="button"
                                className="p-2 rounded-md transition-colors text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]"
                                onClick={() => handleViewSurvey(survey._id)}
                                title="View Survey Details"
                              >
                                <MdVisibility size={20} />
                              </button>

                              {/* Feedback — only if responses > 0 */}
                              {actions.feedback && (
                                <button
                                  type="button"
                                  className="p-2 rounded-md transition-colors text-[var(--warning-color)] hover:bg-[var(--warning-light)]"
                                  onClick={() => handleFeedback(survey._id)}
                                  title="View Survey Feedback"
                                >
                                  <MdFeedback size={20} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-12">
                        <div className="flex flex-col items-center justify-center text-center">
                          <MdAssignment size={64} className="text-[var(--text-secondary)] mb-4" />
                          <h5 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">No surveys found</h5>
                          <p className="text-[var(--text-secondary)] mb-4">
                            Create your first survey to get started
                          </p>
                          <button
                            type="button"
                            className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2"
                            onClick={() => navigate("/app/surveys/create")}
                          >
                            <MdAdd />
                            Create Survey
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <Pagination
              current={currentPage}
              total={totalItems}
              limit={itemsPerPage}
              onChange={(page) => setCurrentPage(page)}
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDeleteModal(false)} />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg p-6 max-w-md w-full mx-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] flex items-center gap-2">
                  <MdDelete className="text-[var(--danger-color)]" />
                  Confirm Delete
                </h5>
                <button
                  type="button"
                  className="p-1 rounded-md transition-colors hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] text-[var(--light-text)] dark:text-[var(--dark-text)]"
                  onClick={() => setShowDeleteModal(false)}
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="mb-4">
                {(selectedSurvey?.totalResponses > 0) ? (
                  <>
                    <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] mb-3">
                      The survey "<strong>{selectedSurvey?.title}</strong>" has <strong>{selectedSurvey?.totalResponses}</strong> response(s) and cannot be deleted.
                    </p>
                    <div className="bg-[var(--info-light)] border-l-4 border-[var(--info-color)] p-3 rounded">
                      <p className="text-sm text-[var(--info-color)] flex items-center gap-2">
                        <MdArchive />
                        Consider archiving this survey instead to preserve its data.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] mb-3">
                      Are you sure you want to delete the survey "<strong>{selectedSurvey?.title}</strong>"?
                    </p>
                    <div className="bg-[var(--warning-light)] border-l-4 border-[var(--warning-color)] p-3 rounded">
                      <p className="text-sm text-[var(--warning-color)] flex items-center gap-2">
                        <MdErrorOutline />
                        This action cannot be undone.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                {!(selectedSurvey?.totalResponses > 0) && (
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--danger-color)] text-white hover:opacity-90 flex items-center gap-2"
                    onClick={confirmDelete}
                  >
                    <MdDelete />
                    Delete Survey
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SurveyList;