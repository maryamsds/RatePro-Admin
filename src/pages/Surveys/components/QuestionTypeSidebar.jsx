// src/pages/Surveys/components/QuestionTypeSidebar.jsx
// ============================================================================
// Question type palette sidebar — shows all available question types grouped
// by category. Clicking a type adds a new question of that type.
// Extracted from SurveyBuilder.jsx renderSurveyDetailsStep (L1906-1948).
// ============================================================================

import React from 'react';
import { MdAdd } from 'react-icons/md';

const QuestionTypeSidebar = ({ questionTypes, onAddQuestion }) => {
    const categories = ['choice', 'rating', 'text', 'input', 'advanced'];

    return (
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-xl shadow-sm sticky top-4">
            <div className="flex items-center p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] font-semibold">
                <MdAdd className="mr-2" />
                <strong>Add Questions</strong>
            </div>
            <div className="p-0">
                {categories.map((category, idx) => {
                    const items = questionTypes.filter(qt => qt.category === category);
                    if (items.length === 0) return null;

                    return (
                        <details key={category} open={idx === 0}>
                            <summary className="cursor-pointer px-3 py-2.5 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-gray-50 dark:hover:bg-gray-800/50 font-semibold text-sm capitalize">
                                {category} Questions
                            </summary>
                            <div className="p-2">
                                {items.map(questionType => (
                                    <div
                                        key={questionType.id}
                                        className="mb-2 cursor-pointer rounded-lg hover:bg-[var(--light-hover)]/10 dark:hover:bg-[var(--dark-hover)]/10 transition-colors p-3 border border-[var(--light-border)] dark:border-[var(--dark-border)]"
                                        onClick={() => onAddQuestion(questionType.id)}
                                    >
                                        <div>
                                            <div className="flex items-center mb-2">
                                                <questionType.icon
                                                    size={20}
                                                    style={{ color: questionType.color }}
                                                    className="mr-2"
                                                />
                                                <strong className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                                    {questionType.name}
                                                </strong>
                                            </div>
                                            <p className="text-[var(--text-secondary)] text-sm mb-1">
                                                {questionType.description}
                                            </p>
                                            <div className="text-[var(--text-secondary)]" style={{ fontSize: '0.75rem' }}>
                                                {questionType.example}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </details>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionTypeSidebar;
