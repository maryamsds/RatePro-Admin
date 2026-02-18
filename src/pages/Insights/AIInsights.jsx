// src/pages/Insights/AIInsights.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdInsights, MdAutoAwesome, MdTrendingUp, MdTrendingDown,
  MdSentimentSatisfied, MdSentimentDissatisfied, MdSentimentNeutral,
  MdLightbulb, MdFlag, MdWarning, MdCheckCircle, MdAnalytics,
  MdRefresh, MdDownload, MdShare, MdSettings, MdFilterList,
  MdAssignment, MdSchedule, MdNotifications, MdPsychology,
  MdCategory, MdLocationOn, MdPeople, MdTimeline, MdCompare
} from 'react-icons/md';
import {
  FaRobot, FaBrain, FaChartLine, FaExclamationTriangle,
  FaLightbulb, FaUsers, FaStar, FaClock, FaMapMarkerAlt,
  FaArrowUp, FaArrowDown, FaEquals
} from 'react-icons/fa';
import { Line, Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import axiosInstance from '../../api/axiosInstance';


// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const AIInsights = () => {
  const navigate = useNavigate();

  // State Management
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sentiment');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [generatingInsights, setGeneratingInsights] = useState(false);

  // Fetch Insights
  useEffect(() => {
    fetchInsights();
  }, [selectedTimeframe]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/insights/ai?timeframe=${selectedTimeframe}`);
      setInsights(response.data || mockInsights);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setInsights(mockInsights);
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    try {
      setGeneratingInsights(true);
      await axiosInstance.post('/insights/generate');
      await fetchInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setGeneratingInsights(false);
    }
  };

  // Mock Data (fallback)
  const mockInsights = {
    sentiment: {
      overview: {
        positive: 62,
        neutral: 28,
        negative: 10
      },
      trends: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        positive: [58, 61, 59, 62],
        neutral: [32, 29, 31, 28],
        negative: [10, 10, 10, 10]
      },
      categories: [
        { category: 'Service Quality', positive: 68, neutral: 22, negative: 10 },
        { category: 'Staff Behavior', positive: 72, neutral: 20, negative: 8 },
        { category: 'Facility Cleanliness', positive: 45, neutral: 35, negative: 20 },
        { category: 'Wait Times', positive: 35, neutral: 40, negative: 25 },
        { category: 'Product Quality', positive: 78, neutral: 18, negative: 4 }
      ]
    },
    predictions: [
      {
        id: 1,
        type: 'warning',
        title: 'Declining Satisfaction Trend',
        description: 'If current facility cleanliness issues continue, overall NPS is predicted to drop by 15% within 4 weeks',
        confidence: 85,
        timeline: '4 weeks',
        impact: 'High',
        recommendedActions: [
          'Increase cleaning staff schedule',
          'Implement quality checkpoints',
          'Staff training on cleanliness standards'
        ]
      },
      {
        id: 2,
        type: 'opportunity',
        title: 'Service Excellence Potential',
        description: 'Staff behavior scores are trending upward. Focusing on this area could increase overall satisfaction by 12%',
        confidence: 78,
        timeline: '2-3 weeks',
        impact: 'Medium',
        recommendedActions: [
          'Recognize top performing staff',
          'Share best practices across teams',
          'Implement peer mentoring program'
        ]
      },
      {
        id: 3,
        type: 'alert',
        title: 'Wait Time Critical Threshold',
        description: 'Wait time complaints have reached a critical threshold. Immediate action required to prevent customer churn',
        confidence: 92,
        timeline: 'Immediate',
        impact: 'Critical',
        recommendedActions: [
          'Add more service counters during peak hours',
          'Implement digital queue management',
          'Staff scheduling optimization'
        ]
      }
    ],
    categoryAnalysis: {
      topIssues: [
        { issue: 'Long waiting times', mentions: 234, trend: 'increasing', severity: 'high' },
        { issue: 'Facility cleanliness', mentions: 187, trend: 'stable', severity: 'medium' },
        { issue: 'Limited parking', mentions: 145, trend: 'decreasing', severity: 'low' },
        { issue: 'Staff responsiveness', mentions: 123, trend: 'stable', severity: 'medium' },
        { issue: 'System downtime', mentions: 98, trend: 'decreasing', severity: 'low' }
      ],
      topPraises: [
        { praise: 'Professional staff behavior', mentions: 456, trend: 'increasing' },
        { praise: 'Quick problem resolution', mentions: 389, trend: 'increasing' },
        { praise: 'Quality of services', mentions: 334, trend: 'stable' },
        { praise: 'Clean facilities', mentions: 287, trend: 'stable' },
        { praise: 'Easy processes', mentions: 234, trend: 'increasing' }
      ]
    },
    actionableInsights: [
      {
        id: 1,
        title: 'Optimize Peak Hour Staffing',
        description: 'AI analysis shows 70% of wait time complaints occur between 10-12 PM and 2-4 PM',
        priority: 'High',
        estimatedImpact: '+18% satisfaction',
        implementationEffort: 'Medium',
        department: 'Operations'
      },
      {
        id: 2,
        title: 'Enhance Staff Recognition Program',
        description: 'Positive staff mentions correlate with 23% higher overall ratings',
        priority: 'Medium',
        estimatedImpact: '+12% satisfaction',
        implementationEffort: 'Low',
        department: 'HR'
      },
      {
        id: 3,
        title: 'Implement Proactive Maintenance',
        description: 'Facility issues spike every 3 weeks - predictive maintenance could reduce by 60%',
        priority: 'High',
        estimatedImpact: '+15% satisfaction',
        implementationEffort: 'High',
        department: 'Facilities'
      }
    ],
    aiRecommendations: {
      immediate: [
        'Deploy additional staff during 10-12 PM peak hours',
        'Set up digital queue display boards',
        'Create facility cleanliness checklist'
      ],
      shortTerm: [
        'Implement staff recognition rewards program',
        'Upgrade booking system for better efficiency',
        'Add customer feedback kiosks at exit points'
      ],
      longTerm: [
        'AI-powered predictive maintenance system',
        'Customer journey optimization program',
        'Advanced staff scheduling algorithms'
      ]
    }
  };

  // Chart configurations
  const sentimentOverviewChart = {
    data: {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [{
        data: [
          insights?.sentiment.overview.positive || 0,
          insights?.sentiment.overview.neutral || 0,
          insights?.sentiment.overview.negative || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          '#22c55e',
          '#eab308',
          '#ef4444'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  };

  const sentimentTrendsChart = {
    data: {
      labels: insights?.sentiment.trends.labels || [],
      datasets: [
        {
          label: 'Positive',
          data: insights?.sentiment.trends.positive || [],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Neutral',
          data: insights?.sentiment.trends.neutral || [],
          borderColor: '#eab308',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Negative',
          data: insights?.sentiment.trends.negative || [],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  };

  // Helper functions
  const getPredictionIcon = (type) => {
    switch (type) {
      case 'warning': return <MdWarning className="text-[var(--warning-color)]" />;
      case 'opportunity': return <MdLightbulb className="text-[var(--success-color)]" />;
      case 'alert': return <MdFlag className="text-[var(--danger-color)]" />;
      default: return <MdInsights />;
    }
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      High: 'bg-[var(--danger-color)]',
      Medium: 'bg-[var(--warning-color)]',
      Low: 'bg-[var(--info-color)]'
    };
    return <span className={`px-2 py-0.5 text-white rounded-full text-xs font-medium ${variants[priority] || 'bg-[var(--text-secondary)]'}`}>{priority}</span>;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <FaArrowUp className="text-[var(--danger-color)]" />;
      case 'decreasing': return <FaArrowDown className="text-[var(--success-color)]" />;
      case 'stable': return <FaEquals className="text-[var(--text-secondary)]" />;
      default: return null;
    }
  };

  const tabs = [
    { key: 'sentiment', icon: <MdSentimentSatisfied className="mr-2" />, label: 'Sentiment Analysis' },
    { key: 'categories', icon: <MdCategory className="mr-2" />, label: 'Category Analysis' },
    { key: 'actionable', icon: <MdLightbulb className="mr-2" />, label: 'Actionable Insights' },
    { key: 'recommendations', icon: <FaBrain className="mr-2" />, label: 'AI Recommendations' }
  ];

  if (loading) {
    return (
      <div className="w-full py-12 text-center">
        <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Analyzing feedback with AI...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4">
      {/* Header */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] mb-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mr-3">
              <FaRobot className="text-2xl text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">AI Insights</h1>
              <p className="text-sm text-[var(--text-secondary)] mb-0">
                Intelligent analysis and predictions from customer feedback
              </p>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <select
              className="px-3 py-2 text-sm border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] outline-none focus:border-[var(--primary-color)] transition-colors"
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>

            <button onClick={fetchInsights} className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] text-sm flex items-center gap-1">
              <MdRefresh /> Refresh
            </button>

            <button
              onClick={generateNewInsights}
              disabled={generatingInsights}
              className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:opacity-90 text-sm disabled:opacity-50 flex items-center gap-1"
            >
              {generatingInsights ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <MdAutoAwesome />
              )}
              {generatingInsights ? 'Analyzing...' : 'Generate Insights'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Predictions */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] mb-4">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <h5 className="font-semibold m-0 flex items-center gap-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
            <MdPsychology className="text-blue-500 text-xl" />
            AI Predictions & Alerts
          </h5>
          <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
            <FaBrain /> AI Powered
          </span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {insights?.predictions.map(prediction => (
              <div key={prediction.id} className={`bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] border-l-4 h-full ${prediction.type === 'alert' ? 'border-l-[var(--danger-color)]' :
                  prediction.type === 'warning' ? 'border-l-[var(--warning-color)]' : 'border-l-[var(--success-color)]'
                }`}>
                <div className="p-4">
                  <div className="flex items-start mb-2">
                    {getPredictionIcon(prediction.type)}
                    <div className="ml-2 flex-grow">
                      <h6 className="font-semibold text-sm mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">{prediction.title}</h6>
                      <p className="text-xs text-[var(--text-secondary)] mb-2">{prediction.description}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      <span>Confidence:</span>
                      <span className="font-bold">{prediction.confidence}%</span>
                    </div>
                    <div className="w-full bg-[var(--light-border)] dark:bg-[var(--dark-border)] rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${prediction.confidence > 80 ? 'bg-[var(--success-color)]' : prediction.confidence > 60 ? 'bg-[var(--warning-color)]' : 'bg-[var(--danger-color)]'
                          }`}
                        style={{ width: `${prediction.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-white rounded-full text-xs font-medium ${prediction.impact === 'Critical' ? 'bg-[var(--danger-color)]' : prediction.impact === 'High' ? 'bg-[var(--warning-color)]' : 'bg-[var(--info-color)]'
                        }`}>
                        {prediction.impact}
                      </span>
                      <small className="text-[var(--text-secondary)]">{prediction.timeline}</small>
                    </div>
                    <button
                      onClick={() => navigate('/actions', {
                        state: { createAction: true, prediction }
                      })}
                      className="px-2 py-1 border border-[var(--primary-color)] text-[var(--primary-color)] rounded text-xs hover:bg-[var(--primary-color)]/10 dark:hover:bg-[var(--primary-color)]/20 transition-colors"
                    >
                      <MdAssignment className="inline mr-1" />
                      Create Action
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Insights Tabs */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--light-border)] dark:border-[var(--dark-border)] overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key
                  ? 'border-b-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'border-b-transparent text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)]'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Sentiment Analysis Tab */}
          {activeTab === 'sentiment' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="px-4 py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <h5 className="font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Overall Sentiment</h5>
                  </div>
                  <div className="p-4">
                    <Doughnut {...sentimentOverviewChart} />
                  </div>
                </div>

                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="px-4 py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <h5 className="font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Sentiment Trends</h5>
                  </div>
                  <div className="p-4">
                    <Line {...sentimentTrendsChart} />
                  </div>
                </div>
              </div>

              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div className="px-4 py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <h5 className="font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Sentiment by Category</h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <tr>
                        <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Category</th>
                        <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Positive</th>
                        <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Neutral</th>
                        <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Negative</th>
                        <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Overall Score</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
                      {insights?.sentiment.categories.map((cat, index) => {
                        const score = (cat.positive * 1 + cat.neutral * 0.5 + cat.negative * 0) / 100;
                        return (
                          <tr key={index} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                            <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">{cat.category}</td>
                            <td className="p-3">
                              <span className="text-[var(--success-color)]">{cat.positive}%</span>
                            </td>
                            <td className="p-3">
                              <span className="text-[var(--warning-color)]">{cat.neutral}%</span>
                            </td>
                            <td className="p-3">
                              <span className="text-[var(--danger-color)]">{cat.negative}%</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-white rounded-full text-xs font-medium ${score > 0.7 ? 'bg-[var(--success-color)]' : score > 0.5 ? 'bg-[var(--warning-color)]' : 'bg-[var(--danger-color)]'
                                }`}>
                                {(score * 5).toFixed(1)}/5
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Category Analysis Tab */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div className="px-4 py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <h5 className="font-semibold m-0 text-[var(--danger-color)] flex items-center gap-2">
                    <MdFlag />
                    Top Issues
                  </h5>
                </div>
                <div className="p-4">
                  {insights?.categoryAnalysis.topIssues.map((issue, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] last:border-0">
                      <div>
                        <div className="font-semibold text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{issue.issue}</div>
                        <small className="text-[var(--text-secondary)]">{issue.mentions} mentions</small>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-white rounded-full text-xs font-medium ${issue.severity === 'high' ? 'bg-[var(--danger-color)]' : issue.severity === 'medium' ? 'bg-[var(--warning-color)]' : 'bg-[var(--info-color)]'
                          }`}>
                          {issue.severity}
                        </span>
                        {getTrendIcon(issue.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div className="px-4 py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <h5 className="font-semibold m-0 text-[var(--success-color)] flex items-center gap-2">
                    <MdCheckCircle />
                    Top Praises
                  </h5>
                </div>
                <div className="p-4">
                  {insights?.categoryAnalysis.topPraises.map((praise, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] last:border-0">
                      <div>
                        <div className="font-semibold text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{praise.praise}</div>
                        <small className="text-[var(--text-secondary)]">{praise.mentions} mentions</small>
                      </div>
                      <div>
                        {getTrendIcon(praise.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actionable Insights Tab */}
          {activeTab === 'actionable' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {insights?.actionableInsights.map(insight => (
                <div key={insight.id} className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] h-full flex flex-col">
                  <div className="p-4 flex-grow">
                    <div className="flex items-start mb-2">
                      <FaLightbulb className="text-[var(--warning-color)] mr-2 mt-1" />
                      <div className="flex-grow">
                        <h6 className="font-semibold text-sm mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">{insight.title}</h6>
                        <p className="text-xs text-[var(--text-secondary)] mb-2">{insight.description}</p>
                      </div>
                    </div>

                    <div className="mb-3 space-y-1">
                      <div className="flex justify-between text-xs text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        <span>Priority:</span>
                        {getPriorityBadge(insight.priority)}
                      </div>
                      <div className="flex justify-between text-xs text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        <span>Impact:</span>
                        <span className="text-[var(--success-color)] font-bold">{insight.estimatedImpact}</span>
                      </div>
                      <div className="flex justify-between text-xs text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        <span>Department:</span>
                        <span className="px-2 py-0.5 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] rounded-full text-xs border border-[var(--light-border)] dark:border-[var(--dark-border)]">{insight.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <button
                      onClick={() => navigate('/actions', {
                        state: { createAction: true, insight }
                      })}
                      className="w-full px-3 py-2 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-md text-sm hover:bg-[var(--primary-color)]/10 dark:hover:bg-[var(--primary-color)]/20 transition-colors"
                    >
                      <MdAssignment className="inline mr-1" />
                      Create Action Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--danger-color)]/30 dark:border-[var(--danger-color)]/50 h-full">
                <div className="px-4 py-3 bg-[var(--danger-color)]/10 dark:bg-[var(--danger-color)]/20 border-b border-[var(--danger-color)]/30 dark:border-[var(--danger-color)]/50 rounded-t-md">
                  <h5 className="font-semibold m-0 text-[var(--danger-color)] flex items-center gap-2">
                    <MdSchedule />
                    Immediate Actions
                  </h5>
                </div>
                <div className="p-4">
                  {insights?.aiRecommendations.immediate.map((rec, index) => (
                    <div key={index} className="flex items-start py-2">
                      <MdFlag className="text-[var(--danger-color)] mr-2 mt-0.5 flex-shrink-0" size={14} />
                      <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--warning-color)]/30 dark:border-[var(--warning-color)]/50 h-full">
                <div className="px-4 py-3 bg-[var(--warning-color)]/10 dark:bg-[var(--warning-color)]/20 border-b border-[var(--warning-color)]/30 dark:border-[var(--warning-color)]/50 rounded-t-md">
                  <h5 className="font-semibold m-0 text-[var(--warning-color)] flex items-center gap-2">
                    <MdTimeline />
                    Short Term (1-4 weeks)
                  </h5>
                </div>
                <div className="p-4">
                  {insights?.aiRecommendations.shortTerm.map((rec, index) => (
                    <div key={index} className="flex items-start py-2">
                      <MdWarning className="text-[var(--warning-color)] mr-2 mt-0.5 flex-shrink-0" size={14} />
                      <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-blue-500/30 dark:border-blue-500/50 h-full">
                <div className="px-4 py-3 bg-blue-500/10 dark:bg-blue-500/20 border-b border-blue-500/30 dark:border-blue-500/50 rounded-t-md">
                  <h5 className="font-semibold m-0 text-blue-500 flex items-center gap-2">
                    <MdTrendingUp />
                    Long Term (1-6 months)
                  </h5>
                </div>
                <div className="p-4">
                  {insights?.aiRecommendations.longTerm.map((rec, index) => (
                    <div key={index} className="flex items-start py-2">
                      <MdLightbulb className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={14} />
                      <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;