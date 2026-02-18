// src/pages/Dashboard/PlatformDashboard.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Line, Doughnut, Bar } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
} from "chart.js"
import {
    MdBusiness,
    MdPeople,
    MdPoll,
    MdTrendingUp,
    MdRefresh,
    MdCreditCard,
    MdAddBusiness,
    MdVerifiedUser,
    MdCalendarToday
} from "react-icons/md"
import { useNavigate } from "react-router-dom"
import { getPlatformDashboard } from "../../api/services/platformService"

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
)

const badgeColors = {
    success: "bg-[var(--success-light)] text-[var(--success-color)]",
    secondary: "bg-gray-100 dark:bg-gray-700 text-[var(--text-secondary)]",
    danger: "bg-[var(--danger-light)] text-[var(--danger-color)]",
    warning: "bg-[var(--warning-light)] text-[var(--warning-color)]",
    primary: "bg-[var(--primary-light)] text-[var(--primary-color)]",
}

const PlatformDashboard = ({ darkMode }) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState(null)

    const [stats, setStats] = useState({
        totalTenants: 0,
        totalUsers: 0,
        totalSurveys: 0,
        activeTenants: 0,
        activeUsers: 0,
        activeSurveys: 0,
        newTenantsThisMonth: 0,
        newUsersThisMonth: 0,
        newSurveysThisMonth: 0
    })

    const [subscriptions, setSubscriptions] = useState([])
    const [recentTenants, setRecentTenants] = useState([])
    const [trends, setTrends] = useState({ labels: [], tenants: [], users: [] })

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true)
            else setLoading(true)
            setError(null)

            const response = await getPlatformDashboard()

            if (response.success) {
                setStats(response.data.stats)
                setSubscriptions(response.data.subscriptions || [])
                setRecentTenants(response.data.recentTenants || [])
                setTrends(response.data.trends || { labels: [], tenants: [], users: [] })
            }
        } catch (err) {
            console.error("Platform dashboard error:", err)
            setError("Failed to load platform dashboard. Please try again.")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])

    const handleRefresh = () => {
        fetchDashboardData(true)
    }

    // Chart colors
    const chartColors = [
        "#0d6efd", "#198754", "#ffc107", "#dc3545", "#6f42c1", "#fd7e14", "#20c997"
    ]

    // Subscription chart data
    const subscriptionChartData = {
        labels: subscriptions.map(s => s.plan),
        datasets: [{
            data: subscriptions.map(s => s.count),
            backgroundColor: chartColors.slice(0, subscriptions.length),
            borderColor: darkMode ? "#1e293b" : "#ffffff",
            borderWidth: 2,
            hoverOffset: 8
        }]
    }

    // Growth trend chart data
    const growthChartData = {
        labels: trends.labels,
        datasets: [
            {
                label: "New Companies",
                data: trends.tenants,
                borderColor: "#0d6efd",
                backgroundColor: "rgba(13, 110, 253, 0.1)",
                fill: true,
                tension: 0.4
            },
            {
                label: "New Users",
                data: trends.users,
                borderColor: "#198754",
                backgroundColor: "rgba(25, 135, 84, 0.1)",
                fill: true,
                tension: 0.4
            }
        ]
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    color: darkMode ? "#e9ecef" : "#212529",
                    usePointStyle: true,
                    padding: 20
                }
            }
        },
        scales: {
            x: {
                ticks: { color: darkMode ? "#cbd5e0" : "#495057" },
                grid: { color: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }
            },
            y: {
                beginAtZero: true,
                ticks: { color: darkMode ? "#cbd5e0" : "#495057" },
                grid: { color: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }
            }
        }
    }

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: darkMode ? "#e9ecef" : "#212529",
                    usePointStyle: true,
                    padding: 15
                }
            }
        }
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        })
    }

    const getStatusBadge = (status) => {
        const variants = {
            active: "success",
            inactive: "secondary",
            suspended: "danger",
            pending: "warning"
        }
        const variant = variants[status] || "secondary"
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded ${badgeColors[variant]}`}>
                {status}
            </span>
        )
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
                            <MdBusiness size={28} />
                            Platform Overview
                        </h2>
                        <p className="text-[var(--text-secondary)]">
                            System-wide statistics and company management
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
                                       border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                       text-[var(--light-text)] dark:text-[var(--dark-text)]
                                       bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                                       hover:bg-[var(--light-hover)]/10 dark:hover:bg-[var(--dark-hover)]/10
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       transition-colors duration-300"
                        >
                            {refreshing ? (
                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <MdRefresh size={16} />
                            )}
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </button>
                        <button
                            onClick={() => navigate("/app/subscription/tenants")}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
                                       bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]
                                       text-white transition-colors duration-300"
                        >
                            <MdBusiness size={16} />
                            Manage Tenants
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div 
                    className="flex items-center gap-3 mb-6 p-4 rounded-md
                               bg-[var(--danger-light)] border border-[var(--danger-color)]
                               text-[var(--danger-color)]" 
                    role="alert"
                >
                    <span className="flex-1">{error}</span>
                    <button 
                        onClick={handleRefresh}
                        className="text-sm text-[var(--primary-color)] hover:underline font-medium
                                   bg-transparent border-0 cursor-pointer p-0 transition-colors duration-300"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[var(--text-secondary)] text-lg">Loading platform dashboard...</p>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Total Companies */}
                        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                                        rounded-md shadow-md p-6
                                        border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                        transition-all duration-300 hover:shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center justify-center w-12 h-12 rounded-md
                                                bg-[var(--primary-light)]">
                                    <MdBusiness className="text-[var(--primary-color)]" size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-[var(--success-color)] text-xs">
                                    <MdTrendingUp size={14} />
                                    <span>+{stats.newTenantsThisMonth}</span>
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
                                {stats.totalTenants}
                            </h3>
                            <p className="text-[var(--text-secondary)] text-sm">Total Companies</p>
                        </div>

                        {/* Total Users */}
                        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                                        rounded-md shadow-md p-6
                                        border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                        transition-all duration-300 hover:shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center justify-center w-12 h-12 rounded-md
                                                bg-[var(--success-light)]">
                                    <MdPeople className="text-[var(--success-color)]" size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-[var(--success-color)] text-xs">
                                    <MdTrendingUp size={14} />
                                    <span>+{stats.newUsersThisMonth}</span>
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
                                {stats.totalUsers.toLocaleString()}
                            </h3>
                            <p className="text-[var(--text-secondary)] text-sm">Total Users</p>
                        </div>

                        {/* Total Surveys */}
                        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                                        rounded-md shadow-md p-6
                                        border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                        transition-all duration-300 hover:shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center justify-center w-12 h-12 rounded-md
                                                bg-[var(--info-light)]">
                                    <MdPoll className="text-[var(--info-color)]" size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-[var(--success-color)] text-xs">
                                    <MdTrendingUp size={14} />
                                    <span>+{stats.newSurveysThisMonth}</span>
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
                                {stats.totalSurveys.toLocaleString()}
                            </h3>
                            <p className="text-[var(--text-secondary)] text-sm">Total Surveys</p>
                        </div>

                        {/* Active Subscriptions */}
                        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                                        rounded-md shadow-md p-6
                                        border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                        transition-all duration-300 hover:shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center justify-center w-12 h-12 rounded-md
                                                bg-[var(--warning-light)]">
                                    <MdCreditCard className="text-[var(--warning-color)]" size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-[var(--success-color)] text-xs">
                                    <MdVerifiedUser size={14} />
                                    <span>{stats.activeTenants}</span>
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
                                {subscriptions.length}
                            </h3>
                            <p className="text-[var(--text-secondary)] text-sm">Subscription Plans</p>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                        {/* Growth Trends */}
                        <div className="lg:col-span-2 bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                                        rounded-md shadow-md
                                        border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <div className="p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                <h5 className="flex items-center gap-2 text-lg font-semibold
                                               text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                    <MdTrendingUp size={20} />
                                    Growth Trends (Last 7 Days)
                                </h5>
                            </div>
                            <div className="p-6">
                                <div className="w-full h-80">
                                    <Line data={growthChartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>

                        {/* Subscription Distribution */}
                        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                                        rounded-md shadow-md
                                        border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <div className="p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                <h5 className="flex items-center gap-2 text-lg font-semibold
                                               text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                    <MdCreditCard size={20} />
                                    Subscription Distribution
                                </h5>
                            </div>
                            <div className="p-6">
                                {subscriptions.length > 0 ? (
                                    <div className="w-full h-80">
                                        <Doughnut data={subscriptionChartData} options={doughnutOptions} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <MdCreditCard size={48} className="text-[var(--text-secondary)] mb-3" />
                                        <p className="text-[var(--text-secondary)]">No subscription data</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Tenants */}
                    <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                                    rounded-md shadow-md
                                    border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <div className="flex items-center justify-between p-6 border-b
                                        border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <h5 className="flex items-center gap-2 text-lg font-semibold
                                           text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                <MdAddBusiness size={20} />
                                Recent Company Registrations
                            </h5>
                            <button
                                onClick={() => navigate("/app/subscription/tenants")}
                                className="text-sm text-[var(--primary-color)] hover:underline font-medium
                                           bg-transparent border-0 cursor-pointer p-0 transition-colors duration-300"
                            >
                                View All →
                            </button>
                        </div>
                        <div className="p-6">
                            {recentTenants.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <MdBusiness size={48} className="text-[var(--text-secondary)] mb-3" />
                                    <h6 className="text-lg font-medium text-[var(--text-secondary)]">
                                        No companies registered yet
                                    </h6>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-collapse">
                                        <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                                            <tr>
                                                <th className="p-3 text-left text-sm font-semibold
                                                               text-[var(--light-text)] dark:text-[var(--dark-text)]
                                                               border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                    Company Name
                                                </th>
                                                <th className="hidden md:table-cell p-3 text-left text-sm font-semibold
                                                               text-[var(--light-text)] dark:text-[var(--dark-text)]
                                                               border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                    Industry
                                                </th>
                                                <th className="p-3 text-left text-sm font-semibold
                                                               text-[var(--light-text)] dark:text-[var(--dark-text)]
                                                               border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                    Plan
                                                </th>
                                                <th className="p-3 text-left text-sm font-semibold
                                                               text-[var(--light-text)] dark:text-[var(--dark-text)]
                                                               border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                    Status
                                                </th>
                                                <th className="hidden lg:table-cell p-3 text-left text-sm font-semibold
                                                               text-[var(--light-text)] dark:text-[var(--dark-text)]
                                                               border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                    Registered
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentTenants.map((tenant) => (
                                                <tr key={tenant.id}
                                                    className="hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]
                                                               transition-colors duration-200">
                                                    <td className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                        <div className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                                            {tenant.name}
                                                        </div>
                                                    </td>
                                                    <td className="hidden md:table-cell p-3 border-b
                                                                   border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                        <span className="text-[var(--text-secondary)]">{tenant.industry}</span>
                                                    </td>
                                                    <td className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium
                                                                         ${badgeColors.primary}`}>
                                                            {tenant.plan}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                        {getStatusBadge(tenant.status)}
                                                    </td>
                                                    <td className="hidden lg:table-cell p-3 border-b
                                                                   border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                        <span className="flex items-center gap-1 text-[var(--text-secondary)] text-sm">
                                                            <MdCalendarToday size={14} />
                                                            {formatDate(tenant.registeredAt)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default PlatformDashboard
