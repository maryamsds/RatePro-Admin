// src/pages/Surveys/components/QuestionCard.jsx
// ============================================================================
// Single question card with type icon, title, options preview, required badge,
// logic rules badge, drag handle, and action buttons (edit/duplicate/delete).
// Extracted from SurveyBuilder.jsx renderSurveyDetailsStep.
// ============================================================================

import React from 'react';
import {
    MdDragHandle,
    MdEdit,
    MdContentCopy,
    MdDelete,
    MdCode
} from 'react-icons/md';

const QuestionCard = ({
    question,
    index,
    questionTypes,
    provided,
    snapshot,
    onEdit,
    onDuplicate,
    onDelete
}) => {
    const questionType = questionTypes.find(qt => qt.id === question.type);
    const hasLogicRules = question.logicRules && question.logicRules.length > 0;

    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`question-item p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] ${snapshot.isDragging ? 'dragging' : ''}`}
        >
            <div className="flex items-start">
                <div
                    {...provided.dragHandleProps}
                    className="drag-handle mr-3 mt-1"
                >
                    <MdDragHandle className="text-muted" />
                </div>

                <div className="flex-grow">
                    <div className="flex items-center mb-2">
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-800 mr-2">
                            Q{index + 1}
                        </span>
                        {questionType && (
                            <>
                                {React.createElement(
                                    questionType.icon,
                                    {
                                        size: 16,
                                        className: 'mr-2',
                                        style: { color: questionType.color }
                                    }
                                )}
                                <small className="text-muted mr-3">
                                    {questionType.name}
                                </small>
                            </>
                        )}
                        {question.required && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-800 mr-2">Required</span>
                        )}
                        {hasLogicRules && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800 mr-2">
                                <MdCode size={10} className="inline mr-1" />
                                {question.logicRules.length} rule{question.logicRules.length > 1 ? 's' : ''}
                            </span>
                        )}
                        {question.defaultNextQuestionId && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800 mr-2">
                                Else→Jump
                            </span>
                        )}
                    </div>

                    <h6 className="font-semibold mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        {question.title || question.questionText}
                    </h6>
                    {question.description && (
                        <p className="text-[var(--text-secondary)] text-sm mb-2">{question.description}</p>
                    )}

                    {question.options && question.options.length > 0 && (
                        <div className="mt-2">
                            {(question.type === 'single_choice' || question.type === 'multiple_choice' ||
                                question.type === 'radio' || question.type === 'checkbox') ? (
                                <div className="flex gap-2 flex-wrap">
                                    {question.options.slice(0, 3).map((option, idx) => (
                                        <span key={idx} className="px-2 py-0.5 text-xs rounded border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                            {option}
                                        </span>
                                    ))}
                                    {question.options.length > 3 && (
                                        <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-500">
                                            +{question.options.length - 3} more
                                        </span>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                <div className="flex gap-1 ml-3">
                    <button
                        type="button"
                        onClick={() => onEdit(question)}
                        className="p-1.5 border border-[var(--primary-color)] text-[var(--primary-color)] rounded hover:bg-[var(--primary-color)] hover:text-white transition-colors"
                    >
                        <MdEdit size={14} />
                    </button>

                    <button
                        type="button"
                        onClick={() => onDuplicate(question)}
                        className="p-1.5 border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--text-secondary)] rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <MdContentCopy size={14} />
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete(question.id)}
                        className="p-1.5 border border-red-300 text-red-500 rounded hover:bg-red-50 transition-colors"
                    >
                        <MdDelete size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;
