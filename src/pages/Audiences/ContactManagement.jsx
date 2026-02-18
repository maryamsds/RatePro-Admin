"use client"
import { useState, useEffect, useRef } from "react"
import { MdContacts, MdAdd, MdRefresh, MdSearch, MdFilterAlt, MdUpload, MdDownload, MdVisibility, MdEdit, MdEmail, MdDelete, MdSettings, MdPeople, MdCheckCircle, MdTrendingUp, MdLabel, MdMoreVert } from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
// react-bootstrap removed — using native HTML + Tailwind CSS
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
      <div className="flex items-center justify-center min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Loading contacts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] p-4 md:p-6">
      {/* Page Header */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
              <MdContacts className="text-2xl text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Contact Management</h1>
              <p className="text-sm text-[var(--text-secondary)]">Manage your survey contacts and audience lists</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] flex items-center gap-2" onClick={() => { fetchContacts(); }}>
              <MdRefresh /> Refresh
            </button>
            {(currentUser?.role === "companyAdmin" || memberCanUpload) && (
              <button
                type="button"
                onClick={handleShow}
                disabled={!memberCanUpdate}
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdUpload /> Import Contacts
              </button>
            )}

            <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2" onClick={handleCreateContact}>
              <MdAdd /> Add Contact
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
              <MdPeople className="text-2xl text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{contacts.length}</p>
              <p className="text-sm text-[var(--text-secondary)]">Total Contacts</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
              <MdCheckCircle className="text-2xl text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{activeContacts}</p>
              <p className="text-sm text-[var(--text-secondary)]">Active Contacts</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center">
              <MdContacts className="text-2xl text-cyan-500" />
            </div>
            {/* <div>
              <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{totalSegments}</p>
              <p className="text-sm text-[var(--text-secondary)]">Segments</p>
            </div> */}
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
              <MdTrendingUp className="text-2xl text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{recentContacts}</p>
              <p className="text-sm text-[var(--text-secondary)]">Recent Activity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* <div>
            <select
              className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
          <div>
            <select
              className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
            <div className="relative">
              <button
                className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] flex items-center justify-center gap-2"
                onClick={() => setShowBulkActions(!showBulkActions)}
              >
                <MdMoreVert /> Actions ({selectedContacts.length})
              </button>
              {showBulkActions && (
                <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md shadow-lg overflow-hidden">
                  <button className="w-full px-4 py-2 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors flex items-center gap-2">
                    <MdEmail /> Send Survey
                  </button>
                  <button className="w-full px-4 py-2 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors flex items-center gap-2">
                    <MdLabel /> Add Tags
                  </button>
                  {/* <button className="w-full px-4 py-2 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors flex items-center gap-2">
                    <MdFilterAlt /> Add to Segment
                  </button> */}
                  <div className="border-t border-[var(--light-border)] dark:border-[var(--dark-border)]"></div>
                  <button className="w-full px-4 py-2 text-left text-[var(--danger-color)] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2" onClick={handleBulkDelete}>
                    <MdDelete /> Delete Selected
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contacts Table Section */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div>
            <h2 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Contacts List</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {pagination.total} {pagination.total === 1 ? 'contact' : 'contacts'} found
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <tr>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]"
                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Name</th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Email</th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold hidden sm:table-cell">Phone</th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold hidden md:table-cell">Company</th>
                {/* <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold hidden lg:table-cell">Segment</th> */}
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold hidden xl:table-cell">Status</th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
              {contacts.map((contact) => (
                <tr key={contact._id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]"
                      checked={selectedContacts.includes(contact._id)}
                      onChange={() => handleSelectContact(contact._id)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <div className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{contact.name}</div>
                      {(Array.isArray(contact.tags) || typeof contact.tags === "string") && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(Array.isArray(contact.tags)
                            ? contact.tags
                            : contact.tags.split(",")).map((tag) => {
                              const cleanTag = (tag || "").trim();
                              return cleanTag ? (
                                <span key={cleanTag} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                  {cleanTag}
                                </span>
                              ) : null;
                            })}
                        </div>
                      )}
                      {contact.autoTags?.length ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {contact.autoTags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{contact.email}</div>
                    {contact.enrichment?.domain || contact.enrichment?.country ? (
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        {contact.enrichment?.domain ? `Domain: ${contact.enrichment.domain}` : ""}
                        {contact.enrichment?.domain && contact.enrichment?.country ? " · " : ""}
                        {contact.enrichment?.country ? `Country: ${contact.enrichment.country}` : ""}
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)] hidden sm:table-cell">
                    {contact.phone}
                  </td>
                  <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)] hidden md:table-cell">
                    {contact.company}
                  </td>
                  {/* <td className="p-3 hidden lg:table-cell">
                    <span className="px-3 py-1 text-xs rounded-full bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      {contact.segment?._id ? contact.segment.name : 'Unassigned'}
                    </span>
                  </td> */}
                  <td className="p-3 hidden xl:table-cell">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      contact.status.toLowerCase() === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : contact.status.toLowerCase() === 'inactive'
                        ? 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button className="p-2 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" title="View" onClick={() => handleView(contact)}>
                        <MdVisibility />
                      </button>
                      <button className="p-2 rounded-md text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors" title="Edit" onClick={() => handleEdit(contact)}>
                        <MdEdit />
                      </button>
                      <button className="p-2 rounded-md text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors" title="Send Survey">
                        <MdEmail />
                      </button>
                      <button
                        className="p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
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

        <div className="p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end p-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] text-2xl text-[var(--light-text)] dark:text-[var(--dark-text)]" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="p-6 pt-0">
              <h2 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-4">
                {modalMode === 'create' ? 'Add Contact' : 'Edit Contact'}
              </h2>
              <form className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="Enter contact name"
                    value={currentContact.name}
                    onChange={(e) => setCurrentContact({ ...currentContact, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="Enter email address"
                    value={currentContact.email}
                    onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="Enter phone number"
                    value={currentContact.phone}
                    onChange={(e) => setCurrentContact({ ...currentContact, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Company</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="Enter company name"
                    value={currentContact.company}
                    onChange={(e) => setCurrentContact({ ...currentContact, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Contact Categories</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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

                {/* <div>
                  <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Segment</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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

                <div>
                  <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="Enter tags, separated by commas"
                    value={currentContact.tags}
                    onChange={(e) => setCurrentContact({ ...currentContact, tags: e.target.value })}
                  />
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Auto-tags are added by the system; enter only manual tags here.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-6 pt-0 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] flex items-center justify-center gap-2" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center justify-center gap-2" onClick={handleSaveContact}>
                {modalMode === 'create' ? <MdAdd /> : <MdEdit />} {modalMode === 'create' ? 'Add' : 'Update'} Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Contact Modal */}
      {showViewModal && viewContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] sticky top-0 bg-[var(--light-card)] dark:bg-[var(--dark-card)] z-10">
              <h2 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Contact Details</h2>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] text-2xl text-[var(--light-text)] dark:text-[var(--dark-text)]" onClick={() => setShowViewModal(false)}>
                ×
              </button>
            </div>
            <div className="p-6">
              {/* Basic Info Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-[var(--primary-color)]">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Name</label>
                    <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{viewContact?.name || "-"}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Email</label>
                    <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{viewContact?.email || "-"}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Phone</label>
                    <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{viewContact?.phone || "-"}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Company</label>
                    <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{viewContact?.company || "-"}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Status</label>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      viewContact?.status?.toLowerCase() === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : viewContact?.status?.toLowerCase() === 'inactive'
                        ? 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {viewContact?.status || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Categories & Tags Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-[var(--primary-color)]">Categories & Tags</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Contact Categories</label>
                    <div className="flex flex-wrap gap-1">
                      {viewContact?.contactCategories?.length > 0 ? (
                        viewContact.contactCategories.map((cat) => (
                          <span key={cat?._id || cat} className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                            {cat?.name || cat}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-[var(--text-secondary)]">No categories</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Manual Tags</label>
                    <div className="flex flex-wrap gap-1">
                      {viewContact?.tags?.length > 0 ? (
                        (Array.isArray(viewContact.tags) ? viewContact.tags : viewContact.tags.split(","))
                          .map((tag) => tag.trim())
                          .filter(Boolean)
                          .map((tag) => (
                            <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {tag}
                            </span>
                          ))
                      ) : (
                        <span className="text-sm text-[var(--text-secondary)]">No tags</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Auto Tags</label>
                    <div className="flex flex-wrap gap-1">
                      {viewContact?.autoTags?.length > 0 ? (
                        viewContact.autoTags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-[var(--text-secondary)]">No auto tags</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Survey Stats Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-[var(--primary-color)]">Survey Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-3 text-center">
                    <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{viewContact?.surveyStats?.invitedCount ?? 0}</div>
                    <div className="text-xs text-[var(--text-secondary)]">Invites Sent</div>
                  </div>
                  <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-3 text-center">
                    <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{viewContact?.surveyStats?.respondedCount ?? 0}</div>
                    <div className="text-xs text-[var(--text-secondary)]">Responses</div>
                  </div>
                  <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-3 text-center">
                    <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      {viewContact?.surveyStats?.latestNpsScore !== undefined
                        ? viewContact.surveyStats.latestNpsScore
                        : "-"}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">Latest NPS</div>
                  </div>
                  <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-3 text-center">
                    <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      {viewContact?.surveyStats?.avgNpsScore !== undefined
                        ? viewContact.surveyStats.avgNpsScore.toFixed(1)
                        : "-"}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">Avg NPS</div>
                  </div>
                  <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-3 text-center">
                    <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      {viewContact?.surveyStats?.latestRating !== undefined
                        ? `${viewContact.surveyStats.latestRating}/5`
                        : "-"}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">Latest Rating</div>
                  </div>
                  <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-3 text-center">
                    <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      {viewContact?.surveyStats?.avgRating !== undefined
                        ? `${viewContact.surveyStats.avgRating.toFixed(1)}/5`
                        : "-"}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">Avg Rating</div>
                  </div>
                  <div className="col-span-2 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-3 text-center">
                    <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      {viewContact?.surveyStats?.npsCategory ? (
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          viewContact.surveyStats.npsCategory === 'promoter'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : viewContact.surveyStats.npsCategory === 'passive'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          {viewContact.surveyStats.npsCategory.charAt(0).toUpperCase() +
                            viewContact.surveyStats.npsCategory.slice(1)}
                        </span>
                      ) : "-"}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">NPS Category</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Last Invited</label>
                    <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      {viewContact?.surveyStats?.lastInvitedDate
                        ? new Date(viewContact.surveyStats.lastInvitedDate).toLocaleDateString()
                        : "-"}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Last Response</label>
                    <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
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
                  <h3 className="text-lg font-medium mb-3 text-[var(--primary-color)]">Enrichment Data</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {viewContact.enrichment.country && (
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Country</label>
                        <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          {viewContact.enrichment.country}
                          {viewContact.enrichment.countryCode && ` (${viewContact.enrichment.countryCode})`}
                        </div>
                      </div>
                    )}
                    {viewContact.enrichment.region && (
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Region</label>
                        <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{viewContact.enrichment.region}</div>
                      </div>
                    )}
                    {viewContact.enrichment.city && (
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">City</label>
                        <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{viewContact.enrichment.city}</div>
                      </div>
                    )}
                    {viewContact.enrichment.domain && (
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Domain</label>
                        <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{viewContact.enrichment.domain}</div>
                      </div>
                    )}
                    {viewContact.enrichment.company && (
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Enriched Company</label>
                        <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{viewContact.enrichment.company}</div>
                      </div>
                    )}
                    {viewContact.enrichment.gender && (
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Gender</label>
                        <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{viewContact.enrichment.gender}</div>
                      </div>
                    )}
                    {viewContact.enrichment.inferredAt && (
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Enriched On</label>
                        <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
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
                <h3 className="text-lg font-medium mb-3 text-[var(--primary-color)]">Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Created At</label>
                    <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      {viewContact?.createdAt
                        ? new Date(viewContact.createdAt).toLocaleDateString()
                        : "-"}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Last Activity</label>
                    <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      {viewContact?.lastActivity
                        ? new Date(viewContact.lastActivity).toLocaleDateString()
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] w-full sm:w-auto" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleClose}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] m-0">Import Contacts</h5>
              <button type="button" onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] text-2xl text-[var(--light-text)] dark:text-[var(--dark-text)]">
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              <p className="text-center text-[var(--light-text)] dark:text-[var(--dark-text)] mb-3">
                Upload a .xlsx or .xls file with your contacts
              </p>
              <input
                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                type="file"
                accept=".xlsx,.xls"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <small className="text-[var(--text-secondary)] block mt-2">
                File should include columns: Name, Email, Phone, Company
              </small>

              {(currentUser?.role === "companyAdmin" || memberCanDownload) && (
                <div className="mt-3">
                  <a
                    href="/downloads/contact-sample.xlsx"
                    download="contact-sample.xlsx"
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors text-sm"
                  >
                    📥 Download Template
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleBulkUploadContacts(file)}
                disabled={!file || loading}
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--success-color)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Importing..." : "Import Contacts"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default ContactManagement