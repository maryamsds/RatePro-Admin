// src\pages\Surveys\TakeSurvey.jsx

"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Form, Button, ProgressBar, Alert } from "react-bootstrap"
import { MdArrowBack, MdArrowForward, MdCheck } from "react-icons/md"

const TakeSurvey = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [survey, setSurvey] = useState(null)

  useEffect(() => {
    // Simulate loading survey data
    setTimeout(() => {
      setSurvey({
        id: id,
        title: "Customer Satisfaction Survey",
        description: "Help us improve our service by sharing your feedback.",
        questions: [
          {
            id: 1,
            text: "How satisfied are you with our product overall?",
            type: "rating",
            required: true,
            options: [1, 2, 3, 4, 5],
          },
          {
            id: 2,
            text: "Which features do you use most often?",
            type: "multiple_choice",
            required: true,
            options: ["Dashboard", "Reports", "Analytics", "Settings", "User Management"],
          },
          {
            id: 3,
            text: "How likely are you to recommend our product to others?",
            type: "nps",
            required: true,
            options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          },
          {
            id: 4,
            text: "What can we improve?",
            type: "text",
            required: false,
          },
          {
            id: 5,
            text: "How often do you use our product?",
            type: "single_choice",
            required: true,
            options: ["Daily", "Weekly", "Monthly", "Rarely"],
          },
        ],
      })
      setLoading(false)
    }, 1000)
  }, [id])

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitSurvey = async () => {
    setSubmitting(true)
    try {
      // Simulate API submission
      await new Promise((resolve) => setTimeout(resolve, 2000))
      navigate("/thank-you")
    } catch (error) {
      console.error("Failed to submit survey:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const isCurrentQuestionAnswered = () => {
    const question = survey.questions[currentQuestion]
    return answers[question.id] !== undefined && answers[question.id] !== ""
  }

  const canProceed = () => {
    const question = survey.questions[currentQuestion]
    return !question.required || isCurrentQuestionAnswered()
  }

  if (loading) {
    return (
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading survey...</p>
        </div>
      </Container>
    )
  }

  if (!survey) {
    return (
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
        <Alert variant="danger">Survey not found</Alert>
      </Container>
    )
  }

  const question = survey.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / survey.questions.length) * 100

  return (
    <Container fluid className="min-vh-100 py-4" style={{ backgroundColor: "var(--light-bg)" }}>
      <Row className="justify-content-center">
        <Col xs={12} lg={8} xl={6}>
          {/* Header */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
              <div className="text-center">
                <h1 className="h3 text-primary fw-bold mb-2">{survey.title}</h1>
                <p className="text-muted mb-3">{survey.description}</p>
                <ProgressBar now={progress} className="mb-2" style={{ height: "8px" }} />
                <small className="text-muted">
                  Question {currentQuestion + 1} of {survey.questions.length}
                </small>
              </div>
            </Card.Body>
          </Card>

          {/* Question */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="survey-question">
                <h5 className="mb-4">
                  {question.text}
                  {question.required && <span className="text-danger ms-1">*</span>}
                </h5>

                {/* Rating Question */}
                {question.type === "rating" && (
                  <div className="rating-buttons">
                    {question.options.map((rating) => (
                      <Button
                        key={rating}
                        variant={answers[question.id] === rating ? "primary" : "outline-primary"}
                        onClick={() => handleAnswer(question.id, rating)}
                        className="me-2 mb-2"
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                )}

                {/* NPS Question */}
                {question.type === "nps" && (
                  <div>
                    <div className="rating-buttons mb-3">
                      {question.options.map((rating) => (
                        <Button
                          key={rating}
                          variant={answers[question.id] === rating ? "primary" : "outline-primary"}
                          onClick={() => handleAnswer(question.id, rating)}
                          className="me-1 mb-2"
                          size="sm"
                        >
                          {rating}
                        </Button>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between small text-muted">
                      <span>Not likely</span>
                      <span>Very likely</span>
                    </div>
                  </div>
                )}

                {/* Multiple Choice Question */}
                {question.type === "multiple_choice" && (
                  <div>
                    {question.options.map((option, index) => (
                      <Form.Check
                        key={index}
                        type="checkbox"
                        id={`q${question.id}-option${index}`}
                        label={option}
                        checked={(answers[question.id] || []).includes(option)}
                        onChange={(e) => {
                          const currentAnswers = answers[question.id] || []
                          if (e.target.checked) {
                            handleAnswer(question.id, [...currentAnswers, option])
                          } else {
                            handleAnswer(
                              question.id,
                              currentAnswers.filter((a) => a !== option),
                            )
                          }
                        }}
                        className="mb-2"
                      />
                    ))}
                  </div>
                )}

                {/* Single Choice Question */}
                {question.type === "single_choice" && (
                  <div>
                    {question.options.map((option, index) => (
                      <Form.Check
                        key={index}
                        type="radio"
                        id={`q${question.id}-option${index}`}
                        name={`question-${question.id}`}
                        label={option}
                        checked={answers[question.id] === option}
                        onChange={() => handleAnswer(question.id, option)}
                        className="mb-2"
                      />
                    ))}
                  </div>
                )}

                {/* Text Question */}
                {question.type === "text" && (
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    placeholder="Enter your response..."
                  />
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Navigation */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <Button
                  variant="outline-secondary"
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  className="d-flex align-items-center"
                >
                  <MdArrowBack className="me-2" />
                  Previous
                </Button>

                {currentQuestion === survey.questions.length - 1 ? (
                  <Button
                    variant="success"
                    onClick={submitSurvey}
                    disabled={!canProceed() || submitting}
                    className="d-flex align-items-center"
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <MdCheck className="me-2" />
                        Submit Survey
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={nextQuestion}
                    disabled={!canProceed()}
                    className="d-flex align-items-center"
                  >
                    Next
                    <MdArrowForward className="ms-2" />
                  </Button>
                )}
              </div>

              {question.required && !isCurrentQuestionAnswered() && (
                <div className="text-center mt-3">
                  <small className="text-danger">This question is required</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default TakeSurvey
