// src\components\RecentResponses\RecentResponses.jsx
"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Table, Badge } from "react-bootstrap"
import { MdVisibility } from "react-icons/md"

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
    return <div className="text-center py-4">Loading responses...</div>
  }

  return (
    <div className="table-responsive">
      <Table hover className="mb-0">
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
                <Link to={`/surveys/${response.surveyId}`} className="text-primary text-decoration-none fw-medium">
                  {response.surveyTitle}
                </Link>
              </td>
              <td>
                <div>
                  <div className="fw-medium">{response.respondent}</div>
                  <small className="text-muted">{response.email}</small>
                </div>
              </td>
              <td>{response.submittedAt}</td>
              <td className="text-center">
                <Badge bg={getSatisfactionVariant(response.satisfaction)}>{response.satisfaction.toFixed(1)}</Badge>
              </td>
              <td className="text-center">
                <button className="btn btn-sm btn-outline-primary" title="View Response">
                  <MdVisibility />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

export default RecentResponses
