// src\pages\Surveys\TakeSurvey.jsx

"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--light-bg)" }}>
        <div className="text-center">
          <span className="inline-block w-8 h-8 border-3 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-[var(--secondary-color)]">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--light-bg)" }}>
        <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400" role="alert">
          Survey not found
        </div>
      </div>
    )
  }

  const question = survey.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / survey.questions.length) * 100

  return (
    <div className="min-h-screen py-4 px-4" style={{ backgroundColor: "var(--light-bg)" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="card mb-4 border-0 shadow-sm rounded-xl p-6">
          <div className="text-center">
            <h1 className="text-xl font-bold text-[var(--primary-color)] mb-2">{survey.title}</h1>
            <p className="text-[var(--secondary-color)] mb-3">{survey.description}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-2" style={{ height: "8px" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: "var(--primary-color)" }}
              />
            </div>
            <small className="text-[var(--secondary-color)]">
              Question {currentQuestion + 1} of {survey.questions.length}
            </small>
          </div>
        </div>

        {/* Question */}
        <div className="card mb-4 border-0 shadow-sm rounded-xl p-6">
          <div className="survey-question">
            <h5 className="mb-4 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h5>

            {/* Rating Question */}
            {question.type === "rating" && (
              <div className="flex flex-wrap gap-2">
                {question.options.map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleAnswer(question.id, rating)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200
                      ${answers[question.id] === rating
                        ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
                        : "border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10"
                      }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            )}

            {/* NPS Question */}
            {question.type === "nps" && (
              <div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {question.options.map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleAnswer(question.id, rating)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200
                        ${answers[question.id] === rating
                          ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
                          : "border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10"
                        }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-[var(--secondary-color)]">
                  <span>Not likely</span>
                  <span>Very likely</span>
                </div>
              </div>
            )}

            {/* Multiple Choice Question */}
            {question.type === "multiple_choice" && (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={`q${question.id}-option${index}`}
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
                      className="w-4 h-4 rounded accent-[var(--primary-color)]"
                    />
                    <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Single Choice Question */}
            {question.type === "single_choice" && (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <input
                      type="radio"
                      id={`q${question.id}-option${index}`}
                      name={`question-${question.id}`}
                      checked={answers[question.id] === option}
                      onChange={() => handleAnswer(question.id, option)}
                      className="w-4 h-4 accent-[var(--primary-color)]"
                    />
                    <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Text Question */}
            {question.type === "text" && (
              <textarea
                rows={4}
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="Enter your response..."
                className="w-full px-4 py-3 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                           bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]
                           text-[var(--light-text)] dark:text-[var(--dark-text)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)]
                           transition-all duration-200 resize-y"
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="card border-0 shadow-sm rounded-xl p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                         border border-[var(--light-border)] dark:border-[var(--dark-border)]
                         text-[var(--light-text)] dark:text-[var(--dark-text)]
                         hover:bg-gray-50 dark:hover:bg-gray-800
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <MdArrowBack />
              Previous
            </button>

            {currentQuestion === survey.questions.length - 1 ? (
              <button
                onClick={submitSurvey}
                disabled={!canProceed() || submitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white
                           bg-green-600 hover:bg-green-700
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MdCheck />
                    Submit Survey
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={!canProceed()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white
                           bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
                <MdArrowForward />
              </button>
            )}
          </div>

          {question.required && !isCurrentQuestionAnswered() && (
            <div className="text-center mt-3">
              <small className="text-red-500">This question is required</small>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TakeSurvey
