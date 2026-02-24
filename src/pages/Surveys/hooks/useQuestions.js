// src/pages/Surveys/hooks/useQuestions.js
// ============================================================================
// Custom hook for managing survey questions state and CRUD operations.
// Extracted from SurveyBuilder.jsx monolith to enable reuse and testability.
// ============================================================================

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';

/**
 * @param {Array} questionTypes - Available question type definitions
 * @param {Array} initialQuestions - Optional initial questions array
 * @returns {Object} Question state + CRUD operations
 */
const useQuestions = (questionTypes = [], initialQuestions = []) => {
    const [questions, setQuestions] = useState(initialQuestions);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [questionModalMode, setQuestionModalMode] = useState('create');

    const addQuestion = useCallback((type) => {
        const questionType = questionTypes.find(qt => qt.id === type);
        if (!questionType) return;

        let defaultOptions = [];
        if (type === 'single_choice' || type === 'multiple_choice' || type === 'radio' || type === 'checkbox') {
            defaultOptions = ['Option 1', 'Option 2', 'Option 3'];
        } else if (type === 'yes_no' || type === 'yesno') {
            defaultOptions = ['Yes', 'No'];
        } else if (type === 'likert') {
            defaultOptions = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
        }

        const newQuestion = {
            id: uuidv4(),  // UUID instead of Date.now()
            type,
            title: `New ${questionType.name}`,
            questionText: `New ${questionType.name}`,
            description: '',
            required: false,
            options: defaultOptions,
            logicRules: [],
            defaultNextQuestionId: null,
            settings: type === 'rating' ? { scale: 5 } : type === 'nps' ? { scale: 10 } : {}
        };

        setQuestions(prev => [...prev, newQuestion]);
        setSelectedQuestion(newQuestion);
        setQuestionModalMode('create');
        setShowQuestionModal(true);
    }, [questionTypes]);

    const updateQuestion = useCallback((questionId, updates) => {
        setQuestions(prev => prev.map(q =>
            q.id === questionId ? { ...q, ...updates } : q
        ));
    }, []);

    const deleteQuestion = useCallback((questionId) => {
        Swal.fire({
            title: 'Delete Question?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--bs-danger)',
            cancelButtonColor: 'var(--bs-secondary)',
            confirmButtonText: 'Yes, Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                setQuestions(prev => prev.filter(q => q.id !== questionId));
            }
        });
    }, []);

    const duplicateQuestion = useCallback((question) => {
        const duplicated = {
            ...question,
            id: uuidv4(),
            title: `${question.title} (Copy)`,
            questionText: `${question.title || question.questionText} (Copy)`,
            logicRules: [], // Don't copy logic rules — they reference other question IDs
            defaultNextQuestionId: null
        };
        setQuestions(prev => [...prev, duplicated]);
    }, []);

    const handleOnDragEnd = useCallback((result) => {
        if (!result.destination) return;
        setQuestions(prev => {
            const items = Array.from(prev);
            const [reorderedItem] = items.splice(result.source.index, 1);
            items.splice(result.destination.index, 0, reorderedItem);
            return items;
        });
    }, []);

    // Logic rule management (per-question branching)
    const addLogicRule = useCallback((questionId, rule) => {
        setQuestions(prev => prev.map(q => {
            if (q.id !== questionId) return q;
            const rules = [...(q.logicRules || []), rule];
            if (rules.length > 10) return q; // Soft limit
            return { ...q, logicRules: rules };
        }));
    }, []);

    const removeLogicRule = useCallback((questionId, ruleIndex) => {
        setQuestions(prev => prev.map(q => {
            if (q.id !== questionId) return q;
            return {
                ...q,
                logicRules: (q.logicRules || []).filter((_, i) => i !== ruleIndex)
            };
        }));
    }, []);

    const updateLogicRule = useCallback((questionId, ruleIndex, updatedRule) => {
        setQuestions(prev => prev.map(q => {
            if (q.id !== questionId) return q;
            const rules = [...(q.logicRules || [])];
            rules[ruleIndex] = updatedRule;
            return { ...q, logicRules: rules };
        }));
    }, []);

    const setDefaultNextQuestion = useCallback((questionId, nextQuestionId) => {
        setQuestions(prev => prev.map(q =>
            q.id === questionId ? { ...q, defaultNextQuestionId: nextQuestionId } : q
        ));
    }, []);

    // Open edit modal for a question
    const openEditModal = useCallback((question) => {
        setSelectedQuestion(question);
        setQuestionModalMode('edit');
        setShowQuestionModal(true);
    }, []);

    const closeQuestionModal = useCallback(() => {
        setShowQuestionModal(false);
        setSelectedQuestion(null);
    }, []);

    return {
        // State
        questions,
        setQuestions,
        selectedQuestion,
        setSelectedQuestion,
        showQuestionModal,
        setShowQuestionModal,
        questionModalMode,
        setQuestionModalMode,

        // CRUD operations
        addQuestion,
        updateQuestion,
        deleteQuestion,
        duplicateQuestion,
        handleOnDragEnd,

        // Logic rule operations
        addLogicRule,
        removeLogicRule,
        updateLogicRule,
        setDefaultNextQuestion,

        // Modal helpers
        openEditModal,
        closeQuestionModal
    };
};

export default useQuestions;
