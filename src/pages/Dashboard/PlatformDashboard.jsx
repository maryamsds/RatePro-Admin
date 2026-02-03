// src/pages/Dashboard/PlatformDashboard.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Container, Row, Col, Card, Button, Table, Badge, Spinner } from "react-bootstrap"
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
        return <Badge bg={variants[status] || "secondary"}>{status}</Badge>
    }

    return (
        <Container fluid className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                    <div>
                        <h2>
                            <MdBusiness size={28} className="me-2" style={{ marginBottom: "4px" }} />
                            Platform Overview
                        </h2>
                        <p>System-wide statistics and company management</p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            {refreshing ? (
                                <Spinner animation="border" size="sm" className="me-1" />
                            ) : (
                                <MdRefresh size={16} className="me-1" />
                            )}
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/app/subscription/tenants")}
                        >
                            <MdBusiness size={16} className="me-1" />
                            Manage Tenants
                        </Button>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                    <span>{error}</span>
                    <Button variant="link" className="ms-auto p-0" onClick={handleRefresh}>
                        Try Again
                    </Button>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Loading platform dashboard...</p>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <Row className="g-3 mb-4">
                        {/* Total Companies */}
                        <Col xl={3} lg={6} md={6} xs={12}>
                            <div className="stats-card">
                                <div className="stats-card-header">
                                    <div className="stats-icon icon-primary">
                                        <MdBusiness />
                                    </div>
                                    <div className="stats-trend trend-up">
                                        <MdTrendingUp size={14} />
                                        <span>+{stats.newTenantsThisMonth} this month</span>
                                    </div>
                                </div>
                                <div className="stats-card-body">
                                    <h3>{stats.totalTenants}</h3>
                                    <p>Total Companies</p>
                                </div>
                            </div>
                        </Col>

                        {/* Total Users */}
                        <Col xl={3} lg={6} md={6} xs={12}>
                            <div className="stats-card">
                                <div className="stats-card-header">
                                    <div className="stats-icon icon-success">
                                        <MdPeople />
                                    </div>
                                    <div className="stats-trend trend-up">
                                        <MdTrendingUp size={14} />
                                        <span>+{stats.newUsersThisMonth} this month</span>
                                    </div>
                                </div>
                                <div className="stats-card-body">
                                    <h3>{stats.totalUsers.toLocaleString()}</h3>
                                    <p>Total Users</p>
                                </div>
                            </div>
                        </Col>

                        {/* Total Surveys */}
                        <Col xl={3} lg={6} md={6} xs={12}>
                            <div className="stats-card">
                                <div className="stats-card-header">
                                    <div className="stats-icon icon-info">
                                        <MdPoll />
                                    </div>
                                    <div className="stats-trend trend-up">
                                        <MdTrendingUp size={14} />
                                        <span>+{stats.newSurveysThisMonth} this month</span>
                                    </div>
                                </div>
                                <div className="stats-card-body">
                                    <h3>{stats.totalSurveys.toLocaleString()}</h3>
                                    <p>Total Surveys</p>
                                </div>
                            </div>
                        </Col>

                        {/* Active Subscriptions */}
                        <Col xl={3} lg={6} md={6} xs={12}>
                            <div className="stats-card">
                                <div className="stats-card-header">
                                    <div className="stats-icon icon-warning">
                                        <MdCreditCard />
                                    </div>
                                    <div className="stats-trend trend-up">
                                        <MdVerifiedUser size={14} />
                                        <span>{stats.activeTenants} active</span>
                                    </div>
                                </div>
                                <div className="stats-card-body">
                                    <h3>{subscriptions.length}</h3>
                                    <p>Subscription Plans</p>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {/* Charts Row */}
                    <Row className="g-3 mb-4">
                        {/* Growth Trends */}
                        <Col lg={8}>
                            <div className="chart-card">
                                <h5>
                                    <MdTrendingUp size={20} style={{ marginBottom: "2px" }} />
                                    Growth Trends (Last 7 Days)
                                </h5>
                                <div className="chart-container" style={{ height: "300px" }}>
                                    <Line data={growthChartData} options={chartOptions} />
                                </div>
                            </div>
                        </Col>

                        {/* Subscription Distribution */}
                        <Col lg={4}>
                            <div className="chart-card">
                                <h5>
                                    <MdCreditCard size={20} style={{ marginBottom: "2px" }} />
                                    Subscription Distribution
                                </h5>
                                <div className="chart-container" style={{ height: "300px" }}>
                                    {subscriptions.length > 0 ? (
                                        <Doughnut data={subscriptionChartData} options={doughnutOptions} />
                                    ) : (
                                        <div className="text-center py-5 text-muted">
                                            <MdCreditCard size={48} />
                                            <p className="mt-2">No subscription data</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {/* Recent Tenants */}
                    <Row className="g-3">
                        <Col lg={12}>
                            <div className="recent-surveys-section">
                                <div className="section-header">
                                    <h5>
                                        <MdAddBusiness size={20} />
                                        Recent Company Registrations
                                    </h5>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => navigate("/app/subscription/tenants")}
                                        style={{ textDecoration: "none" }}
                                    >
                                        View All →
                                    </Button>
                                </div>
                                <div className="table-container">
                                    {recentTenants.length === 0 ? (
                                        <div className="text-center py-5">
                                            <MdBusiness size={48} className="text-muted mb-3" />
                                            <h6 className="text-muted">No companies registered yet</h6>
                                        </div>
                                    ) : (
                                        <Table className="custom-table" hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>Company Name</th>
                                                    <th className="d-none d-md-table-cell">Industry</th>
                                                    <th>Plan</th>
                                                    <th>Status</th>
                                                    <th className="d-none d-lg-table-cell">Registered</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentTenants.map((tenant) => (
                                                    <tr key={tenant.id}>
                                                        <td>
                                                            <div style={{ fontWeight: 500 }}>{tenant.name}</div>
                                                        </td>
                                                        <td className="d-none d-md-table-cell">
                                                            <span className="text-muted">{tenant.industry}</span>
                                                        </td>
                                                        <td>
                                                            <Badge bg="primary">{tenant.plan}</Badge>
                                                        </td>
                                                        <td>
                                                            {getStatusBadge(tenant.status)}
                                                        </td>
                                                        <td className="d-none d-lg-table-cell">
                                                            <span className="text-muted d-flex align-items-center gap-1">
                                                                <MdCalendarToday size={14} />
                                                                {formatDate(tenant.registeredAt)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    )
}

export default PlatformDashboard
