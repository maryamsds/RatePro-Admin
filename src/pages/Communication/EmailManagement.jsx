// src\pages\Communication\EmailManagement.jsx

"use client"

import { useState, useEffect, useRef } from "react"
import {
  MdEmail,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdSend,
  MdRefresh,
  MdSchedule,
  MdPeople,
  MdTrendingUp,
  MdOpenInNew,
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"

const EmailManagement = () => {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      const allEmails = [
        {
          id: 1,
          subject: "Survey Invitation - Customer Satisfaction Q4",
          recipient: "customers@company.com",
          status: "Sent",
          sentDate: "2024-01-20 14:30",
          openRate: 78,
          clickRate: 45,
          template: "Survey Invitation",
          campaign: "Q4 Customer Feedback",
        },
        {
          id: 2,
          subject: "Reminder: Complete Your Product Feedback Survey",
          recipient: "users@platform.com",
          status: "Scheduled",
          sentDate: "2024-01-22 09:00",
          openRate: 0,
          clickRate: 0,
          template: "Survey Reminder",
          campaign: "Product Feedback",
        },
        {
          id: 3,
          subject: "Thank You for Your Survey Response",
          recipient: "respondents@survey.com",
          status: "Sent",
          sentDate: "2024-01-19 16:45",
          openRate: 92,
          clickRate: 23,
          template: "Thank You",
          campaign: "Employee Engagement",
        },
        {
          id: 4,
          subject: "New Survey Available - Market Research Study",
          recipient: "participants@research.com",
          status: "Draft",
          sentDate: null,
          openRate: 0,
          clickRate: 0,
          template: "Survey Announcement",
          campaign: "Market Research",
        },
        {
          id: 5,
          subject: "Survey Results Summary - Brand Awareness",
          recipient: "stakeholders@company.com",
          status: "Sent",
          sentDate: "2024-01-18 11:20",
          openRate: 85,
          clickRate: 67,
          template: "Results Summary",
          campaign: "Brand Awareness",
        },
        {
          id: 6,
          subject: "Follow-up Survey - Website Usability",
          recipient: "testers@website.com",
          status: "Failed",
          sentDate: "2024-01-17 13:15",
          openRate: 0,
          clickRate: 0,
          template: "Follow-up Survey",
          campaign: "Website Testing",
        },
        {
          id: 7,
          subject: "Survey Completion Incentive Notification",
          recipient: "participants@incentive.com",
          status: "Sent",
          sentDate: "2024-01-16 10:30",
          openRate: 94,
          clickRate: 78,
          template: "Incentive Notification",
          campaign: "Training Effectiveness",
        },
        {
          id: 8,
          subject: "Monthly Survey Newsletter - January 2024",
          recipient: "subscribers@newsletter.com",
          status: "Scheduled",
          sentDate: "2024-01-25 08:00",
          openRate: 0,
          clickRate: 0,
          template: "Newsletter",
          campaign: "Monthly Updates",
        },
      ]
      setEmails(allEmails)
      setPagination((prev) => ({ ...prev, total: allEmails.length }))
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status) => {
    const colors = {
      Sent: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      Draft: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
      Scheduled: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      Failed: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}>
        {status}
      </span>
    )
  }

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.recipient.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || email.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const currentEmails = filteredEmails.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  )

  const handleDelete = (email) => {
    setSelectedEmail(email)
    setShowDeleteModal(true)
    setOpenDropdownId(null)
  }

  const confirmDelete = () => {
    setEmails(emails.filter((e) => e.id !== selectedEmail.id))
    setShowDeleteModal(false)
    setSelectedEmail(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ height: "50vh" }}>
        <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="py-4 px-3">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <MdEmail size={32} style={{ color: "var(--primary-color)" }} />
            <div>
              <h2 className="mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)] text-2xl font-bold">Email Management</h2>
              <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mb-0 text-sm">Manage email campaigns and communications</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white flex items-center gap-1">
              <MdRefresh />
              Refresh
            </button>
            <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:opacity-90 flex items-center gap-1">
              <MdAdd />
              Compose Email
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]" style={{ borderLeft: "4px solid var(--primary-color)" }}>
          <div className="flex items-center">
            <div className="flex-grow">
              <div className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 text-sm mb-1">Total Emails</div>
              <div className="text-[var(--light-text)] dark:text-[var(--dark-text)] text-2xl font-bold">{emails.length}</div>
            </div>
            <MdEmail size={24} style={{ color: "var(--primary-color)" }} />
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]" style={{ borderLeft: "4px solid var(--success-color)" }}>
          <div className="flex items-center">
            <div className="flex-grow">
              <div className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 text-sm mb-1">Sent Emails</div>
              <div className="text-[var(--light-text)] dark:text-[var(--dark-text)] text-2xl font-bold">
                {emails.filter((e) => e.status === "Sent").length}
              </div>
            </div>
            <MdSend size={24} style={{ color: "var(--success-color)" }} />
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]" style={{ borderLeft: "4px solid var(--warning-color)" }}>
          <div className="flex items-center">
            <div className="flex-grow">
              <div className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 text-sm mb-1">Scheduled</div>
              <div className="text-[var(--light-text)] dark:text-[var(--dark-text)] text-2xl font-bold">
                {emails.filter((e) => e.status === "Scheduled").length}
              </div>
            </div>
            <MdSchedule size={24} style={{ color: "var(--warning-color)" }} />
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]" style={{ borderLeft: "4px solid var(--info-color)" }}>
          <div className="flex items-center">
            <div className="flex-grow">
              <div className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 text-sm mb-1">Avg Open Rate</div>
              <div className="text-[var(--light-text)] dark:text-[var(--dark-text)] text-2xl font-bold">
                {Math.round(
                  emails.filter((e) => e.openRate > 0).reduce((sum, e) => sum + e.openRate, 0) /
                  emails.filter((e) => e.openRate > 0).length || 0,
                )}
                %
              </div>
            </div>
            <MdTrendingUp size={24} style={{ color: "var(--info-color)" }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-6 lg:col-span-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
                <MdSearch className="text-[var(--light-text)] dark:text-[var(--dark-text)]" />
                <input
                  type="text"
                  className="flex-1 bg-transparent border-none outline-none text-[var(--light-text)] dark:text-[var(--dark-text)] placeholder:text-[var(--light-text)] placeholder:dark:text-[var(--dark-text)] placeholder:opacity-50"
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="md:col-span-3 lg:col-span-2">
              <select
                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="sent">Sent</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="md:col-span-3 lg:col-span-2">
              <button className="w-full px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] flex items-center justify-center gap-1">
                <MdFilterList />
                More Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emails Table */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <tr>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">
                  <div className="flex items-center gap-2">
                    <MdEmail size={16} />
                    Subject
                  </div>
                </th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">
                  <div className="flex items-center gap-2">
                    <MdPeople size={16} />
                    Recipient
                  </div>
                </th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Status</th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Sent Date</th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Open Rate</th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Click Rate</th>
                <th className="p-3 text-center text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
              {currentEmails.map((email) => (
                <tr key={email.id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                  <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    <div>
                      <div className="font-medium mb-1">
                        {email.subject}
                      </div>
                      <div className="text-sm opacity-70">{email.campaign}</div>
                    </div>
                  </td>
                  <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    {email.recipient}
                  </td>
                  <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{getStatusBadge(email.status)}</td>
                  <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    {email.sentDate || "Not sent"}
                  </td>
                  <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    {email.openRate}%
                  </td>
                  <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    {email.clickRate}%
                  </td>
                  <td className="p-3 text-center text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    <div className="relative inline-block" ref={openDropdownId === email.id ? dropdownRef : null}>
                      <button
                        className="p-0 border-none bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] cursor-pointer hover:opacity-70 transition-opacity"
                        onClick={() => setOpenDropdownId(openDropdownId === email.id ? null : email.id)}
                      >
                        <MdMoreVert />
                      </button>
                      {openDropdownId === email.id && (
                        <div className="absolute right-0 top-full mt-1 bg-[var(--light-card)] dark:bg-[var(--dark-card)] shadow-lg rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] py-1 min-w-[160px] z-50">
                          <button className="w-full text-left flex items-center gap-2 px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors border-none bg-transparent" onClick={() => setOpenDropdownId(null)}>
                            <MdOpenInNew />
                            View
                          </button>
                          <button className="w-full text-left flex items-center gap-2 px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors border-none bg-transparent" onClick={() => setOpenDropdownId(null)}>
                            <MdEdit />
                            Edit
                          </button>
                          <button className="w-full text-left flex items-center gap-2 px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors border-none bg-transparent" onClick={() => setOpenDropdownId(null)}>
                            <MdSend />
                            Resend
                          </button>
                          <hr className="my-1 border-[var(--light-border)] dark:border-[var(--dark-border)]" />
                          <button
                            className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors border-none bg-transparent"
                            style={{ color: "var(--danger-color)" }}
                            onClick={() => handleDelete(email)}
                          >
                            <MdDelete />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <Pagination
            current={pagination.page}
            total={filteredEmails.length}
            limit={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowDeleteModal(false)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg max-w-md w-full border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="flex justify-between items-center p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <h5 className="text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold text-lg mb-0">Confirm Delete</h5>
                <button 
                  className="text-[var(--light-text)] dark:text-[var(--dark-text)] hover:opacity-70 transition-opacity text-2xl leading-none border-none bg-transparent cursor-pointer"
                  onClick={() => setShowDeleteModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="p-4 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                Are you sure you want to delete "{selectedEmail?.subject}"? This action cannot be undone.
              </div>
              <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <button 
                  className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 rounded-md font-medium transition-colors text-white hover:opacity-90"
                  style={{ backgroundColor: "var(--danger-color)" }}
                  onClick={confirmDelete}
                >
                  Delete Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailManagement
