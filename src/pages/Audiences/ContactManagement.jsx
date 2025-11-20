"use client"
import { useState, useEffect, useRef } from "react"
import { MdContacts, MdAdd, MdRefresh, MdSearch, MdFilterAlt, MdUpload, MdDownload, MdVisibility, MdEdit, MdEmail, MdDelete, MdSettings, MdPeople, MdCheckCircle, MdTrendingUp, MdLabel, MdMoreVert } from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
import { Modal, Button } from 'react-bootstrap';
import { useAuth } from "../../context/AuthContext.jsx"
import axiosInstance from '../../api/axiosInstance';
import Swal from "sweetalert2";

const ContactManagement = ({ darkMode }) => {
  const { user: currentUser, hasPermission, globalLoading, setGlobalLoading } = useAuth();
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [currentContact, setCurrentContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    tenantId: "",
    segment: "",
    tags: "",
    status: "Active"
  })
  const [viewContact, setViewContact] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSegment, setFilterSegment] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedContacts, setSelectedContacts] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [segments, setSegments] = useState([]);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const handleShow = () => setShowImportModal(true);
  const handleClose = () => { setFile(null); setShowImportModal(false); }

  const isMember = currentUser?.role === "member";

  const memberCanCreate = !isMember || hasPermission("user:create");
  const memberCanUpdate = !isMember || hasPermission("user:update");
  const memberCanDelete = !isMember || hasPermission("user:delete");
  const memberCanAssign = !isMember || hasPermission("user:assign");
  const memberCanRead = !isMember || hasPermission("user:read");
  const memberCanToggle = !isMember || hasPermission("user:toggle");
  const memberCanExport = !isMember || hasPermission("user:export");
  const memberCanNotify = !isMember || hasPermission("user:notify");
  const memberCanUpload = !isMember || hasPermission("user:mass-upload");
  const memberCanDownload = !isMember || hasPermission("user:file-template");


  // === FETCH CONTACT CATEGORIES ===
  // const fetchContactCategories = async (tenantId) => {
  //   if (!tenantId) {
  //     setCategoryOptions([]);
  //     return;
  //   }

  //   try {
  //     const res = await axiosInstance.get(`/contact-categories?tenantId=${tenantId}`);
  //     console.log("Contact Categories Response:", res);
  //     let categoriesData = [];
  //     if (Array.isArray(res?.data?.data?.categories)) {
  //       categoriesData = res.data.data.categories;
  //     } else if (Array.isArray(res?.data?.categories)) {
  //       categoriesData = res.data.categories;
  //     } else if (Array.isArray(res?.data)) {
  //       categoriesData = res.data;
  //     }


  //     const options = categoriesData.map((cat) => ({
  //       value: cat._id,
  //       label: cat.name,
  //       type: cat.type,
  //     }));
  //     setCategoryOptions(options);
  //   } catch (err) {
  //     console.error("Failed to load contact categories:", err);
  //     Swal.fire("Error", "Could not load contact categories", "error");
  //   }
  // };

  useEffect(() => {
    const fetchCategories = async (tenantId) => {
      try {
        const res = await axiosInstance.get(`/contact-categories?tenantId=${tenantId}`); // <-- your API route
        const data = res?.data?.data?.categories ?? []; // Adjust based on your API response structure
        console.log("Fetched Categories:", data);

        // Convert to dropdown format
        const formatted = data.map((item) => ({
          label: item.name,   // Adjust according to your DB field
          value: item._id
        }));

        setCategoryOptions(formatted);
      } catch (error) {
        console.log("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const fetchSegments = async () => {
    try {
      const res = await axiosInstance.get('/segments/all'); // backend route
      if (res.data.success) {
        // Only active segments
        const activeSegments = res.data.segments.filter(
          (segment) => segment.status === "Active"
        );
        setSegments(activeSegments);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
      }
      if (filterSegment !== "all") params.segment = filterSegment
      if (filterStatus !== "all") params.status = filterStatus
      const res = await axiosInstance.get('/contacts', { params })
      setContacts(res.data.contacts)
      setPagination(p => ({ ...p, total: res.data.total }))
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSegments();
    setCategoryOptions([]);
    // fetchContactCategories(currentUser?.tenantId);
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [pagination.page, searchTerm, filterSegment, filterStatus])

  const handleCreateContact = () => {
    setCurrentContact({
      name: "",
      email: "",
      phone: "",
      company: "",
      contactCategories: "",
      tenantId: "",
      segment: "",
      tags: "",
      status: "Active"
    })
    setModalMode('create')
    setShowModal(true)
  }

  // const handleEdit = (contact) => {
  //   setCurrentContact({
  //     _id: contact._id,
  //     name: contact.name || "",
  //     email: contact.email || "",
  //     phone: contact.phone || "",
  //     company: contact.company || "",
  //     // ← YEH LINE CHANGE KARO
  //     segment: contact.segment?._id || contact.segment || "", // sirf ID string rakho
  //     tags: typeof contact.tags === 'string' ? contact.tags : (contact.tags?.join(", ") || ""),
  //     status: contact.status || "Active",
  //     _id: contact._id // important for update
  //   });

  //   setModalMode("edit");
  //   setShowModal(true);
  // };

  const handleEdit = (contact) => {
    setCurrentContact({
      _id: contact._id,
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      segment: contact.segment?._id || "",  // ← sirf ID ya null
      tags: Array.isArray(contact.tags)
        ? contact.tags.join(", ")
        : (contact.tags || ""),
      status: contact.status || "Active"
    });

    setModalMode("edit");
    setShowModal(true);
  };

  const handleView = (contact) => {
    setViewContact(contact)
    setShowViewModal(true)
  }

  const handleSaveContact = async () => {
    if (currentContact.name.trim() && currentContact.email.trim()) {
      try {
        let res;

        if (modalMode === "edit") {
          // UPDATE
          res = await axiosInstance.put(
            `/contacts/${currentContact._id}`,
            currentContact
          );

          Swal.fire({
            icon: "success",
            title: "Contact Updated",
            text: "Contact successfully updated!",
            timer: 1500,
            showConfirmButton: false,
          });

        } else {
          // CREATE
          res = await axiosInstance.post("/contacts", currentContact);

          console.log("FINAL PAYLOAD BEING SENT:", {
            _id: currentContact._id,
            name: currentContact.name,
            email: currentContact.email,
            phone: currentContact.phone,
            contactCategories: currentContact.contactCategories,
            tenantId: currentContact.tenantId,
            company: currentContact.company,
            segment: currentContact.segment,
            tags: currentContact.tags
          });

          Swal.fire({
            icon: "success",
            title: "Contact Created",
            text: "New contact added successfully!",
            timer: 1500,
            showConfirmButton: false,
          });
        }

        fetchContacts();
        setShowModal(false);

      } catch (err) {
        console.error(err);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong!",
        });
      }
    }
  };

  const deleteContact = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.delete(`/contacts/${id}`).then(() => {
          fetchContacts()
          Swal.fire(
            'Deleted!',
            'Your contact has been deleted.',
            'success'
          )
        }).catch(err => console.error(err))
      }
    })
  }

  const handleSelectContact = (id) => {
    setSelectedContacts((prev) => (prev.includes(id) ? prev.filter((contactId) => contactId !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(contacts.map((c) => c._id))
    }
  }

  const handleBulkDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedContacts.length} contacts!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete them!'
    }).then((result) => {
      if (result.isConfirmed) {
        Promise.all(selectedContacts.map(id => axiosInstance.delete(`/contacts/${id}`))).then(() => {
          fetchContacts()
          setSelectedContacts([])
          Swal.fire(
            'Deleted!',
            'Selected contacts have been deleted.',
            'success'
          )
        }).catch(err => console.error(err))
      }
    })
  }

  const handleFileChange = (e) => setFile(e.target.files[0]);


  const handleBulkUploadContacts = async (file) => {
    if (!file) return alert("Please select a file first!");

    const formData = new FormData();
    formData.append("excel", file);

    try {
      setGlobalLoading(true); // loader start

      const res = await axiosInstance.post("/contacts/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const { createdContacts = [], errors: rawErrors, message } = res.data;
      const errors = rawErrors || []; // null protection

      const successCount = createdContacts.length;
      const errorCount = errors.length;

      // 🟢 summary HTML
      const summaryHtml = `
      <p><b>${successCount}</b> contact(s) imported successfully.</p>
      ${successCount > 0 ? "<ul>" + createdContacts.map(c => `<li>${c.email || c.name}</li>`).join("") + "</ul>" : ""}

      <p><b>${errorCount}</b> contact(s) failed to import.</p>
      ${errorCount > 0 ? "<ul>" + errors.map(e => `<li>${e.email || e.name} - ${e.message}</li>`).join("") + "</ul>" : ""}
    `;

      Swal.fire({
        icon: errorCount > 0 ? "warning" : "success",
        title: message || "Bulk contacts import processed",
        html: summaryHtml,
        width: 600,
      });

      await fetchContacts(); // refresh contacts list
      setShowImportModal(false); // close modal
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Import Failed",
        text: err.response?.data?.message || "Something went wrong while importing contacts.",
      });
      console.error("❌ Import error:", err.response?.data || err.message);
    } finally {
      setGlobalLoading(false); // loader stop
    }
  };

  const activeContacts = contacts.filter(c => c.status === 'Active').length
  const totalSegments = [...new Set(contacts.map(c => c.segment?.name))].length
  const recentContacts = contacts.filter(c => {
    const activityDate = new Date(c.lastActivity)
    const daysDiff = Math.floor((new Date() - activityDate) / (1000 * 60 * 60 * 24))
    return daysDiff <= 7
  }).length

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading contacts...</p>
      </div>
    )
  }

  return (
    <div className="contact-management-container">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-title-wrapper">
            <div className="page-icon">
              <MdContacts />
            </div>
            <div>
              <h1 className="page-title">Contact Management</h1>
              <p className="page-subtitle">Manage your survey contacts and audience lists</p>
            </div>
          </div>
          <div className="page-actions">
            <button className="action-button secondary-action" onClick={() => { fetchContacts(); }}>
              <MdRefresh /> Refresh
            </button>
            {(currentUser?.role === "companyAdmin" || memberCanUpload) && (
              <Button
                variant="outline-primary"
                onClick={handleShow} // open modal first
                disabled={!memberCanUpdate}
                className="import-btn"
              >
                <MdUpload className="me-2" /> Import Contacts
              </Button>
            )}

            <button className="action-button primary-action" onClick={handleCreateContact}>
              <MdAdd /> Add Contact
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card primary-card">
          <div className="stat-icon">
            <MdPeople />
          </div>
          <div className="stat-content">
            <div className="stat-value">{contacts.length}</div>
            <div className="stat-label">Total Contacts</div>
          </div>
        </div>
        <div className="stat-card success-card">
          <div className="stat-icon">
            <MdCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{activeContacts}</div>
            <div className="stat-label">Active Contacts</div>
          </div>
        </div>
        <div className="stat-card info-card">
          <div className="stat-icon">
            <MdContacts />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalSegments}</div>
            <div className="stat-label">Segments</div>
          </div>
        </div>
        <div className="stat-card warning-card">
          <div className="stat-icon">
            <MdTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-value">{recentContacts}</div>
            <div className="stat-label">Recent Activity</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="section-card filters-section">
        <div className="filters-grid">
          <div className="search-input-container">
            <MdSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select
              className="filter-select"
              value={currentContact.segment || ""}   // ← yeh change karo (pehle galat tha)
              onChange={(e) => {
                const value = e.target.value;
                setCurrentContact({
                  ...currentContact,
                  segment: value || null   // ← empty string ko null bana do, undefined nahi!
                });
              }}
            >
              <option value="">No Segment (Unassigned)</option>
              {segments?.map((segment) => (
                <option key={segment._id} value={segment._id}>
                  {segment.name} ({segment.size} contacts)
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          {selectedContacts.length > 0 && (
            <div className="bulk-actions-dropdown">
              <button
                className="bulk-actions-toggle"
                onClick={() => setShowBulkActions(!showBulkActions)}
              >
                <MdMoreVert /> Actions ({selectedContacts.length})
              </button>
              {showBulkActions && (
                <div className="bulk-actions-menu">
                  <button className="bulk-action-item">
                    <MdEmail /> Send Survey
                  </button>
                  <button className="bulk-action-item">
                    <MdLabel /> Add Tags
                  </button>
                  <button className="bulk-action-item">
                    <MdFilterAlt /> Add to Segment
                  </button>
                  <div className="bulk-actions-divider"></div>
                  <button className="bulk-action-item danger" onClick={handleBulkDelete}>
                    <MdDelete /> Delete Selected
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contacts Table Section */}
      <div className="section-card contacts-table-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <h2 className="section-title">Contacts List</h2>
            <p className="section-subtitle">
              {pagination.total} {pagination.total === 1 ? 'contact' : 'contacts'} found
            </p>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th className="phone-column">Phone</th>
                <th className="company-column">Company</th>
                <th>Segment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact._id}>
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      className="table-checkbox"
                      checked={selectedContacts.includes(contact._id)}
                      onChange={() => handleSelectContact(contact._id)}
                    />
                  </td>
                  <td>
                    <div className="contact-name-cell">
                      <div className="contact-name">{contact.name}</div>
                      {contact.tags && (
                        <div className="contact-tags">
                          {contact.tags.split(',').map((tag) => (
                            <span key={tag} className="contact-tag">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="contact-email">{contact.email}</div>
                  </td>
                  <td className="phone-column">
                    <div className="contact-phone">{contact.phone}</div>
                  </td>
                  <td className="company-column">
                    <div className="contact-company">{contact.company}</div>
                  </td>
                  <td>
                    <span className="segment-badge">
                      {contact.segment?._id ? contact.segment.name : 'Unassigned'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${contact.status.toLowerCase()}-status`}>
                      {contact.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view-btn" title="View" onClick={() => handleView(contact)}>
                        <MdVisibility />
                      </button>
                      <button className="action-btn edit-btn" title="Edit" onClick={() => handleEdit(contact)}>
                        <MdEdit />
                      </button>
                      <button className="action-btn email-btn" title="Send Survey">
                        <MdEmail />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Delete"
                        onClick={() => deleteContact(contact._id)}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <Pagination
            current={pagination.page}
            total={pagination.total}
            limit={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Add/Edit Contact Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-end mt-2 me-2">
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form className="contact-form">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter contact name"
                    value={currentContact.name}
                    onChange={(e) => setCurrentContact({ ...currentContact, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter email address"
                    value={currentContact.email}
                    onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Enter phone number"
                    value={currentContact.phone}
                    onChange={(e) => setCurrentContact({ ...currentContact, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter company name"
                    value={currentContact.company}
                    onChange={(e) => setCurrentContact({ ...currentContact, company: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Categories</label>
                  <select
                    className="filter-select"
                    value={currentContact.contactCategories?.[0] || ""}
                    onChange={(e) =>
                      setCurrentContact({
                        ...currentContact,
                        contactCategories: [e.target.value]   // array me store
                      })
                    }>
                    <option value="">Select Category</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Segment</label>
                  <select
                    className="filter-select"
                    value={currentContact.segment}
                    onChange={(e) =>
                      setCurrentContact({
                        ...currentContact,
                        segment: e.target.value // poora object store
                      })
                    }
                  >
                    <option value="">Select Segment</option>
                    {segments?.map((segment) => (
                      <option key={segment._id} value={segment._id}>
                        {segment.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter tags, separated by commas"
                    value={currentContact.tags}
                    onChange={(e) => setCurrentContact({ ...currentContact, tags: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={currentContact.status}
                    onChange={(e) => setCurrentContact({ ...currentContact, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="modal-submit-btn" onClick={handleSaveContact}>
                {modalMode === 'create' ? <MdAdd /> : <MdEdit />} {modalMode === 'create' ? 'Add' : 'Update'} Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Contact Modal */}
      {showViewModal && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {/* <div className="modal-header">
              <h2 className="modal-title">
                <MdVisibility /> View Contact
              </h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                ×
              </button>
            </div> */}
            <div className="d-flex justify-content-end mt-2 me-2">
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <div className="form-text">{viewContact?.name || "-"}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="form-text">{viewContact.email}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <div className="form-text">{viewContact.phone}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <div className="form-text">{viewContact.company}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Segment</label>
                <div className="form-text">{viewContact.segment?.name}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Tags</label>
                <div className="form-text">{viewContact.tags}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <div className="form-text">{viewContact.status}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Last Activity</label>
                <div className="form-text">{new Date(viewContact.lastActivity).toLocaleDateString()}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Created At</label>
                <div className="form-text">{new Date(viewContact.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <Modal show={showImportModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Import Contacts</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-center">
            Upload a .xlsx or .xls file with your contacts
          </p>
          <input
            className="w-100 border"
            type="file"
            accept=".xlsx,.xls"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <small className="text-muted">
            File should include columns: Name, Email, Phone, Company, Segment
          </small>

          {(currentUser?.role === "companyAdmin" || memberCanDownload) && (
            <div className="mt-3">
              <a
                href="/downloads/contact-sample.xlsx"
                download="contact-sample.xlsx"
                className="btn btn-outline-secondary"
              >
                📥 Download Template
              </a>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={() => handleBulkUploadContacts(file)}
            disabled={!file || loading}
          >
            {loading ? "Importing..." : "Import Contacts"}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  )
}

export default ContactManagement