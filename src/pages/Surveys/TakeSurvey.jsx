// src/pages/Surveys/TakeSurvey.jsx
// ============================================================================
// Public survey-taking component with:
//   - Real API integration (fetch + submit)
//   - Conditional branching logic (logicRules + defaultNextQuestionId)
//   - Navigation history stack with reset on answer change
//   - Required question validation before navigation
// ============================================================================

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { MdArrowBack, MdArrowForward, MdCheck } from "react-icons/md"
import axiosInstance from "../../api/axiosInstance"

const TakeSurvey = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // ── Core State ─────────────────────────────────────────────────
  const [survey, setSurvey] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  // ── Branching Navigation State ─────────────────────────────────
  // navigationStack tracks the ordered list of question indices the user
  // has visited. This enables correct "Previous" behavior through branches.
  const [navigationStack, setNavigationStack] = useState([0])
  // stackPosition points to the current position within the navigation stack
  const [stackPosition, setStackPosition] = useState(0)

  // ── Derived: O(1) Question ID → Index Lookup ──────────────────
  const questionIndexMap = useMemo(() => {
    if (!survey?.questions) return {}
    const map = {}
    survey.questions.forEach((q, i) => {
      map[q.id?.toString()] = i
    })
    return map
  }, [survey])

  // ── Fetch Survey from API ──────────────────────────────────────
  useEffect(() => {
    const fetchSurvey = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await axiosInstance.get(`/surveys/public/${id}`)
        const surveyData = response.data?.survey || response.data
        if (!surveyData || !surveyData.questions?.length) {
          setError("Survey not found or has no questions.")
          return
        }
        setSurvey(surveyData)
      } catch (err) {
        const status = err.response?.status
        if (status === 404) {
          setError("Survey not found or is no longer available.")
        } else {
          setError(err.response?.data?.message || "Failed to load survey. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchSurvey()
  }, [id])

  // ── Current Question (derived from navigation stack) ───────────
  const currentQuestionIndex = navigationStack[stackPosition] ?? 0
  const question = survey?.questions?.[currentQuestionIndex] ?? null
  const totalQuestions = survey?.questions?.length ?? 0

  // ── Answer Handling with Navigation Stack Reset ────────────────
  // When user changes an answer, truncate any forward history to prevent
  // stale branching paths from corrupting navigation.
  const handleAnswer = useCallback((questionId, answer) => {
    setAnswers(prev => {
      const prevAnswer = prev[questionId]
      const answerChanged = JSON.stringify(prevAnswer) !== JSON.stringify(answer)

      if (answerChanged) {
        // Truncate forward navigation history — the path ahead may change
        setNavigationStack(prev => prev.slice(0, stackPosition + 1))
      }

      return { ...prev, [questionId]: answer }
    })
  }, [stackPosition])

  // ── Branching Logic: Determine Next Question ───────────────────
  // Evaluates the current question's logicRules against the user's answer.
  // Returns the index of the next question, or -1 if survey should end.
  const resolveNextQuestionIndex = useCallback(() => {
    if (!question || !survey) return currentQuestionIndex + 1

    const currentAnswer = answers[question.id]
    const rules = question.logicRules || []

    // 1. Evaluate logic rules in order
    for (const rule of rules) {
      if (evaluateRule(rule, currentAnswer)) {
        const targetId = rule.targetQuestionId?.toString()
        if (targetId && questionIndexMap[targetId] !== undefined) {
          return questionIndexMap[targetId]
        }
        // Target question doesn't exist — fall through to next rule
      }
    }

    // 2. Check defaultNextQuestionId (the "else" branch)
    if (question.defaultNextQuestionId) {
      const defaultIdx = questionIndexMap[question.defaultNextQuestionId.toString()]
      if (defaultIdx !== undefined) return defaultIdx
    }

    // 3. Fall back to sequential order
    return currentQuestionIndex + 1
  }, [question, survey, answers, currentQuestionIndex, questionIndexMap])

  // ── Rule Evaluator ─────────────────────────────────────────────
  // Matches a single logic rule against the user's answer
  const evaluateRule = (rule, answer) => {
    if (!rule || !rule.condition || answer === undefined || answer === null) return false

    const { operator, value } = rule.condition
    const answerStr = Array.isArray(answer) ? answer.join(',') : String(answer)
    const valueStr = String(value)

    switch (operator) {
      case 'equals':
      case 'is':
        return answerStr === valueStr
      case 'not_equals':
      case 'is_not':
        return answerStr !== valueStr
      case 'contains':
        return answerStr.toLowerCase().includes(valueStr.toLowerCase())
      case 'greater_than':
        return Number(answer) > Number(value)
      case 'less_than':
        return Number(answer) < Number(value)
      case 'in':
        // For multi-select: check if answer array includes the value
        return Array.isArray(answer) && answer.includes(value)
      default:
        return false
    }
  }

  // ── Required Question Validation ───────────────────────────────
  const isCurrentQuestionAnswered = useCallback(() => {
    if (!question) return false
    const answer = answers[question.id]
    if (answer === undefined || answer === null || answer === '') return false
    if (Array.isArray(answer) && answer.length === 0) return false
    return true
  }, [question, answers])

  const canProceed = useCallback(() => {
    if (!question) return false
    return !question.required || isCurrentQuestionAnswered()
  }, [question, isCurrentQuestionAnswered])

  // ── Navigation: Next ───────────────────────────────────────────
  // Respects branching logic AND required validation
  const nextQuestion = useCallback(() => {
    // Block if required question is not answered
    if (!canProceed()) return

    const nextIdx = resolveNextQuestionIndex()

    // Safety guard: prevent infinite loops
    // If we've navigated more times than total questions, force sequential
    if (navigationStack.length > totalQuestions * 2) {
      const sequential = currentQuestionIndex + 1
      if (sequential < totalQuestions) {
        setNavigationStack(prev => [...prev.slice(0, stackPosition + 1), sequential])
        setStackPosition(prev => prev + 1)
      }
      return
    }

    if (nextIdx >= 0 && nextIdx < totalQuestions) {
      // Truncate any stale forward history and push new destination
      setNavigationStack(prev => [...prev.slice(0, stackPosition + 1), nextIdx])
      setStackPosition(prev => prev + 1)
    }
    // If nextIdx >= totalQuestions, we're at the end — do nothing (submit button will show)
  }, [canProceed, resolveNextQuestionIndex, stackPosition, currentQuestionIndex, totalQuestions, navigationStack.length])

  // ── Navigation: Previous ───────────────────────────────────────
  // Walks back through the navigation stack (respects branched history)
  const prevQuestion = useCallback(() => {
    if (stackPosition > 0) {
      setStackPosition(prev => prev - 1)
    }
  }, [stackPosition])

  // ── Is this the last question? ─────────────────────────────────
  const isLastQuestion = useMemo(() => {
    if (!question || !survey) return false
    const nextIdx = resolveNextQuestionIndex()
    return nextIdx >= totalQuestions
  }, [question, survey, resolveNextQuestionIndex, totalQuestions])

  // ── Submit Survey ──────────────────────────────────────────────
  const submitSurvey = async () => {
    if (!canProceed()) return

    setSubmitting(true)
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }))

      await axiosInstance.post(`/surveys/responses/anonymous/${id}`, {
        answers: formattedAnswers,
        isAnonymous: true
      })

      setSubmitted(true)
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to submit survey. Please try again."
      setError(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Progress Calculation ───────────────────────────────────────
  const progress = totalQuestions > 0
    ? ((stackPosition + 1) / totalQuestions) * 100
    : 0

  // ════════════════════════════════════════════════════════════════
  // RENDER STATES
  // ════════════════════════════════════════════════════════════════

  // Loading
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

  // Error
  if (error && !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--light-bg)" }}>
        <div className="max-w-md mx-auto text-center px-4">
          <div className="card border-0 shadow-sm rounded-xl p-8">
            <div className="text-5xl mb-4">😔</div>
            <h2 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
              Oops!
            </h2>
            <p className="text-[var(--secondary-color)] mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Submitted — Thank You Page
  if (submitted) {
    const thankYouMessage = survey?.thankYouPage?.message || "Thank you for your valuable feedback!"
    const redirectUrl = survey?.thankYouPage?.redirectUrl

    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--light-bg)" }}>
        <div className="max-w-md mx-auto text-center px-4">
          <div className="card border-0 shadow-sm rounded-xl p-8">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-green-600 mb-2">
              Survey Completed!
            </h2>
            <p className="text-[var(--secondary-color)] mb-4">{thankYouMessage}</p>
            {redirectUrl && (
              <a
                href={redirectUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] transition-all duration-200"
              >
                Continue
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  // No survey data
  if (!survey || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--light-bg)" }}>
        <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400" role="alert">
          Survey not found
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // MAIN RENDER — Survey Question UI
  // ════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen py-4 px-4" style={{ backgroundColor: survey.themeColor ? `${survey.themeColor}08` : "var(--light-bg)" }}>
      <div className="max-w-2xl mx-auto">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="card mb-4 border-0 shadow-sm rounded-xl p-6">
          <div className="text-center">
            <h1 className="text-xl font-bold text-[var(--primary-color)] mb-2">{survey.title}</h1>
            {survey.description && (
              <p className="text-[var(--secondary-color)] mb-3">{survey.description}</p>
            )}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-2" style={{ height: "8px" }}>
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: survey.themeColor || "var(--primary-color)"
                }}
              />
            </div>
            <small className="text-[var(--secondary-color)]">
              Question {stackPosition + 1} of {totalQuestions}
            </small>
          </div>
        </div>

        {/* ── Inline Error (submission error while survey is loaded) ── */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ── Question Card ───────────────────────────────────── */}
        <div className="card mb-4 border-0 shadow-sm rounded-xl p-6">
          <div className="survey-question">
            <h5 className="mb-4 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
              {question.questionText || question.text || question.title}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h5>

            {question.description && (
              <p className="text-sm text-[var(--secondary-color)] mb-4">{question.description}</p>
            )}

            {/* ── Rating Question ── */}
            {(question.type === "rating") && (
              <div className="flex flex-wrap gap-2">
                {(question.options?.length > 0 ? question.options : [1, 2, 3, 4, 5]).map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleAnswer(question.id, rating)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200
                      ${answers[question.id] === rating
                        ? "text-white border-transparent"
                        : "border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10"
                      }`}
                    style={answers[question.id] === rating ? { backgroundColor: survey.themeColor || "var(--primary-color)", borderColor: survey.themeColor || "var(--primary-color)" } : {}}
                  >
                    {question.type === "rating" ? "⭐".repeat(rating) : rating}
                  </button>
                ))}
              </div>
            )}

            {/* ── NPS Question ── */}
            {question.type === "nps" && (
              <div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleAnswer(question.id, rating)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200
                        ${answers[question.id] === rating
                          ? "text-white border-transparent"
                          : "border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10"
                        }`}
                      style={answers[question.id] === rating ? { backgroundColor: survey.themeColor || "var(--primary-color)" } : {}}
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

            {/* ── Likert Scale ── */}
            {question.type === "likert" && (
              <div className="space-y-2">
                {(question.options || ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']).map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    style={answers[question.id] === option ? { borderColor: survey.themeColor || "var(--primary-color)", backgroundColor: `${survey.themeColor || "var(--primary-color)"}08` } : {}}
                  >
                    <input
                      type="radio"
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

            {/* ── Scale Question ── */}
            {question.type === "scale" && (
              <div className="flex flex-wrap gap-2">
                {(question.options?.length > 0 ? question.options : [1, 2, 3, 4, 5]).map((val) => (
                  <button
                    key={val}
                    onClick={() => handleAnswer(question.id, val)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200
                      ${answers[question.id] === val
                        ? "text-white border-transparent"
                        : "border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10"
                      }`}
                    style={answers[question.id] === val ? { backgroundColor: survey.themeColor || "var(--primary-color)" } : {}}
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}

            {/* ── Multiple Choice (checkbox) ── */}
            {(question.type === "multiple_choice" || question.type === "checkbox") && (
              <div className="space-y-2">
                {(question.options || []).map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    style={(answers[question.id] || []).includes(option) ? { borderColor: survey.themeColor || "var(--primary-color)", backgroundColor: `${survey.themeColor || "var(--primary-color)"}08` } : {}}
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
                          handleAnswer(question.id, currentAnswers.filter((a) => a !== option))
                        }
                      }}
                      className="w-4 h-4 rounded accent-[var(--primary-color)]"
                    />
                    <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* ── Single Choice (radio) ── */}
            {(question.type === "single_choice" || question.type === "radio") && (
              <div className="space-y-2">
                {(question.options || []).map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    style={answers[question.id] === option ? { borderColor: survey.themeColor || "var(--primary-color)", backgroundColor: `${survey.themeColor || "var(--primary-color)"}08` } : {}}
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

            {/* ── Yes/No ── */}
            {question.type === "yesno" && (
              <div className="flex gap-3">
                {["Yes", "No"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(question.id, option)}
                    className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200
                      ${answers[question.id] === option
                        ? "text-white border-transparent"
                        : "border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10"
                      }`}
                    style={answers[question.id] === option ? { backgroundColor: survey.themeColor || "var(--primary-color)" } : {}}
                  >
                    {option === "Yes" ? "✅ " : "❌ "}{option}
                  </button>
                ))}
              </div>
            )}

            {/* ── Dropdown Select ── */}
            {question.type === "select" && (
              <select
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                           bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]
                           text-[var(--light-text)] dark:text-[var(--dark-text)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)]
                           transition-all duration-200"
              >
                <option value="">Select an option...</option>
                {(question.options || []).map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            )}

            {/* ── Short Text ── */}
            {(question.type === "text" || question.type === "text_short") && (
              <input
                type="text"
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="Enter your response..."
                className="w-full px-4 py-3 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                           bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]
                           text-[var(--light-text)] dark:text-[var(--dark-text)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)]
                           transition-all duration-200"
              />
            )}

            {/* ── Long Text (textarea) ── */}
            {(question.type === "textarea" || question.type === "text_long") && (
              <textarea
                rows={4}
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="Enter your detailed response..."
                className="w-full px-4 py-3 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                           bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]
                           text-[var(--light-text)] dark:text-[var(--dark-text)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)]
                           transition-all duration-200 resize-y"
              />
            )}

            {/* ── Numeric Input ── */}
            {question.type === "numeric" && (
              <input
                type="number"
                value={answers[question.id] ?? ""}
                onChange={(e) => handleAnswer(question.id, e.target.value ? Number(e.target.value) : "")}
                placeholder="Enter a number..."
                className="w-full px-4 py-3 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                           bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]
                           text-[var(--light-text)] dark:text-[var(--dark-text)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)]
                           transition-all duration-200"
              />
            )}

            {/* ── Email Input ── */}
            {question.type === "email" && (
              <input
                type="email"
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                           bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]
                           text-[var(--light-text)] dark:text-[var(--dark-text)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)]
                           transition-all duration-200"
              />
            )}

            {/* ── Date Picker ── */}
            {question.type === "date" && (
              <input
                type="date"
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                           bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]
                           text-[var(--light-text)] dark:text-[var(--dark-text)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)]
                           transition-all duration-200"
              />
            )}

            {/* ── Time Picker ── */}
            {question.type === "time" && (
              <input
                type="time"
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                           bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]
                           text-[var(--light-text)] dark:text-[var(--dark-text)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)]
                           transition-all duration-200"
              />
            )}

            {/* ── DateTime Picker ── */}
            {question.type === "datetime" && (
              <input
                type="datetime-local"
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                           bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]
                           text-[var(--light-text)] dark:text-[var(--dark-text)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)]
                           transition-all duration-200"
              />
            )}
          </div>
        </div>

        {/* ── Navigation ──────────────────────────────────────── */}
        <div className="card border-0 shadow-sm rounded-xl p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={prevQuestion}
              disabled={stackPosition === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                         border border-[var(--light-border)] dark:border-[var(--dark-border)]
                         text-[var(--light-text)] dark:text-[var(--dark-text)]
                         hover:bg-gray-50 dark:hover:bg-gray-800
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <MdArrowBack />
              Previous
            </button>

            {isLastQuestion ? (
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
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{ backgroundColor: survey.themeColor || "var(--primary-color)" }}
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
