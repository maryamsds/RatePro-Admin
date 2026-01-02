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
    // segment: "",
    tags: "",
    status: "Active",
    contactCategories: [],
  })
  const [viewContact, setViewContact] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSegment, setFilterSegment] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedContacts, setSelectedContacts] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  // const [segments, setSegments] = useState([]);
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
        // console.log("Fetched Categories:", data);

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

  // const fetchSegments = async () => {
  //   try {
  //     const res = await axiosInstance.get('/contact-categories/all'); // backend route
  //     console.log("Segments Response:", res);
  //     if (res.data.success) {
  //       // Only active segments
  //       const activeSegments = res.data.segments.filter(
  //         (segment) => segment.status === "Active"
  //       );
  //       setSegments(activeSegments);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
      }
      if (filterStatus !== "all") params.status = filterStatus
      const res = await axiosInstance.get('/contacts', { params })
      
      // 🔥 FIX: Backend returns { success, data: { contacts, total, page, limit } }
      const data = res?.data?.data || res?.data || {}
      const contacts = data.contacts || data.items || []
      const total = data.total || 0
      
      setContacts(contacts)
      setPagination(p => ({ ...p, total }))
    } catch (err) {
      console.error("Failed to fetch contacts:", err)
      Swal.fire("Error", "Failed to load contacts", "error")
    }
    setLoading(false)
  }

  useEffect(() => {
    // fetchSegments();
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
      contactCategories: [],
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
      status: contact.status || "Active",
      contactCategories: (contact.contactCategories || []).map((cat) => cat?._id || cat).filter(Boolean),
    });

    setModalMode("edit");
    setShowModal(true);
  };

  const handleView = (contact) => {
    setViewContact(contact)
    setShowViewModal(true)
  }

  const handleSaveContact = async () => {
    if (!currentContact.name.trim() || !currentContact.email.trim()) {
      Swal.fire("Error", "Name and Email are required", "error")
      return
    }

    // 🔥 FIX: Validate at least one category
    if (!currentContact.contactCategories?.length) {
      Swal.fire("Error", "At least one category is required", "error")
      return
    }

    try {
      const payload = {
        name: currentContact.name.trim(),
        email: currentContact.email.trim(),
        phone: currentContact.phone || "",
        company: currentContact.company || "",
        tags: currentContact.tags || "",
        status: currentContact.status || "Active",
        contactCategories: currentContact.contactCategories.filter(Boolean),
      }

      if (modalMode === "edit") {
        await axiosInstance.put(`/contacts/${currentContact._id}`, payload)
        Swal.fire({
          icon: "success",
          title: "Contact Updated",
          timer: 1500,
          showConfirmButton: false,
        })
      } else {
        await axiosInstance.post("/contacts", payload)
        Swal.fire({
          icon: "success",
          title: "Contact Created",
          timer: 1500,
          showConfirmButton: false,
        })
      }

      fetchContacts()
      setShowModal(false)

    } catch (err) {
      console.error(err)
      const message = err?.response?.data?.message || "Something went wrong!"
      Swal.fire("Error", message, "error")
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
    if (!file) {
      Swal.fire("Error", "Please select a file first!", "error")
      return
    }

    const formData = new FormData()
    formData.append("excel", file)

    try {
      setGlobalLoading(true)

      const res = await axiosInstance.post("/contacts/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      // 🔥 FIX: Backend returns { message, inserted, failed, errors }
      const { message, inserted = 0, failed = 0, errors = [] } = res.data

      const summaryHtml = `
        <p><b>${inserted}</b> contact(s) imported successfully.</p>
        <p><b>${failed}</b> contact(s) failed to import.</p>
        ${errors?.length > 0 
          ? `<ul>${errors.map(e => `<li>Row ${e.row}: ${e.message}</li>`).join("")}</ul>` 
          : ""
        }
      `

      Swal.fire({
        icon: failed > 0 ? "warning" : "success",
        title: message || "Bulk import completed",
        html: summaryHtml,
        width: 600,
      })

      await fetchContacts()
      setShowImportModal(false)
      setFile(null)

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Import Failed",
        text: err.response?.data?.message || "Something went wrong",
      })
      console.error("Import error:", err)
    } finally {
      setGlobalLoading(false)
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
          {/* <div className="stat-content">
            <div className="stat-value">{totalSegments}</div>
            <div className="stat-label">Segments</div>
          </div> */}
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
          {/* <div className="filter-group">
            <select
              className="filter-select"
              value={filterSegment}
              onChange={(e) => {
                const value = e.target.value;
                setFilterSegment(value || "all");
              }}
            >
              <option value="all">All Segments</option>
              <option value="">No Segment (Unassigned)</option>
              {segments?.map((segment) => (
                <option key={segment._id} value={segment._id}>
                  {segment.name} ({segment.size} contacts)
                </option>
              ))}
            </select>
          </div> */}
          <div className="filter-group">
            <select
              className="filter-select w-full"
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
                className="bulk-actions-toggle w-full flex items-center justify-center gap-2"
                onClick={() => setShowBulkActions(!showBulkActions)}
              >
                <MdMoreVert /> Actions ({selectedContacts.length})
              </button>
              {showBulkActions && (
                <div className="bulk-actions-menu absolute top-full left-0 right-0 mt-1 z-10">
                  <button className="bulk-action-item flex items-center gap-2">
                    <MdEmail /> Send Survey
                  </button>
                  <button className="bulk-action-item flex items-center gap-2">
                    <MdLabel /> Add Tags
                  </button>
                  {/* <button className="bulk-action-item flex items-center gap-2">
                    <MdFilterAlt /> Add to Segment
                  </button> */}
                  <div className="bulk-actions-divider"></div>
                  <button className="bulk-action-item danger flex items-center gap-2" onClick={handleBulkDelete}>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b">
          <div>
            <h2 className="section-title">Contacts List</h2>
            <p className="section-subtitle">
              {pagination.total} {pagination.total === 1 ? 'contact' : 'contacts'} found
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table w-full">
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
                <th className="hidden sm:table-cell phone-column">Phone</th>
                <th className="hidden md:table-cell company-column">Company</th>
                {/* <th className="hidden lg:table-cell">Segment</th> */}
                <th className="hidden xl:table-cell">Status</th>
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
                    <div className="flex flex-col">
                      <div className="contact-name">{contact.name}</div>
                      {(Array.isArray(contact.tags) || typeof contact.tags === "string") && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(Array.isArray(contact.tags)
                            ? contact.tags
                            : contact.tags.split(",")).map((tag) => {
                              const cleanTag = (tag || "").trim();
                              return cleanTag ? (
                                <span key={cleanTag} className="contact-tag">
                                  {cleanTag}
                                </span>
                              ) : null;
                            })}
                        </div>
                      )}
                      {contact.autoTags?.length ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {contact.autoTags.map((tag) => (
                            <span key={tag} className="contact-tag auto-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className="contact-email">{contact.email}</div>
                    {contact.enrichment?.domain || contact.enrichment?.country ? (
                      <div className="text-xs text-muted mt-1">
                        {contact.enrichment?.domain ? `Domain: ${contact.enrichment.domain}` : ""}
                        {contact.enrichment?.domain && contact.enrichment?.country ? " · " : ""}
                        {contact.enrichment?.country ? `Country: ${contact.enrichment.country}` : ""}
                      </div>
                    ) : null}
                  </td>
                  <td className="hidden sm:table-cell phone-column">
                    <div className="contact-phone">{contact.phone}</div>
                  </td>
                  <td className="hidden md:table-cell company-column">
                    <div className="contact-company">{contact.company}</div>
                  </td>
                  {/* <td className="hidden lg:table-cell">
                    <span className="segment-badge">
                      {contact.segment?._id ? contact.segment.name : 'Unassigned'}
                    </span>
                  </td> */}
                  <td className="hidden xl:table-cell">
                    <span className={`status-badge ${contact.status.toLowerCase()}-status`}>
                      {contact.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
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

        <div className="p-4 border-t">
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
        <div className="modal-overlay flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="modal-container max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mt-2 me-2">
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="p-4">
              <form className="contact-form flex flex-col gap-4">
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
                        contactCategories: e.target.value ? [e.target.value] : []
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

                {/* <div className="form-group">
                  <label className="form-label">Segment</label>
                  <select
                    className="filter-select"
                    value={currentContact.segment}
                    onChange={(e) =>
                      setCurrentContact({
                        ...currentContact,
                        segment: e.target.value
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
                </div> */}

                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter tags, separated by commas"
                    value={currentContact.tags}
                    onChange={(e) => setCurrentContact({ ...currentContact, tags: e.target.value })}
                  />
                  <p className="help-text">Auto-tags are added by the system; enter only manual tags here.</p>
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-4 border-t">
              <button className="modal-cancel-btn flex items-center justify-center gap-2" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="modal-submit-btn flex items-center justify-center gap-2" onClick={handleSaveContact}>
                {modalMode === 'create' ? <MdAdd /> : <MdEdit />} {modalMode === 'create' ? 'Add' : 'Update'} Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Contact Modal */}
      {showViewModal && viewContact && (
        <div className="modal-overlay flex items-center justify-center p-4" onClick={() => setShowViewModal(false)}>
          <div className="modal-container max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center p-4 border-b sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold">Contact Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                ×
              </button>
            </div>
            <div className="p-4 py-0">
              {/* Basic Info Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-primary">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group d-flex flex-row justify-content-between align-items-center">
                    <label className="form-label">Name</label>
                    <div className="form-text">{viewContact?.name || "-"}</div>
                  </div>
                  <div className="form-group d-flex flex-row justify-content-between align-items-center">
                    <label className="form-label">Email</label>
                    <div className="form-text">{viewContact?.email || "-"}</div>
                  </div>
                  <div className="form-group d-flex flex-row justify-content-between align-items-center">
                    <label className="form-label">Phone</label>
                    <div className="form-text">{viewContact?.phone || "-"}</div>
                  </div>
                  <div className="form-group d-flex flex-row justify-content-between align-items-center">
                    <label className="form-label">Company</label>
                    <div className="form-text">{viewContact?.company || "-"}</div>
                  </div>
                  <div className="form-group d-flex flex-row justify-content-between align-items-center">
                    <label className="form-label">Status</label>
                    <span className={`status-badge ${viewContact?.status?.toLowerCase()}-status`}>
                      {viewContact?.status || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Categories & Tags Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-primary">Categories & Tags</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group d-flex flex-row justify-content-between align-items-center">
                    <label className="form-label">Contact Categories</label>
                    <div className="flex flex-wrap gap-1">
                      {viewContact?.contactCategories?.length > 0 ? (
                        viewContact.contactCategories.map((cat) => (
                          <span key={cat?._id || cat} className="contact-tag category-tag">
                            {cat?.name || cat}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">No categories</span>
                      )}
                    </div>
                  </div>
                  <div className="form-group d-flex flex-row justify-content-between align-items-center">
                    <label className="form-label">Manual Tags</label>
                    <div className="flex flex-wrap gap-1">
                      {viewContact?.tags?.length > 0 ? (
                        (Array.isArray(viewContact.tags) ? viewContact.tags : viewContact.tags.split(","))
                          .map((tag) => tag.trim())
                          .filter(Boolean)
                          .map((tag) => (
                            <span key={tag} className="contact-tag">
                              {tag}
                            </span>
                          ))
                      ) : (
                        <span className="text-muted">No tags</span>
                      )}
                    </div>
                  </div>
                  <div className="form-group d-flex flex-row justify-content-between align-items-center">
                    <label className="form-label">Auto Tags</label>
                    <div className="flex flex-wrap gap-1">
                      {viewContact?.autoTags?.length > 0 ? (
                        viewContact.autoTags.map((tag) => (
                          <span key={tag} className="contact-tag auto-tag">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">No auto tags</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Survey Stats Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-primary">Survey Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="stat-card-mini">
                    <div className="stat-value-mini">{viewContact?.surveyStats?.invitedCount ?? 0}</div>
                    <div className="stat-label-mini">Invites Sent</div>
                  </div>
                  <div className="stat-card-mini">
                    <div className="stat-value-mini">{viewContact?.surveyStats?.respondedCount ?? 0}</div>
                    <div className="stat-label-mini">Responses</div>
                  </div>
                  <div className="stat-card-mini">
                    <div className="stat-value-mini">
                      {viewContact?.surveyStats?.latestNpsScore !== undefined 
                        ? viewContact.surveyStats.latestNpsScore 
                        : "-"}
                    </div>
                    <div className="stat-label-mini">Latest NPS</div>
                  </div>
                  <div className="stat-card-mini">
                    <div className="stat-value-mini">
                      {viewContact?.surveyStats?.avgNpsScore !== undefined 
                        ? viewContact.surveyStats.avgNpsScore.toFixed(1) 
                        : "-"}
                    </div>
                    <div className="stat-label-mini">Avg NPS</div>
                  </div>
                  <div className="stat-card-mini">
                    <div className="stat-value-mini">
                      {viewContact?.surveyStats?.latestRating !== undefined 
                        ? `${viewContact.surveyStats.latestRating}/5` 
                        : "-"}
                    </div>
                    <div className="stat-label-mini">Latest Rating</div>
                  </div>
                  <div className="stat-card-mini">
                    <div className="stat-value-mini">
                      {viewContact?.surveyStats?.avgRating !== undefined 
                        ? `${viewContact.surveyStats.avgRating.toFixed(1)}/5` 
                        : "-"}
                    </div>
                    <div className="stat-label-mini">Avg Rating</div>
                  </div>
                  <div className="stat-card-mini col-span-2">
                    <div className="stat-value-mini">
                      {viewContact?.surveyStats?.npsCategory ? (
                        <span className={`nps-badge ${viewContact.surveyStats.npsCategory}`}>
                          {viewContact.surveyStats.npsCategory.charAt(0).toUpperCase() + 
                           viewContact.surveyStats.npsCategory.slice(1)}
                        </span>
                      ) : "-"}
                    </div>
                    <div className="stat-label-mini">NPS Category</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="form-group d-flex flex-row justify-content-between align-items-center">
                    <label className="form-label">Last Invited</label>
                    <div className="form-text">
                      {viewContact?.surveyStats?.lastInvitedDate 
                        ? new Date(viewContact.surveyStats.lastInvitedDate).toLocaleDateString() 
                        : "-"}
                    </div>
                  </div>
                  <div className="form-group d-flex flex-row justify-content-between align-items-center">
                    <label className="form-label">Last Response</label>
                    <div className="form-text">
                      {viewContact?.surveyStats?.lastResponseDate 
                        ? new Date(viewContact.surveyStats.lastResponseDate).toLocaleDateString() 
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrichment Section */}
              {viewContact?.enrichment && Object.values(viewContact.enrichment).some(v => v) && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-primary">Enrichment Data</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {viewContact.enrichment.country && (
                      <div className="form-group d-flex flex-row justify-content-between align-items-center">
                        <label className="form-label">Country</label>
                        <div className="form-text">
                          {viewContact.enrichment.country}
                          {viewContact.enrichment.countryCode && ` (${viewContact.enrichment.countryCode})`}
                        </div>
                      </div>
                    )}
                    {viewContact.enrichment.region && (
                      <div className="form-group d-flex flex-row justify-content-between align-items-center">
                        <label className="form-label">Region</label>
                        <div className="form-text">{viewContact.enrichment.region}</div>
                      </div>
                    )}
                    {viewContact.enrichment.city && (
                      <div className="form-group d-flex flex-row justify-content-between align-items-center">
                        <label className="form-label">City</label>
                        <div className="form-text">{viewContact.enrichment.city}</div>
                      </div>
                    )}
                    {viewContact.enrichment.domain && (
                      <div className="form-group d-flex flex-row justify-content-between align-items-center">
                        <label className="form-label">Domain</label>
                        <div className="form-text">{viewContact.enrichment.domain}</div>
                      </div>
                    )}
                    {viewContact.enrichment.company && (
                      <div className="form-group d-flex flex-row justify-content-between align-items-center">
                        <label className="form-label">Enriched Company</label>
                        <div className="form-text">{viewContact.enrichment.company}</div>
                      </div>
                    )}
                    {viewContact.enrichment.gender && (
                      <div className="form-group d-flex flex-row justify-content-between align-items-center">
                        <label className="form-label">Gender</label>
                        <div className="form-text">{viewContact.enrichment.gender}</div>
                      </div>
                    )}
                    {viewContact.enrichment.inferredAt && (
                      <div className="form-group d-flex flex-row justify-content-between align-items-center">
                        <label className="form-label">Enriched On</label>
                        <div className="form-text">
                          {new Date(viewContact.enrichment.inferredAt).toLocaleDateString()}
                          {viewContact.enrichment.source && ` (${viewContact.enrichment.source})`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps Section */}
              <div className="mb-2">
                <h3 className="text-lg font-medium mb-3 text-primary">Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group d-flex flex-row justify-content-between align-items-center">
                    <label className="form-label">Created At</label>
                    <div className="form-text">
                      {viewContact?.createdAt 
                        ? new Date(viewContact.createdAt).toLocaleDateString() 
                        : "-"}
                    </div>
                  </div>
                  <div className="form-group d-flex flex-row justify-content-between align-items-center">
                    <label className="form-label">Last Activity</label>
                    <div className="form-text">
                      {viewContact?.lastActivity 
                        ? new Date(viewContact.lastActivity).toLocaleDateString() 
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center p-4 border-t">
              <button className="modal-cancel-btn w-full sm:w-auto" onClick={() => setShowViewModal(false)}>
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
            File should include columns: Name, Email, Phone, Company
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