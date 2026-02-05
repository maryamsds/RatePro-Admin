// // rateProAdmin/src/pages/Surveys/SurveyList.jsx
// "use client"
// import { useState, useEffect } from "react"
// import { Container, Row, Col, Table, Button, Form, InputGroup, Modal, Spinner, Alert } from "react-bootstrap"
// import {
//   MdAdd,
//   MdEdit,
//   MdDelete,
//   MdFileDownload,
//   MdFileUpload,
//   MdSearch,
//   MdAssignment,
//   MdSort,
//   MdArrowDropUp,
//   MdArrowDropDown,
//   MdErrorOutline,
//   MdBarChart,
//   MdToggleOn,
//   MdToggleOff,
//   MdShare,
//   MdVisibility,
//   MdFeedback
// } from "react-icons/md"
// import Pagination from "../../components/Pagination/Pagination.jsx"
// import axiosInstance from "../../api/axiosInstance.js"
// import Swal from "sweetalert2"
// import { useAuth } from "../../context/AuthContext"
// import { useNavigate } from "react-router-dom"


// const SurveyList = ({ darkMode }) => {
//   const navigate = useNavigate();
//   const { setGlobalLoading, user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1)
//   const [itemsPerPage, setItemsPerPage] = useState(10)
//   const [totalItems, setTotalItems] = useState(0)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [filterStatus, setFilterStatus] = useState("all")
//   const [showDeleteModal, setShowDeleteModal] = useState(false)
//   const [selectedSurvey, setSelectedSurvey] = useState(null)
//   const [sortField, setSortField] = useState("-createdAt")
//   const [surveys, setSurveys] = useState([])

//   const handleEdit = (surveyId) => {
//     navigate(`/app/surveys/builder/edit/${surveyId}`);
//   };

//   const handleAnalytics = (surveyId) => {
//     navigate(`/app/surveys/${surveyId}/analytics`);
//   };

//   const handleDistribution = (surveyId) => {
//     navigate(`/app/surveys/${surveyId}/distribution`);
//   };

//   const handleDelete = (survey) => {
//     setSelectedSurvey(survey)
//     setShowDeleteModal(true)
//   }

//   const handleViewSurvey = (id) => {
//     navigate(`/app/surveys/detail/${id}`);
//   };

//   const handleFeedback = (id) => {
//     navigate(`/app/surveys/responses/${id}`);
//   };

//   // Fetch surveys with filters and pagination
//   const fetchSurveys = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       setGlobalLoading(true);

//       const params = new URLSearchParams({
//         page: currentPage,
//         limit: itemsPerPage,
//         sort: sortField,
//       });

//       // ✅ Add tenant only if user is NOT admin
//       if (user?.role !== "admin" && user?.tenant) {
//         params.append("tenant", user.tenant);
//       }

//       // Optional: if user is not admin and has no tenant, show error
//       if (user?.role !== "admin" && !user?.tenant) {
//         setError("No tenant associated with your account");
//         setLoading(false);
//         setGlobalLoading(false);
//         return;
//       }

//       if (searchTerm) params.append("search", searchTerm);
//       if (filterStatus !== "all") params.append("status", filterStatus);

//       const response = await axiosInstance.get(`/surveys?${params}`);
//       console.log("Fetched surveys:", response.data);
//       setSurveys(response.data.surveys);
//       setTotalItems(response.data.total);
//     } catch (err) {
//       console.error("Error fetching surveys:", err);
//       const errorMessage =
//         err.response?.status === 403
//           ? "You do not have permission to view these surveys. Please contact your administrator."
//           : err.response?.data?.message || "Failed to load surveys";

//       setError(errorMessage);

//       Swal.fire({
//         icon: "error",
//         title: "Error Loading Surveys",
//         text: errorMessage,
//         confirmButtonColor: "#dc3545",
//         showConfirmButton: err.response?.status !== 403,
//       });
//     } finally {
//       setLoading(false);
//       setGlobalLoading(false);
//     }
//   };

//   // Toggle survey status
//   const toggleStatus = async (surveyId, currentStatus) => {
//     try {
//       setGlobalLoading(true);
//       const newStatus = currentStatus.toLowerCase() === 'active' ? 'inactive' : 'active';

//       await axiosInstance.put(`/surveys/toggle/${surveyId}`, {
//         status: newStatus
//       });

//       // Optimistically update UI
//       setSurveys(surveys.map(s =>
//         s._id === surveyId
//           ? { ...s, status: newStatus }
//           : s
//       ));

//       Swal.fire({
//         icon: 'success',
//         title: 'Status Updated',
//         text: `Survey is now ${newStatus}`,
//         confirmButtonColor: '#198754',
//         timer: 1500
//       });
//     } catch (err) {
//       console.error('Error toggling status:', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Status Update Failed',
//         text: err.response?.data?.message || 'Failed to update survey status',
//         confirmButtonColor: '#dc3545'
//       });
//     } finally {
//       setGlobalLoading(false);
//     }
//   };

//   // Delete survey
//   const confirmDelete = async () => {
//     try {
//       setGlobalLoading(true);
//       await axiosInstance.delete(`/surveys/${selectedSurvey._id}`);

//       // Update local state
//       setSurveys(surveys.filter(s => s._id !== selectedSurvey._id));
//       setShowDeleteModal(false);
//       setSelectedSurvey(null);

//       Swal.fire({
//         icon: 'success',
//         title: 'Survey Deleted',
//         text: 'The survey has been successfully deleted',
//         confirmButtonColor: '#198754',
//         timer: 1500
//       });
//     } catch (err) {
//       console.error('Error deleting survey:', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Delete Failed',
//         text: err.response?.data?.message || 'Failed to delete survey',
//         confirmButtonColor: '#dc3545'
//       });
//     } finally {
//       setGlobalLoading(false);
//     }
//   };

//   // Effect to fetch surveys when filters/pagination change
//   useEffect(() => {
//     const debounceTimer = setTimeout(() => {
//       fetchSurveys();
//       console.log("Fetching surveys with params:", {
//         currentPage,
//         itemsPerPage,
//         searchTerm,
//         filterStatus,
//         sortField
//       });
//     }, searchTerm ? 500 : 0); // Debounce search

//     return () => clearTimeout(debounceTimer);
//   }, [currentPage, itemsPerPage, searchTerm, filterStatus, sortField]);

//   const getSortIcon = (field) => {
//     if (sortField === field) return MdArrowDropUp;
//     if (sortField === `-${field}`) return MdArrowDropDown;
//     return MdSort;
//   };

//   return (
//     <Container fluid className="survey-list-container">
//       {/* Header Section */}
//       <div className="survey-header-card">
//         <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
//           <div>
//             <h1 className="survey-header-title">
//               <MdAssignment />
//               Surveys
//             </h1>
//             <p className="survey-header-subtitle">Create and manage your feedback surveys</p>
//           </div>
//           <div className="d-flex gap-2 flex-wrap">
//             <Button
//               className="survey-btn-outline"
//               onClick={() => {
//                 Swal.fire({
//                   title: 'Import Survey',
//                   html: `
//                     <input type="file" accept=".json" class="form-control" id="surveyImport">
//                   `,
//                   showCancelButton: true,
//                   confirmButtonText: 'Import',
//                   confirmButtonColor: 'var(--primary-color)',
//                   cancelButtonColor: '#6c757d'
//                 });
//               }}
//             >
//               <MdFileUpload />
//               Import
//             </Button>
//             <Button
//               className="survey-btn-primary"
//               onClick={() => navigate("/app/surveys/create")}
//             >
//               <MdAdd />
//               Create Survey
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Filter Section */}
//       <div className="survey-filter-card">
//         <div className="card-body">
//           <Row className="g-3">
//             <Col lg={5}>
//               <InputGroup>
//                 <InputGroup.Text className="survey-search-icon">
//                   <MdSearch />
//                 </InputGroup.Text>
//                 <Form.Control
//                   type="text"
//                   placeholder="Search surveys by title, description..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="survey-search-input border-start-0"
//                 />
//               </InputGroup>
//             </Col>
//             <Col lg={3}>
//               <Form.Select
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//                 className="survey-select"
//               >
//                 <option value="all">All Statuses</option>
//                 <option value="active">Active Surveys</option>
//                 <option value="completed">Completed Surveys</option>
//                 <option value="draft">Draft Surveys</option>
//                 <option value="paused">Paused Surveys</option>
//               </Form.Select>
//             </Col>
//             <Col lg={4}>
//               <div className="d-flex gap-2">
//                 <Button className="survey-btn-outline flex-grow-1">
//                   <MdSearch />
//                   Advanced Filters
//                 </Button>
//                 <Button
//                   className="survey-btn-outline"
//                   onClick={() => {
//                     Swal.fire({
//                       title: 'Export Surveys',
//                       text: 'Choose export format',
//                       icon: 'info',
//                       showDenyButton: true,
//                       confirmButtonText: 'Export as PDF',
//                       denyButtonText: 'Export as Excel',
//                       confirmButtonColor: 'var(--primary-color)',
//                       denyButtonColor: '#198754'
//                     });
//                   }}
//                 >
//                   <MdFileDownload />
//                   Export
//                 </Button>
//               </div>
//             </Col>
//           </Row>
//         </div>
//       </div>

//       {/* Survey Table */}
//       <div className="survey-table-card">
//         <div className="card-body">
//           {error ? (
//             <div className="error-state">
//               <MdErrorOutline size={48} />
//               <p className="mb-3">{error}</p>
//               <Button
//                 className="survey-btn-primary"
//                 size="sm"
//                 onClick={fetchSurveys}
//               >
//                 <MdErrorOutline className="me-2" />
//                 Try Again
//               </Button>
//             </div>
//           ) : surveys.length === 0 ? (
//             <div className="empty-state">
//               <i className="fas fa-clipboard-list"></i>
//               <h5>No surveys found</h5>
//               <p>Create your first survey to get started</p>
//               <Button
//                 className="survey-btn-primary"
//                 onClick={() => navigate("/app/surveys/create")}
//               >
//                 <i className="fas fa-plus"></i>
//                 Create Your First Survey
//               </Button>
//             </div>
//           ) : (
//             <div className="table-responsive survey-table-responsive">
//               <Table className="survey-table">
//                 <thead>
//                   <tr>
//                     <th
//                       onClick={() =>
//                         setSortField(sortField === "title" ? "-title" : "title")
//                       }
//                       style={{ cursor: "pointer" }}
//                     >
//                       Title
//                       {(() => {
//                         const Icon = getSortIcon("title");
//                         return <Icon className="ms-2" />;
//                       })()}
//                     </th>
//                     <th>Description</th>
//                     <th
//                       onClick={() =>
//                         setSortField(sortField === "status" ? "-status" : "status")
//                       }
//                       style={{ cursor: "pointer" }}
//                     >
//                       Status
//                       {(() => {
//                         const Icon = getSortIcon("status");
//                         return <Icon className="ms-2" />;
//                       })()}
//                     </th>
//                     <th
//                       onClick={() =>
//                         setSortField(
//                           sortField === "createdAt" ? "-createdAt" : "createdAt"
//                         )
//                       }
//                       style={{ cursor: "pointer" }}
//                     >
//                       Created At
//                       {(() => {
//                         const Icon = getSortIcon("createdAt");
//                         return <Icon className="ms-2" />;
//                       })()}
//                     </th>
//                     <th className="text-end">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {surveys.length > 0 ? (
//                     surveys.map((survey) => (
//                       <tr key={survey._id}>
//                         <td>{survey.title}</td>
//                         <td>{survey.description}</td>
//                         <td>
//                           <span
//                             className={`status-badge ${survey.status.toLowerCase()}`}
//                           >
//                             {survey.status}
//                           </span>
//                         </td>
//                         <td>
//                           {new Date(survey.createdAt).toLocaleDateString("en-US", {
//                             year: "numeric",
//                             month: "short",
//                             day: "numeric",
//                           })}
//                         </td>
//                         <td className="text-end">
//                           <Button
//                             variant="link"
//                             className={`action-btn toggle me-2 ${survey.status.toLowerCase() === "active" ? "active" : "inactive"
//                               }`}
//                             onClick={() => toggleStatus(survey._id, survey.status)}
//                             title={`${survey.status === "active" ? "Deactivate" : "Activate"
//                               } Survey`}
//                           >
//                             {survey.status.toLowerCase() === "active" ? (
//                               <MdToggleOn size={20} />
//                             ) : (
//                               <MdToggleOff size={20} />
//                             )}
//                           </Button>

//                           {/* Edit Button — show only if NOT admin */}
//                           {user?.role !== "admin" && (
//                             <Button
//                               variant="link"
//                               className="action-btn edit me-2"
//                               onClick={() => handleEdit(survey._id)}
//                               title="Edit Survey"
//                             >
//                               <MdEdit size={20} />
//                             </Button>
//                           )}

//                           {/* Analytics */}
//                           {survey.status !== "draft" && (
//                           <Button
//                             variant="link"
//                             className="action-btn analytics me-2"
//                             onClick={() => handleAnalytics(survey._id)}
//                             title="View Analytics"
//                           >
//                             <MdBarChart size={20} />
//                           </Button>
//                           )}
//                           {/* Distribution */}
//                           {survey.status !== "inactive" && survey.status !== "draft" && (
//                           <Button
//                             variant="link"
//                             className="action-btn distribution me-2"
//                             onClick={() => handleDistribution(survey._id)}
//                             title="Distribution & QR Codes"
//                           >
//                             <MdShare size={20} />
//                           </Button>
//                           )}
//                           {/* Delete Button — show only if NOT admin */}
//                           {user?.role !== "admin" && (
//                             <Button
//                               variant="link"
//                               className="action-btn delete me-2"
//                               onClick={() => handleDelete(survey)}
//                               title="Delete Survey"
//                             >
//                               <MdDelete size={20} />
//                             </Button>
//                           )}

//                           {/* View Survey */}
//                           <Button
//                             variant="link"
//                             className="action-btn view me-2"
//                             onClick={() => handleViewSurvey(survey._id)}
//                             title="View Survey Details"
//                           >
//                             <MdVisibility size={20} />
//                           </Button>

//                           {/* Feedback */}
//                           {survey.status !== "draft" && (
//                           <Button
//                             variant="link"
//                             className="action-btn feedback"
//                             onClick={() => handleFeedback(survey._id)}
//                             title="View Survey Feedback"
//                           >
//                             <MdFeedback size={20} />
//                           </Button>
//                           )}
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="5">
//                         <div className="empty-state">
//                           <MdAssignment className="empty-state-icon" />
//                           <h5>No surveys found</h5>
//                           <p className="text-muted">
//                             Create your first survey to get started
//                           </p>
//                           <Button
//                             variant="primary"
//                             onClick={() => navigate("/surveys/create")}
//                             className="mt-3"
//                           >
//                             <MdAdd className="me-2" />
//                             Create Survey
//                           </Button>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </Table>
//             </div>
//           )}
//         </div>
//         <div className="survey-table-footer">
//           <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
//             <div className="d-flex align-items-center gap-3 w-100 justify-content-between">
//               <small className="pagination-info">
//                 Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{" "}
//                 {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} surveys
//               </small>
//               <Form.Select
//                 size="sm"
//                 value={itemsPerPage}
//                 onChange={(e) => {
//                   setItemsPerPage(Number(e.target.value));
//                   setCurrentPage(1);
//                 }}
//                 className="per-page-select"
//               >
//                 <option value="10">10 per page</option>
//                 <option value="25">25 per page</option>
//                 <option value="50">50 per page</option>
//                 <option value="100">100 per page</option>
//               </Form.Select>
//             </div>
//             <div>
//               <Pagination
//                 current={currentPage}
//                 total={totalItems}
//                 limit={itemsPerPage}
//                 onChange={(page) => setCurrentPage(page)}
//                 darkMode={darkMode}
//               />
//             </div>
//           </div>
//         </div>
//       </div>


//       {/* Delete Confirmation Modal */}
//       <Modal
//         show={showDeleteModal}
//         onHide={() => setShowDeleteModal(false)}
//         centered
//         className="survey-delete-modal"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             <i className="fas fa-exclamation-triangle me-2"></i>
//             Confirm Delete
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>Are you sure you want to delete the survey "<strong>{selectedSurvey?.title}</strong>"?</p>
//           <Alert variant="warning" className="mb-0">
//             <i className="fas fa-exclamation-circle me-2"></i>
//             This action cannot be undone. All survey responses and analytics will be permanently deleted.
//           </Alert>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="light"
//             onClick={() => setShowDeleteModal(false)}
//             className="px-4"
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="danger"
//             onClick={confirmDelete}
//             className="px-4"
//           >
//             <i className="fas fa-trash me-2"></i>
//             Delete Survey
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   )
// }

// export default SurveyList
// rateProAdmin/src/pages/Surveys/SurveyList.jsx
"use client"
import { useState, useEffect } from "react"
import { Container, Row, Col, Table, Button, Form, InputGroup, Modal, Spinner, Alert } from "react-bootstrap"
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
  MdFeedback
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

      // Optimistically update UI
      setSurveys(surveys.map(s =>
        s._id === surveyId
          ? { ...s, status: newStatus }
          : s
      ));

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
      // console.log("Fetching surveys with params:", {
      //   currentPage,
      //   itemsPerPage,
      //   searchTerm,
      //   filterStatus,
      //   sortField
      // });
    }, searchTerm ? 500 : 0); // Debounce search

    return () => clearTimeout(debounceTimer);
  }, [currentPage, itemsPerPage, searchTerm, filterStatus, sortField]);

  const getSortIcon = (field) => {
    if (sortField === field) return MdArrowDropUp;
    if (sortField === `-${field}`) return MdArrowDropDown;
    return MdSort;
  };

  return (
    <Container fluid className="survey-list-container">
      {/* Header Section */}
      <div className="survey-header-card">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h1 className="survey-header-title">
              <MdAssignment />
              Surveys
            </h1>
            <p className="survey-header-subtitle">Create and manage your feedback surveys</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Button
              className="survey-btn-outline"
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
            </Button>
            <Button
              className="survey-btn-primary"
              onClick={() => navigate("/app/surveys/create")}
            >
              <MdAdd />
              Create Survey
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="survey-filter-card">
        <div className="card-body">
          <Row className="g-3">
            <Col lg={5}>
              <InputGroup>
                <InputGroup.Text className="survey-search-icon">
                  <MdSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search surveys by title, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="survey-search-input border-start-0"
                />
              </InputGroup>
            </Col>
            <Col lg={3}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="survey-select"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Surveys</option>
                <option value="completed">Completed Surveys</option>
                <option value="draft">Draft Surveys</option>
                <option value="paused">Paused Surveys</option>
              </Form.Select>
            </Col>
            <Col lg={4}>
              <div className="d-flex gap-2">
                <Button className="survey-btn-outline flex-grow-1">
                  <MdSearch />
                  Advanced Filters
                </Button>
                <Button
                  className="survey-btn-outline"
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
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Survey Table */}
      <div className="survey-table-card">
        <div className="card-body">
          {error ? (
            <div className="error-state">
              <MdErrorOutline size={48} />
              <p className="mb-3">{error}</p>
              <Button
                className="survey-btn-primary"
                size="sm"
                onClick={fetchSurveys}
              >
                <MdErrorOutline className="me-2" />
                Try Again
              </Button>
            </div>
          ) : surveys.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-clipboard-list"></i>
              <h5>No surveys found</h5>
              <p>Create your first survey to get started</p>
              <Button
                className="survey-btn-primary"
                onClick={() => navigate("/app/surveys/create")}
              >
                <i className="fas fa-plus"></i>
                Create Your First Survey
              </Button>
            </div>
          ) : (
            <div className="table-responsive survey-table-responsive">
              <Table className="survey-table">
                <thead>
                  <tr>
                    <th
                      onClick={() =>
                        setSortField(sortField === "title" ? "-title" : "title")
                      }
                      style={{ cursor: "pointer" }}
                    >
                      Title
                      {(() => {
                        const Icon = getSortIcon("title");
                        return <Icon className="ms-2" />;
                      })()}
                    </th>
                    <th>Description</th>
                    <th
                      onClick={() =>
                        setSortField(sortField === "status" ? "-status" : "status")
                      }
                      style={{ cursor: "pointer" }}
                    >
                      Status
                      {(() => {
                        const Icon = getSortIcon("status");
                        return <Icon className="ms-2" />;
                      })()}
                    </th>
                    <th
                      onClick={() =>
                        setSortField(
                          sortField === "createdAt" ? "-createdAt" : "createdAt"
                        )
                      }
                      style={{ cursor: "pointer" }}
                    >
                      Created At
                      {(() => {
                        const Icon = getSortIcon("createdAt");
                        return <Icon className="ms-2" />;
                      })()}
                    </th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.length > 0 ? (
                    surveys.map((survey) => (
                      <tr key={survey._id}>
                        <td>{survey.title}</td>
                        <td>{survey.description}</td>
                        <td>
                          <span
                            className={`status-badge ${survey.status.toLowerCase()}`}
                          >
                            {survey.status}
                          </span>
                        </td>
                        <td>
                          {new Date(survey.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="text-end">
                          <Button
                            variant="link"
                            className={`action-btn toggle me-2 ${survey.status.toLowerCase() === "active" ? "active" : "inactive"
                              }`}
                            onClick={() => toggleStatus(survey._id, survey.status)}
                            title={`${survey.status === "active" ? "Deactivate" : "Activate"
                              } Survey`}
                          >
                            {survey.status.toLowerCase() === "active" ? (
                              <MdToggleOn size={20} />
                            ) : (
                              <MdToggleOff size={20} />
                            )}
                          </Button>

                          {/* Edit Button — show only if NOT admin */}
                          {user?.role !== "admin" && (
                            <Button
                              variant="link"
                              className="action-btn edit me-2"
                              onClick={() => handleEdit(survey._id)}
                              title="Edit Survey"
                            >
                              <MdEdit size={20} />
                            </Button>
                          )}

                          {/* Analytics */}
                          {survey.status !== "draft" && (
                            <Button
                              variant="link"
                              className="action-btn analytics me-2"
                              onClick={() => handleAnalytics(survey._id)}
                              title="View Analytics"
                            >
                              <MdBarChart size={20} />
                            </Button>
                          )}
                          {/* Distribution */}
                          {survey.status !== "inactive" && survey.status !== "draft" && (
                            <Button
                              variant="link"
                              className="action-btn distribution me-2"
                              onClick={() => handleDistribution(survey._id)}
                              title="Distribution & QR Codes"
                            >
                              <MdShare size={20} />
                            </Button>
                          )}
                          {/* Delete Button — show only if NOT admin */}
                          {user?.role !== "admin" && (
                            <Button
                              variant="link"
                              className="action-btn delete me-2"
                              onClick={() => handleDelete(survey)}
                              title="Delete Survey"
                            >
                              <MdDelete size={20} />
                            </Button>
                          )}

                          {/* View Survey */}
                          <Button
                            variant="link"
                            className="action-btn view me-2"
                            onClick={() => handleViewSurvey(survey._id)}
                            title="View Survey Details"
                          >
                            <MdVisibility size={20} />
                          </Button>

                          {/* Feedback */}
                          {survey.status !== "draft" && (
                            <Button
                              variant="link"
                              className="action-btn feedback"
                              onClick={() => handleFeedback(survey._id)}
                              title="View Survey Feedback"
                            >
                              <MdFeedback size={20} />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">
                        <div className="empty-state">
                          <MdAssignment className="empty-state-icon" />
                          <h5>No surveys found</h5>
                          <p className="text-muted">
                            Create your first survey to get started
                          </p>
                          <Button
                            variant="primary"
                            onClick={() => navigate("/surveys/create")}
                            className="mt-3"
                          >
                            <MdAdd className="me-2" />
                            Create Survey
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </div>
        <div className="survey-table-footer">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-3 w-100 justify-content-between">
              <small className="pagination-info">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} surveys
              </small>
              <Form.Select
                size="sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="per-page-select"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </Form.Select>
            </div>
            <div>
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
      </div>


      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        className="survey-delete-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-exclamation-triangle me-2"></i>
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the survey "<strong>{selectedSurvey?.title}</strong>"?</p>
          <Alert variant="warning" className="mb-0">
            <i className="fas fa-exclamation-circle me-2"></i>
            This action cannot be undone. All survey responses and analytics will be permanently deleted.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            onClick={() => setShowDeleteModal(false)}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            className="px-4"
          >
            <i className="fas fa-trash me-2"></i>
            Delete Survey
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default SurveyList;