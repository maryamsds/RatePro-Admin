// src\components\RecentResponses\RecentResponses.jsx
"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { MdVisibility } from "react-icons/md"

const badgeColors = {
  success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  primary: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const RecentResponses = ({ limit = 5 }) => {
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      const dummyResponses = [
        {
          id: 1,
          surveyId: 1,
          surveyTitle: "Customer Satisfaction Survey",
          respondent: "John Doe",
          email: "john.doe@example.com",
          submittedAt: "2023-06-01 14:32",
          satisfaction: 4.5,
        },
        {
          id: 2,
          surveyId: 1,
          surveyTitle: "Customer Satisfaction Survey",
          respondent: "Jane Smith",
          email: "jane.smith@example.com",
          submittedAt: "2023-06-01 13:15",
          satisfaction: 3.8,
        },
        {
          id: 3,
          surveyId: 2,
          surveyTitle: "Product Feedback Survey",
          respondent: "Robert Johnson",
          email: "robert.j@example.com",
          submittedAt: "2023-06-01 11:45",
          satisfaction: 4.2,
        },
        {
          id: 4,
          surveyId: 4,
          surveyTitle: "Website Usability Survey",
          respondent: "Emily Davis",
          email: "emily.d@example.com",
          submittedAt: "2023-05-31 16:20",
          satisfaction: 4.0,
        },
        {
          id: 5,
          surveyId: 1,
          surveyTitle: "Customer Satisfaction Survey",
          respondent: "Michael Wilson",
          email: "michael.w@example.com",
          submittedAt: "2023-05-31 15:10",
          satisfaction: 4.7,
        },
      ]

      setResponses(dummyResponses.slice(0, limit))
      setLoading(false)
    }, 800)
  }, [limit])

  const getSatisfactionVariant = (score) => {
    if (score >= 4.5) return "success"
    if (score >= 3.5) return "primary"
    if (score >= 2.5) return "warning"
    return "danger"
  }

  if (loading) {
    return <div className="text-center py-4 text-[var(--secondary-color)]">Loading responses...</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="custom-table w-full mb-0">
        <thead>
          <tr>
            <th>Survey</th>
            <th>Respondent</th>
            <th>Submitted At</th>
            <th className="text-center">Satisfaction</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((response) => (
            <tr key={response.id}>
              <td>
                <Link to={`/surveys/${response.surveyId}`} className="text-[var(--primary-color)] no-underline font-medium">
                  {response.surveyTitle}
                </Link>
              </td>
              <td>
                <div>
                  <div className="font-medium">{response.respondent}</div>
                  <small className="text-[var(--secondary-color)]">{response.email}</small>
                </div>
              </td>
              <td>{response.submittedAt}</td>
              <td className="text-center">
                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${badgeColors[getSatisfactionVariant(response.satisfaction)]}`}>
                  {response.satisfaction.toFixed(1)}
                </span>
              </td>
              <td className="text-center">
                <button
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg
                             border border-[var(--light-border)] dark:border-[var(--dark-border)]
                             text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10
                             bg-transparent cursor-pointer transition-all duration-200"
                  title="View Response"
                >
                  <MdVisibility />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RecentResponses
