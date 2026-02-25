// src/pages/Platform/ProfileUpdateRequests.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import {
    MdSearch,
    MdRefresh,
    MdCheckCircle,
    MdCancel,
    MdVisibility,
    MdBusiness,
    MdPerson,
    MdCalendarToday,
    MdArrowBack,
    MdArrowForward,
    MdClose,
    MdCompareArrows,
    MdInfo,
} from "react-icons/md"
import axiosInstance from "../../api/axiosInstance"
import Swal from "sweetalert2"

/* ─── field label map ─── */
const FIELD_LABELS = {
    name: "Company Name",
    address: "Address",
    contactEmail: "Contact Email",
    contactPhone: "Contact Phone",
    website: "Website",
    totalEmployees: "Total Employees",
}

/* ─── status badge ─── */
const StatusBadge = ({ status }) => {
    const cfg = {
        pending: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", label: "Pending" },
        approved: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", label: "Approved" },
        rejected: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "Rejected" },
    }
    const c = cfg[status] || cfg.pending
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
            {c.label}
        </span>
    )
}

/* ─── main component ─── */
const ProfileUpdateRequests = () => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState("")
    const [reviewModal, setReviewModal] = useState(null) // holds the request being reviewed
    const [reviewNote, setReviewNote] = useState("")
    const [actionLoading, setActionLoading] = useState(false)
    const limit = 10

    /* ─── fetch ─── */
    const fetchRequests = useCallback(async () => {
        setLoading(true)
        try {
            const res = await axiosInstance.get("/platform/profile-updates/pending", {
                params: { page, limit },
            })
            const data = res.data?.data || res.data
            setRequests(data.requests || [])
            setTotal(data.total || 0)
            setTotalPages(data.totalPages || 1)
        } catch (err) {
            console.error("Failed to fetch profile update requests", err)
            Swal.fire({ icon: "error", title: "Error", text: "Could not load profile update requests." })
        } finally {
            setLoading(false)
        }
    }, [page])

    useEffect(() => {
        fetchRequests()
    }, [fetchRequests])

    /* ─── approve / reject ─── */
    const handleReview = async (action) => {
        if (!reviewModal) return
        setActionLoading(true)
        try {
            await axiosInstance.patch(`/platform/profile-updates/${reviewModal._id}`, {
                action,
                reviewNote: reviewNote.trim() || undefined,
            })
            Swal.fire({
                icon: "success",
                title: action === "approve" ? "Approved" : "Rejected",
                text: `Request has been ${action === "approve" ? "approved" : "rejected"} successfully.`,
                timer: 2000,
                showConfirmButton: false,
            })
            setReviewModal(null)
            setReviewNote("")
            fetchRequests()
        } catch (err) {
            console.error("Review action failed", err)
            Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Action failed." })
        } finally {
            setActionLoading(false)
        }
    }

    /* ─── filtered rows ─── */
    const filtered = requests.filter((r) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        const tenantName = (r.tenant?.name || "").toLowerCase()
        const requesterName = (r.requestedBy?.name || "").toLowerCase()
        const requesterEmail = (r.requestedBy?.email || "").toLowerCase()
        return tenantName.includes(q) || requesterName.includes(q) || requesterEmail.includes(q)
    })

    /* ─── helper: changed fields summary ─── */
    const changedFieldsList = (proposed) => {
        if (!proposed) return "—"
        return Object.keys(proposed)
            .map((k) => FIELD_LABELS[k] || k)
            .join(", ")
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* ── header ── */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] flex items-center gap-2">
                    <MdBusiness className="text-[var(--primary-color)]" />
                    Profile Update Requests
                </h1>
                <p className="text-sm text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] mt-1">
                    Review and manage company profile change requests from tenants.
                </p>
            </div>

            {/* ── toolbar ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="relative w-full sm:w-80">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]" />
                    <input
                        type="text"
                        placeholder="Search by tenant or requester…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]">
                        {total} pending request{total !== 1 ? "s" : ""}
                    </span>
                    <button
                        onClick={() => { setPage(1); fetchRequests() }}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--primary-light)] transition-colors cursor-pointer"
                    >
                        <MdRefresh /> Refresh
                    </button>
                </div>
            </div>

            {/* ── table ── */}
            <div className="rounded-xl border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]">
                        <MdInfo className="mx-auto text-4xl mb-2 opacity-40" />
                        <p className="text-sm">{search ? "No requests match your search." : "No pending requests."}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                                    <th className="text-left px-4 py-3 font-semibold text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]">Tenant</th>
                                    <th className="text-left px-4 py-3 font-semibold text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]">Requested By</th>
                                    <th className="text-left px-4 py-3 font-semibold text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]">Fields Changed</th>
                                    <th className="text-left px-4 py-3 font-semibold text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]">Date</th>
                                    <th className="text-left px-4 py-3 font-semibold text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]">Status</th>
                                    <th className="text-right px-4 py-3 font-semibold text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((req) => (
                                    <tr
                                        key={req._id}
                                        className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <MdBusiness className="text-[var(--primary-color)] flex-shrink-0" />
                                                <span className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                                    {req.tenant?.name || "Unknown Tenant"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <MdPerson className="text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] flex-shrink-0" />
                                                <div>
                                                    <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{req.requestedBy?.name || "—"}</p>
                                                    <p className="text-xs text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]">{req.requestedBy?.email || ""}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[var(--light-text)] dark:text-[var(--dark-text)] max-w-[200px] truncate" title={changedFieldsList(req.proposedChanges)}>
                                            {changedFieldsList(req.proposedChanges)}
                                        </td>
                                        <td className="px-4 py-3 text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <MdCalendarToday className="text-xs" />
                                                {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => { setReviewModal(req); setReviewNote("") }}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--primary-color)] text-white text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                                            >
                                                <MdVisibility /> Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── pagination ── */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <span className="text-xs text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="p-1.5 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] disabled:opacity-40 hover:bg-[var(--primary-light)] transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                <MdArrowBack />
                            </button>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="p-1.5 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] disabled:opacity-40 hover:bg-[var(--primary-light)] transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                <MdArrowForward />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── review modal ── */}
            {reviewModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <div>
                                <h2 className="text-lg font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] flex items-center gap-2">
                                    <MdCompareArrows className="text-[var(--primary-color)]" />
                                    Review Change Request
                                </h2>
                                <p className="text-xs text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] mt-0.5">
                                    {reviewModal.tenant?.name || "Unknown Tenant"} · Requested by {reviewModal.requestedBy?.name || "Unknown"}
                                </p>
                            </div>
                            <button
                                onClick={() => setReviewModal(null)}
                                className="p-2 rounded-lg hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors cursor-pointer"
                            >
                                <MdClose className="text-xl" />
                            </button>
                        </div>

                        {/* comparison table */}
                        <div className="px-6 py-4">
                            <div className="rounded-xl border border-[var(--light-border)] dark:border-[var(--dark-border)] overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                                            <th className="text-left px-4 py-2.5 font-semibold text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]">Field</th>
                                            <th className="text-left px-4 py-2.5 font-semibold text-red-500">Current</th>
                                            <th className="text-left px-4 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400">Proposed</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(reviewModal.proposedChanges || {}).map(([field, proposed]) => {
                                            const current = reviewModal.currentValues?.[field] ?? "—"
                                            const changed = String(current) !== String(proposed)
                                            return (
                                                <tr key={field} className={`border-t border-[var(--light-border)] dark:border-[var(--dark-border)] ${changed ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}>
                                                    <td className="px-4 py-2.5 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                                        {FIELD_LABELS[field] || field}
                                                    </td>
                                                    <td className={`px-4 py-2.5 ${changed ? "text-red-600 dark:text-red-400 line-through" : "text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]"}`}>
                                                        {current || "—"}
                                                    </td>
                                                    <td className={`px-4 py-2.5 ${changed ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]"}`}>
                                                        {proposed || "—"}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* reviewer note */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1.5">
                                    Reviewer Note <span className="text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] font-normal">(optional)</span>
                                </label>
                                <textarea
                                    value={reviewNote}
                                    onChange={(e) => setReviewNote(e.target.value)}
                                    placeholder="Add a note for the requester (shown on rejection)…"
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 resize-none"
                                />
                            </div>

                            {/* request meta */}
                            <div className="mt-3 flex items-center gap-4 text-xs text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]">
                                <span className="flex items-center gap-1">
                                    <MdCalendarToday />
                                    Submitted: {new Date(reviewModal.createdAt).toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MdPerson />
                                    {reviewModal.requestedBy?.email || "—"}
                                </span>
                            </div>
                        </div>

                        {/* modal footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <button
                                onClick={() => setReviewModal(null)}
                                disabled={actionLoading}
                                className="px-4 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReview("reject")}
                                disabled={actionLoading}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <MdCancel /> {actionLoading ? "Processing…" : "Reject"}
                            </button>
                            <button
                                onClick={() => handleReview("approve")}
                                disabled={actionLoading}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <MdCheckCircle /> {actionLoading ? "Processing…" : "Approve"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfileUpdateRequests
